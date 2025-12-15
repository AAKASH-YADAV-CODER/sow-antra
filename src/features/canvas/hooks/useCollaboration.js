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
      setActiveUsers(Array.isArray(users) ? users : []);
    };

    const handleUserJoined = (user) => {
      console.log('👤 User joined:', user);
      setActiveUsers(prev => {
        // Avoid duplicates
        const exists = prev.find(u => u.socketId === user.socketId);
        if (exists) return prev;
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

    // Observe Yjs changes
    pagesText.observe(() => {
      syncFromYjs();
    });

    return () => {
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
    if (!yDocRef.current || !pages || !isCollaborative) return;

    try {
      // Store page data as JSON for easier access
      const pagesData = pages.map(page => ({
        id: page.id,
        name: page.name,
        elements: page.elements,
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
        
        console.log('✅ Synced to Yjs:', { pageCount: pagesData.length, currentPage });
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
      
      if (pagesDataStr) {
        const remotePages = JSON.parse(pagesDataStr);
        
        // Merge with local pages, preserving structure
        setPages(prevPages => {
          const updatedPages = prevPages.map(localPage => {
            const remotePage = remotePages.find(rp => rp.id === localPage.id);
            if (remotePage && remotePage.timestamp > (localPage.lastSync || 0)) {
              return {
                ...localPage,
                elements: remotePage.elements || localPage.elements,
                lastSync: remotePage.timestamp
              };
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
                lastSync: remotePage.timestamp
              });
            }
          });
          
          return updatedPages;
        });

        // Update current page elements if needed
        const currentPageData = remotePages.find(p => p.id === currentPage);
        if (currentPageData && currentPageData.elements) {
          const currentElements = getCurrentPageElements();
          // Only update if remote is newer or different
          const currentStr = JSON.stringify(currentElements);
          const remoteStr = JSON.stringify(currentPageData.elements);
          if (currentStr !== remoteStr) {
            console.log('🔄 Syncing remote elements to local state');
            setCurrentPageElements(currentPageData.elements);
          }
        }
      }
    } catch (error) {
      console.error('Error syncing from Yjs:', error);
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

