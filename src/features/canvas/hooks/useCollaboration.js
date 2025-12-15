import { useEffect, useRef, useCallback, useState } from 'react';
import collaborationService from '../../../services/collaboration';
import * as Y from 'yjs';

/**
 * Hook for real-time collaboration features
 * Integrates Yjs document sync with MainPage elements
 */
const useCollaboration = ({
  boardId,
  currentUser,
  pages,
  setPages,
  currentPage,
  getCurrentPageElements,
  setCurrentPageElements,
  addElement,
  updateElement,
  deleteElement,
  isCollaborative = false
}) => {
  const [activeUsers, setActiveUsers] = useState([]);
  const [cursors, setCursors] = useState(new Map());
  const [isConnected, setIsConnected] = useState(false);
  
  const yDocRef = useRef(null);
  const isInitializedRef = useRef(false);
  const lastUpdateRef = useRef(null);
  const lastSyncRef = useRef(null);
  const isApplyingRemoteChangeRef = useRef(false);
  const pendingLocalElementsRef = useRef(new Set()); // Track elements added locally but not yet synced
  const lastLocalSyncTimeRef = useRef(0); // Track when we last synced local changes

  // Initialize collaboration connection
  useEffect(() => {
    if (!isCollaborative || !boardId || !currentUser) {
      return;
    }

    console.log('🔗 Initializing collaboration for board:', boardId);

    // Connect to collaboration service
    collaborationService.connect(
      boardId,
      currentUser.uid,
      currentUser.displayName || currentUser.email || 'Anonymous',
      currentUser.email || ''
    );

    // Get Yjs document
    const yDoc = collaborationService.getYDoc();
    yDocRef.current = yDoc;

    // Create Yjs Text for storing page data as JSON
    const pagesText = yDoc.getText('pages');

    // Listen to collaboration events
    const handleActiveUsers = (users) => {
      console.log('👥 Received active users list:', users?.length || 0, 'users');
      if (Array.isArray(users)) {
        // Don't filter out current user - show all users including initiator
        // This ensures other users can see the first user who initiated collaboration
        const allUsers = users.filter(u => u && (u.userId || u.userEmail || u.socketId));
        console.log('👥 Setting active users (including current user):', allUsers.length);
        setActiveUsers(allUsers);
      } else {
        setActiveUsers([]);
      }
    };

    const handleUserJoined = (user) => {
      console.log('👤 User joined:', user);
      setActiveUsers(prev => {
        // Avoid duplicates - check by socketId or userId
        const exists = prev.find(u => 
          u.socketId === user.socketId || 
          (u.userId && user.userId && u.userId === user.userId) ||
          (u.userEmail && user.userEmail && u.userEmail === user.userEmail)
        );
        if (exists) {
          console.log('👤 User already in list, updating:', user.userName);
          // Update existing user
          return prev.map(u => 
            (u.socketId === user.socketId || 
             (u.userId && user.userId && u.userId === user.userId)) 
              ? { ...u, ...user } 
              : u
          );
        }
        console.log('👤 Adding new user to list:', user.userName);
        return [...prev, user];
      });
    };

    const handleUserLeft = (data) => {
      console.log('👋 User left:', data);
      setActiveUsers(prev => prev.filter(u => 
        u.socketId !== data.socketId &&
        !(data.userId && u.userId === data.userId) &&
        !(data.userEmail && u.userEmail === data.userEmail)
      ));
      setCursors(prev => {
        const newCursors = new Map(prev);
        // Remove cursor by socketId, userId, or userEmail
        for (const [key, cursor] of prev.entries()) {
          if (key === data.socketId ||
              (data.userId && cursor.userId === data.userId) ||
              (data.userEmail && cursor.userEmail === data.userEmail)) {
            newCursors.delete(key);
          }
        }
        return newCursors;
      });
    };

    const handleCursorUpdate = (data) => {
      // Don't show own cursor
      if (currentUser && (
        (data.userId && data.userId === currentUser.uid) ||
        (data.userEmail && data.userEmail === currentUser.email)
      )) {
        return;
      }
      
      setCursors(prev => {
        const newCursors = new Map(prev);
        if (data.socketId && data.cursor && 
            data.cursor.x !== undefined && data.cursor.y !== undefined &&
            !isNaN(data.cursor.x) && !isNaN(data.cursor.y)) {
          newCursors.set(data.socketId, {
            x: data.cursor.x,
            y: data.cursor.y,
            userName: data.userName || 'Anonymous',
            color: data.color || '#6366f1',
            userId: data.userId,
            userEmail: data.userEmail
          });
        }
        return newCursors;
      });
    };

    const handleSynced = () => {
      console.log('✅ Board synced');
      setIsConnected(true);
      // Sync local state to Yjs first to ensure first user's changes are visible
      setTimeout(() => {
        syncToYjs();
        // Then sync from Yjs to get any remote changes
        setTimeout(() => {
          syncFromYjs();
        }, 50);
      }, 100);
    };

    const handleUpdate = () => {
      console.log('🔄 Board update received');
      // Only sync from Yjs if we're not in the middle of applying local changes
      // This prevents overwriting local changes that are being synced
      if (!isApplyingRemoteChangeRef.current) {
        syncFromYjs();
      }
    };

    const handleConnected = () => {
      console.log('✅ Connected to collaboration server');
      setIsConnected(true);
      
      // Request active users list after connection
      setTimeout(() => {
        if (collaborationService.isConnected()) {
          // The server should send active-users on join, but we can request it
          console.log('📡 Requesting active users list...');
        }
      }, 500);
    };

    const handleDisconnected = () => {
      console.log('❌ Disconnected from collaboration server');
      setIsConnected(false);
    };

    // Register event listeners
    collaborationService.on('active-users', handleActiveUsers);
    collaborationService.on('user-joined', handleUserJoined);
    collaborationService.on('user-left', handleUserLeft);
    collaborationService.on('cursor-update', handleCursorUpdate);
    collaborationService.on('synced', handleSynced);
    collaborationService.on('update', handleUpdate);
    collaborationService.on('connected', handleConnected);
    collaborationService.on('disconnected', handleDisconnected);

    // Sync initial state to Yjs after connection is established
    // This ensures first user's changes are visible to others
    if (!isInitializedRef.current) {
      // Wait for connection before initial sync
      const initSync = () => {
        if (collaborationService.isConnected()) {
          syncToYjs();
          isInitializedRef.current = true;
        } else {
          // Retry after connection
          setTimeout(initSync, 100);
        }
      };
      initSync();
    }

    // Observe Yjs changes - debounce to avoid too many syncs
    // Only sync from Yjs if we're not applying remote changes
    let syncTimeout;
    const observer = () => {
      clearTimeout(syncTimeout);
      syncTimeout = setTimeout(() => {
        // Only sync from remote if we're not in the middle of a local sync
        if (!isApplyingRemoteChangeRef.current) {
          syncFromYjs();
        }
      }, 200);
    };
    
    pagesText.observe(observer);

    return () => {
      clearTimeout(syncTimeout);
      pagesText.unobserve(observer);
      collaborationService.off('active-users', handleActiveUsers);
      collaborationService.off('user-joined', handleUserJoined);
      collaborationService.off('user-left', handleUserLeft);
      collaborationService.off('cursor-update', handleCursorUpdate);
      collaborationService.off('synced', handleSynced);
      collaborationService.off('update', handleUpdate);
      collaborationService.off('connected', handleConnected);
      collaborationService.off('disconnected', handleDisconnected);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId, currentUser, isCollaborative]);

  // Sync local state to Yjs
  const syncToYjs = useCallback(() => {
    // Don't block sync on remote changes - allow local updates to go through
    // This ensures drawing/dragging and adding multiple shapes works smoothly
    // The isApplyingRemoteChangeRef flag is only used to prevent sync loops in syncFromYjs, not block local actions
    
    if (!yDocRef.current || !pages || !isCollaborative) return;

    try {
      // Store page data as JSON for easier access
      const pagesData = pages.map(page => ({
        id: page.id,
        name: page.name,
        elements: page.elements || [],
        timestamp: Date.now()
      }));
      
      // Validate data before stringifying
      const newData = JSON.stringify(pagesData);
      
      // Use Yjs Text to store JSON data
      const pagesText = yDocRef.current.getText('pages');
      const currentData = pagesText.toString();
      
      // Only update if data has changed (avoid infinite loops)
      // But don't check lastSyncRef here - let it update to allow initiator to see changes
      if (currentData !== newData) {
        // Use transaction to ensure atomic update and prevent JSON corruption
        yDocRef.current.transact(() => {
          pagesText.delete(0, pagesText.length);
          pagesText.insert(0, newData);
        });
        
        // Update lastSyncRef after successful sync
        lastSyncRef.current = newData;
        lastLocalSyncTimeRef.current = Date.now();
        
        // Clear pending elements since they're now synced
        pendingLocalElementsRef.current.clear();
        
        // Send update to server
        const update = Y.encodeStateAsUpdate(yDocRef.current);
        collaborationService.sendUpdate(update);
        
        console.log('✅ Synced to Yjs:', { pageCount: pagesData.length, currentPage, elementCount: pagesData[0]?.elements?.length || 0 });
      }
    } catch (error) {
      console.error('Error syncing to Yjs:', error);
      // Reset flag on error
      isApplyingRemoteChangeRef.current = false;
    }
  }, [pages, currentPage, isCollaborative]);

  // Sync from Yjs to local state
  const syncFromYjs = useCallback(() => {
    if (!yDocRef.current || !setPages) return;

    // Don't sync from remote if we just synced local changes recently (within 200ms)
    // This prevents overwriting local changes that are in the process of being synced
    const timeSinceLastLocalSync = Date.now() - lastLocalSyncTimeRef.current;
    if (timeSinceLastLocalSync < 200) {
      console.log('⏸️ Skipping remote sync - local changes pending');
      return;
    }

    try {
      const pagesText = yDocRef.current.getText('pages');
      const pagesDataStr = pagesText.toString();
      
      // Skip if this is the same data we already processed
      if (pagesDataStr === lastSyncRef.current && lastSyncRef.current) {
        return;
      }
      
      // Always process updates from Yjs, even if they match lastSyncRef
      // This ensures the initiator can see their own changes reflected back
      if (pagesDataStr) {
        // Validate JSON before parsing to prevent errors
        let remotePages;
        try {
          // Try to parse the JSON
          remotePages = JSON.parse(pagesDataStr);
          
          // Validate it's an array
          if (!Array.isArray(remotePages)) {
            console.warn('⚠️ Invalid pages data format, expected array');
            isApplyingRemoteChangeRef.current = false;
            return;
          }
        } catch (parseError) {
          console.error('❌ JSON parse error in syncFromYjs:', parseError);
          console.error('❌ Problematic JSON (first 500 chars):', pagesDataStr.substring(0, 500));
          // If JSON is corrupted, try to recover by using last known good state
          // Don't update lastSyncRef so we can retry on next update
          isApplyingRemoteChangeRef.current = false;
          return;
        }
        
        // Set flag to prevent sync loop
        isApplyingRemoteChangeRef.current = true;
        
        // Merge with local pages, properly merging elements
        setPages(prevPages => {
          let hasChanges = false;
          const updatedPages = prevPages.map(localPage => {
            const remotePage = remotePages.find(rp => rp.id === localPage.id);
            if (remotePage) {
              // Merge elements - combine unique elements from both local and remote
              const localElements = localPage.elements || [];
              const remoteElements = remotePage.elements || [];
              
              // Create a map of elements by ID for efficient lookup
              const elementMap = new Map();
              
              // Add local elements first - this preserves local changes that haven't been synced yet
              localElements.forEach(el => {
                elementMap.set(el.id, el);
              });
              
              // Add/update with remote elements (remote takes precedence for same ID)
              // This ensures remote updates are applied, but local elements are preserved
              remoteElements.forEach(el => {
                // Only update if the element exists in local, otherwise add it
                // This prevents overwriting local elements that are being synced
                if (elementMap.has(el.id)) {
                  // Remote takes precedence for existing elements (updates from other users)
                  elementMap.set(el.id, el);
                } else {
                  // New element from remote - add it
                  elementMap.set(el.id, el);
                }
              });
              
              // Convert back to array
              const mergedElements = Array.from(elementMap.values());
              
              // Check if there are actual changes
              const localStr = JSON.stringify(localElements);
              const mergedStr = JSON.stringify(mergedElements);
              
              if (localStr !== mergedStr) {
                hasChanges = true;
                console.log('🔄 Merging remote elements:', {
                  localCount: localElements.length,
                  remoteCount: remoteElements.length,
                  mergedCount: mergedElements.length
                });
                
                return {
                  ...localPage,
                  elements: mergedElements,
                  lastSync: remotePage.timestamp || Date.now()
                };
              }
            }
            return localPage;
          });
          
          // Add any new pages from remote
          remotePages.forEach(remotePage => {
            if (!updatedPages.find(p => p.id === remotePage.id)) {
              hasChanges = true;
              updatedPages.push({
                id: remotePage.id,
                name: remotePage.name || `Page ${updatedPages.length + 1}`,
                elements: remotePage.elements || [],
                lastSync: remotePage.timestamp || Date.now()
              });
            }
          });
          
          // Only update if there are actual changes
          if (hasChanges) {
            return updatedPages;
          }
          return prevPages;
        });

        // Update current page elements if needed
        const currentPageData = remotePages.find(p => p.id === currentPage);
        if (currentPageData && currentPageData.elements) {
          const currentElements = getCurrentPageElements();
          const remoteElements = currentPageData.elements || [];
          
          // Merge elements for current page - preserve local elements
          const elementMap = new Map();
          // Add local elements first to preserve them
          currentElements.forEach(el => elementMap.set(el.id, el));
          // Then add/update with remote elements
          remoteElements.forEach(el => {
            if (elementMap.has(el.id)) {
              // Remote takes precedence for existing elements
              elementMap.set(el.id, el);
            } else {
              // New element from remote
              elementMap.set(el.id, el);
            }
          });
          const mergedElements = Array.from(elementMap.values());
          
          const currentStr = JSON.stringify(currentElements);
          const mergedStr = JSON.stringify(mergedElements);
          
          if (currentStr !== mergedStr) {
            console.log('🔄 Updating current page elements from remote');
            setCurrentPageElements(mergedElements);
          }
        }
        
        // Update lastSyncRef to the current state after processing
        // This prevents duplicate processing but allows new changes to come through
        lastSyncRef.current = pagesDataStr;
        
        // Reset flag after a short delay to allow state updates to complete
        setTimeout(() => {
          isApplyingRemoteChangeRef.current = false;
        }, 100);
      }
    } catch (error) {
      console.error('Error syncing from Yjs:', error);
      isApplyingRemoteChangeRef.current = false;
    }
  }, [currentPage, getCurrentPageElements, setCurrentPageElements, setPages]);

  // Track cursor movement (throttled)
  const handleCursorMove = useCallback((x, y) => {
    if (!isCollaborative || !collaborationService.isConnected()) return;
    
    // Throttle cursor updates to avoid too many messages
    if (!lastUpdateRef.current || Date.now() - lastUpdateRef.current > 50) {
      // Send cursor position
      collaborationService.sendCursor(x, y);
      lastUpdateRef.current = Date.now();
    }
  }, [isCollaborative]);

  // Sync element changes when pages change
  useEffect(() => {
    if (!isCollaborative || !isInitializedRef.current) return;
    
    // Track newly added elements to prevent them from being lost during sync
    const currentElements = getCurrentPageElements();
    currentElements.forEach(el => {
      // Mark elements as pending if they're new (not in pending set yet)
      // This helps us preserve them during remote sync
      if (!pendingLocalElementsRef.current.has(el.id)) {
        // Check if this element exists in the last synced state
        // If not, it's a new local element
        const lastSyncedData = lastSyncRef.current;
        if (lastSyncedData) {
          try {
            const lastSyncedPages = JSON.parse(lastSyncedData);
            const lastSyncedPage = lastSyncedPages.find(p => p.id === currentPage);
            const lastSyncedElements = lastSyncedPage?.elements || [];
            const existsInLastSync = lastSyncedElements.some(se => se.id === el.id);
            if (!existsInLastSync) {
              pendingLocalElementsRef.current.add(el.id);
            }
          } catch (e) {
            // If we can't parse, assume it's new
            pendingLocalElementsRef.current.add(el.id);
          }
        } else {
          // No last sync, assume it's new
          pendingLocalElementsRef.current.add(el.id);
        }
      }
    });
    
    // Debounce sync to avoid too many updates, but make it faster for real-time feel
    // Use shorter debounce for text editing (100ms) vs shapes (200ms)
    const timeoutId = setTimeout(() => {
      syncToYjs();
    }, 150); // Slightly increased to allow multiple rapid additions

    return () => clearTimeout(timeoutId);
  }, [pages, syncToYjs, isCollaborative, currentPage, getCurrentPageElements]);

  // Sync when current page elements change - watch for element count changes
  useEffect(() => {
    if (!isCollaborative || !isInitializedRef.current) return;
    
    // Sync immediately when elements are added/removed, debounce for updates
    // Use shorter debounce for faster real-time sync
    const timeoutId = setTimeout(() => {
      syncToYjs();
    }, 100); // Reduced from 200ms for faster sync

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, isCollaborative]);

  return {
    activeUsers,
    cursors,
    isConnected,
    handleCursorMove,
    syncToYjs,
    syncFromYjs
  };
};

export default useCollaboration;

