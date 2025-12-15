import { io } from 'socket.io-client';
import * as Y from 'yjs';

// Extract WebSocket URL from environment or construct from API URL
const getWebSocketURL = () => {
  if (process.env.REACT_APP_WS_URL) {
    return process.env.REACT_APP_WS_URL;
  }
  // Default to port 4001 to match backend
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4001';
  // Convert http:// to ws:// for WebSocket connection
  return apiUrl.replace(/^http/, 'ws');
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
        return; // Already connected to this board
      }
      this.disconnect();
    }

    this.currentBoardId = boardId;
    this.socket = io(WS_URL, {
      path: '/socket.io/',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      // Connect to default namespace (no namespace specified)
      // This ensures we're connecting to the root namespace
      forceNew: false,
      // Add query parameters if needed
      query: {
        boardId,
        userId,
        userName,
        userEmail
      }
    });

    // Initialize Yjs document
    this.yDoc = new Y.Doc();

    // Socket connection events
    this.socket.on('connect', () => {
      console.log('✅ Connected to collaboration server');
      this.emit('join-board', {
        boardId,
        userId,
        userName,
        userEmail
      });
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from collaboration server');
      this.emitEvent('disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.emitEvent('error', { message: 'Failed to connect to server' });
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
      data.users.forEach(user => {
        this.activeUsers.set(user.socketId, user);
      });
      this.emitEvent('active-users', data.users);
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
