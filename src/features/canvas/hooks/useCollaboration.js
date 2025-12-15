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
        // Filter out current user from the list (we'll add them separately)
        const otherUsers = users.filter(u => 
          u.userId !== currentUser?.uid && 
          u.userEmail !== currentUser?.email
        );
        console.log('👥 Setting active users:', otherUsers.length);
        setActiveUsers(otherUsers);
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
      setActiveUsers(prev => prev.filter(u => u.socketId !== data.socketId));
      setCursors(prev => {
        const newCursors = new Map(prev);
        newCursors.delete(data.socketId);
        return newCursors;
      });
    };

    const handleCursorUpdate = (data) => {
      setCursors(prev => {
        const newCursors = new Map(prev);
        // Don't show own cursor
        if (data.socketId && data.cursor) {
          newCursors.set(data.socketId, {
            x: data.cursor.x,
            y: data.cursor.y,
            userName: data.userName || 'Anonymous',
            color: data.color || '#6366f1',
            userId: data.userId
          });
        }
        return newCursors;
      });
    };

    const handleSynced = () => {
      console.log('✅ Board synced');
      setIsConnected(true);
      syncFromYjs();
    };

    const handleUpdate = () => {
      console.log('🔄 Board update received');
      syncFromYjs();
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

    // Sync initial state to Yjs
    if (!isInitializedRef.current) {
      syncToYjs();
      isInitializedRef.current = true;
    }

    // Observe Yjs changes - debounce to avoid too many syncs
    let syncTimeout;
    const observer = () => {
      clearTimeout(syncTimeout);
      syncTimeout = setTimeout(() => {
        syncFromYjs();
      }, 150);
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
    // Don't sync if we're currently applying a remote change
    if (isApplyingRemoteChangeRef.current) {
      return;
    }
    
    if (!yDocRef.current || !pages || !isCollaborative) return;

    try {
      // Store page data as JSON for easier access
      const pagesData = pages.map(page => ({
        id: page.id,
        name: page.name,
        elements: page.elements || [],
        timestamp: Date.now()
      }));
      
      // Use Yjs Text to store JSON data
      const pagesText = yDocRef.current.getText('pages');
      const currentData = pagesText.toString();
      const newData = JSON.stringify(pagesData);
      
      // Only update if data has changed (avoid infinite loops)
      if (currentData !== newData && newData !== lastSyncRef.current) {
        pagesText.delete(0, pagesText.length);
        pagesText.insert(0, newData);
        lastSyncRef.current = newData;
        
        // Send update to server
        const update = Y.encodeStateAsUpdate(yDocRef.current);
        collaborationService.sendUpdate(update);
        
        console.log('✅ Synced to Yjs:', { pageCount: pagesData.length, currentPage, elementCount: pagesData[0]?.elements?.length || 0 });
      }
    } catch (error) {
      console.error('Error syncing to Yjs:', error);
    }
  }, [pages, currentPage, isCollaborative]);

  // Sync from Yjs to local state
  const syncFromYjs = useCallback(() => {
    if (!yDocRef.current || !setPages) return;

    try {
      const pagesText = yDocRef.current.getText('pages');
      const pagesDataStr = pagesText.toString();
      
      if (pagesDataStr && pagesDataStr !== lastSyncRef.current) {
        const remotePages = JSON.parse(pagesDataStr);
        
        // Set flag to prevent sync loop
        isApplyingRemoteChangeRef.current = true;
        
        // Merge with local pages, properly merging elements
        setPages(prevPages => {
          const updatedPages = prevPages.map(localPage => {
            const remotePage = remotePages.find(rp => rp.id === localPage.id);
            if (remotePage) {
              // Merge elements - combine unique elements from both local and remote
              const localElements = localPage.elements || [];
              const remoteElements = remotePage.elements || [];
              
              // Create a map of elements by ID for efficient lookup
              const elementMap = new Map();
              
              // Add local elements first
              localElements.forEach(el => {
                elementMap.set(el.id, el);
              });
              
              // Add/update with remote elements (remote takes precedence for same ID)
              remoteElements.forEach(el => {
                elementMap.set(el.id, el);
              });
              
              // Convert back to array
              const mergedElements = Array.from(elementMap.values());
              
              // Only update if there are actual changes
              const localStr = JSON.stringify(localElements);
              const mergedStr = JSON.stringify(mergedElements);
              
              if (localStr !== mergedStr) {
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
              updatedPages.push({
                id: remotePage.id,
                name: remotePage.name || `Page ${updatedPages.length + 1}`,
                elements: remotePage.elements || [],
                lastSync: remotePage.timestamp || Date.now()
              });
            }
          });
          
          return updatedPages;
        });

        // Update current page elements if needed
        const currentPageData = remotePages.find(p => p.id === currentPage);
        if (currentPageData && currentPageData.elements) {
          const currentElements = getCurrentPageElements();
          const remoteElements = currentPageData.elements || [];
          
          // Merge elements for current page
          const elementMap = new Map();
          currentElements.forEach(el => elementMap.set(el.id, el));
          remoteElements.forEach(el => elementMap.set(el.id, el));
          const mergedElements = Array.from(elementMap.values());
          
          const currentStr = JSON.stringify(currentElements);
          const mergedStr = JSON.stringify(mergedElements);
          
          if (currentStr !== mergedStr) {
            console.log('🔄 Updating current page elements from remote');
            setCurrentPageElements(mergedElements);
          }
        }
        
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
    
    // Debounce sync to avoid too many updates, but make it faster for real-time feel
    const timeoutId = setTimeout(() => {
      syncToYjs();
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [pages, syncToYjs, isCollaborative]);

  // Sync when current page elements change - watch for element count changes
  useEffect(() => {
    if (!isCollaborative || !isInitializedRef.current) return;
    
    // Sync immediately when elements are added/removed, debounce for updates
    const timeoutId = setTimeout(() => {
      syncToYjs();
    }, 200);

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

