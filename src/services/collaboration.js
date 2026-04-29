import { io } from 'socket.io-client';
import * as Y from 'yjs';

// Extract WebSocket URL from environment or construct from API URL
const getWebSocketURL = () => {
  if (process.env.REACT_APP_WS_URL) {
    return process.env.REACT_APP_WS_URL.trim();
  }

  // Default to production backend
  const apiUrl = (process.env.REACT_APP_API_URL || 'https://api.sowntra.com').trim();
  // Convert http:// to ws:// for WebSocket connection
  // Ensure we use ws:// for localhost, wss:// for https
  const wsUrl = apiUrl.replace(/^http/, 'ws');
  console.log('🔌 WebSocket URL:', wsUrl);
  return wsUrl;
};

const normalizeSocketOrigin = (rawUrl) => {
  try {
    const parsed = new URL(rawUrl);
    const socketProtocol = parsed.protocol === 'https:'
      ? 'wss:'
      : parsed.protocol === 'http:'
        ? 'ws:'
        : parsed.protocol;

    return `${socketProtocol}//${parsed.host}`;
  } catch (error) {
    console.warn('⚠️ Invalid WebSocket URL, using fallback parser:', rawUrl, error);
    const fallbackUrl = rawUrl.replace(/^http/, 'ws').replace(/\/$/, '');
    return fallbackUrl.split('/socket.io')[0];
  }
};

const WS_URL = getWebSocketURL();

class CollaborationService {
  constructor() {
    this.socket = null;
    this.yDoc = null;
    this.activeUsers = new Map();
    this.listeners = new Map();
    this.currentBoardId = null;
  }

  connect(boardId, userId, userName, userEmail) {
    if (this.socket && this.socket.connected) {
      if (this.currentBoardId === boardId) {
        console.log('✅ Already connected to this board');
        return; // Already connected to this board
      }
      this.disconnect();
    }

    this.currentBoardId = boardId;
    
    // Normalize to protocol + host only.
    // Socket.IO appends /socket.io/ itself via the path option below.
    const wsUrl = normalizeSocketOrigin(WS_URL);
    
    console.log('🔗 Connecting to WebSocket:', wsUrl, 'for board:', boardId);
    
    // Connect to root namespace (default '/')
    // By not specifying a namespace in the URL, we connect to the default namespace '/'
    this.socket = io(wsUrl, {
      path: '/socket.io/',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      forceNew: false, // Don't force new - reuse connection if possible
      // Add query parameters
      query: {
        boardId,
        userId,
        userName,
        userEmail
      },
      autoConnect: true,
      withCredentials: true,
      // Ensure we're using the default namespace (not specifying namespace = root '/')
      // This prevents "Invalid namespace" errors
    });

    // Initialize Yjs document
    this.yDoc = new Y.Doc();

    // Socket connection events
    this.socket.on('connect', () => {
      const namespace = this.socket.nsp?.name || 'unknown';
      console.log('✅ Connected to collaboration server', {
        socketId: this.socket.id,
        boardId,
        userId,
        namespace: namespace
      });
      
      // Verify namespace is correct
      if (namespace !== '/') {
        console.warn('⚠️ Warning: Connected to non-root namespace:', namespace);
      }
      
      // Emit join-board after connection is established
      setTimeout(() => {
        if (this.socket && this.socket.connected) {
          this.emit('join-board', {
            boardId,
            userId,
            userName,
            userEmail
          });
          this.emitEvent('connected');
        }
      }, 100);
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from collaboration server');
      this.emitEvent('disconnected');
    });

    this.socket.on('connect_error', (error) => {
      const errorMsg = error.message || String(error);
      
      // Handle "Invalid namespace" error - this usually happens on initial connection
      if (errorMsg.includes('Invalid namespace')) {
        console.warn('⚠️ Invalid namespace error (this is usually harmless and will retry):', errorMsg);
        // Socket.IO will automatically retry with correct configuration
        // Don't emit error event for this as it's expected during connection establishment
        return;
      }
      
      console.error('❌ Connection error:', errorMsg);
      this.emitEvent('error', { 
        message: errorMsg,
        error: error
      });
    });

    // Board sync events
    this.socket.on('sync-board', (data) => {
      if (data.state) {
        const update = new Uint8Array(data.state);
        Y.applyUpdate(this.yDoc, update);
        this.emitEvent('synced');
      }
    });

    this.socket.on('board-update', (data) => {
      if (data.update) {
        const update = new Uint8Array(data.update);
        Y.applyUpdate(this.yDoc, update);
        this.emitEvent('update', { update });
      }
    });

    // User presence events
    this.socket.on('user-joined', (data) => {
      this.activeUsers.set(data.socketId, {
        userId: data.userId,
        userName: data.userName,
        userEmail: data.userEmail,
        color: data.color,
        socketId: data.socketId
      });
      this.emitEvent('user-joined', data);
    });

    this.socket.on('user-left', (data) => {
      this.activeUsers.delete(data.socketId);
      this.emitEvent('user-left', data);
    });

    this.socket.on('active-users', (data) => {
      console.log('📋 Received active users list:', data.users?.length || 0, 'users', data.users);
      // Clear and update active users
      this.activeUsers.clear();
      if (data.users && Array.isArray(data.users)) {
        data.users.forEach(user => {
          const key = user.socketId || user.userId || user.userEmail;
          if (key) {
            this.activeUsers.set(key, {
              ...user,
              socketId: user.socketId,
              userId: user.userId,
              userName: user.userName || user.userEmail || 'Anonymous',
              userEmail: user.userEmail,
              color: user.color || '#6366f1',
              role: user.role || 'viewer'
            });
          }
        });
      }
      const usersArray = Array.from(this.activeUsers.values());
      console.log('👥 Active users after update:', usersArray.map(u => u.userName || u.userEmail));
      this.emitEvent('active-users', usersArray);
    });

    // Cursor events
    this.socket.on('cursor-update', (data) => {
      this.emitEvent('cursor-update', data);
    });

    // Awareness events
    this.socket.on('awareness-update', (data) => {
      this.emitEvent('awareness-update', data);
    });

    // Error events
    this.socket.on('error', (data) => {
      this.emitEvent('error', data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.yDoc = null;
    this.activeUsers.clear();
    this.currentBoardId = null;
  }

  // Yjs document operations
  getYDoc() {
    return this.yDoc;
  }

  // Send board update
  sendUpdate(update) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('board-update', {
        update: Array.from(update)
      });
    }
  }

  // Send cursor position
  sendCursor(x, y) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('cursor-move', { x, y });
    }
  }

  // Send awareness update
  sendAwareness(state) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('awareness-update', { state });
    }
  }

  // Get active users
  getActiveUsers() {
    return Array.from(this.activeUsers.values());
  }

  // Event listeners
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emitEvent(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        callback(data);
      });
    }
  }

  // Helper method for emitting socket events
  emit(event, data) {
    if (this.socket && this.socket.connected) {
      this.socket.emit(event, data);
    }
  }

  isConnected() {
    return this.socket && this.socket.connected;
  }
}

// Export singleton instance
export const collaborationService = new CollaborationService();
export default collaborationService;
