import axios from 'axios';
import { auth } from '../config/firebase';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
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

export default apiClient;

