import axios from 'axios';
import { auth } from '../config/firebase';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4001';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } else {
        // If currentUser is null, wait a bit for auth to initialize
        // This handles the case where the request is made before Firebase auth is ready
        await new Promise((resolve) => {
          const timeout = setTimeout(() => resolve(), 100);
          const unsubscribe = auth.onAuthStateChanged((user) => {
            clearTimeout(timeout);
            unsubscribe();
            resolve();
          });
        });
        
        // Try again after waiting
        const retryUser = auth.currentUser;
        if (retryUser) {
          const token = await retryUser.getIdToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
      // Don't block the request if token retrieval fails
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const user = auth.currentUser;
      if (user) {
        try {
          const token = await user.getIdToken(true);
          error.config.headers.Authorization = `Bearer ${token}`;
          return apiClient.request(error.config);
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
        }
      }
    }
    return Promise.reject(error);
  }
);

export const userAPI = {
  getCurrentUser: () => apiClient.get('/api/users/me'),
  updateProfile: (data) => apiClient.put('/api/users/me', data),
  getUserStats: () => apiClient.get('/api/users/me/stats'),
  searchUsers: (query) => apiClient.get(`/api/users/search?query=${query}`),
};

export const boardAPI = {
  listBoards: () => apiClient.get('/api/boards'),
  createBoard: (data) => apiClient.post('/api/boards', data),
  getBoard: (id) => apiClient.get(`/api/boards/${id}`),
  updateBoard: (id, data) => apiClient.put(`/api/boards/${id}`, data),
  deleteBoard: (id) => apiClient.delete(`/api/boards/${id}`),
  addMember: (boardId, data) => apiClient.post(`/api/boards/${boardId}/members`, data),
  removeMember: (boardId, memberId) => apiClient.delete(`/api/boards/${boardId}/members/${memberId}`),
};

export const projectAPI = {
  saveProject: (projectData) => 
    apiClient.post('/api/projects/save', { projectData }),
  loadProjects: () => 
    apiClient.get('/api/projects'),
  loadProject: (projectId) => 
    apiClient.get(`/api/projects/${projectId}`),
  loadBoardProject: (boardId) => 
    apiClient.get(`/api/projects/${boardId}/load`),
  saveBoardProject: (boardId, projectData) => 
    apiClient.post(`/api/projects/${boardId}/save`, { projectData }),
  updateProject: (projectId, projectData) => 
    apiClient.put(`/api/projects/${projectId}`, { projectData }),
  deleteProject: (projectId) => 
    apiClient.delete(`/api/projects/${projectId}`),
};

export const assetAPI = {
  uploadAsset: (boardId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post(`/api/assets/${boardId}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getAssets: (boardId) => apiClient.get(`/api/assets/${boardId}`),
  deleteAsset: (boardId, assetId) => apiClient.delete(`/api/assets/${boardId}/${assetId}`),
};

export const healthAPI = {
  checkHealth: () => apiClient.get('/api/health'),
  getStats: () => apiClient.get('/api/health/stats'),
};

// Create a separate client for public endpoints (no auth required)
const publicApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const invitationAPI = {
  sendInvitation: (boardId, email, role = 'editor') => 
    apiClient.post('/api/invitations/send', { boardId, email, role }),
  acceptInvitation: (token) => 
    apiClient.get(`/api/invitations/accept/${token}`),
  validateInvitation: (token) => 
    publicApiClient.get(`/api/invitations/validate/${token}`),
  getBoardInvitations: (boardId) => 
    apiClient.get(`/api/invitations/board/${boardId}`),
};

export default apiClient;

