import api from './axiosInstance';

export const authApi = {
  signup: (formData) => api.post('/auth/signup', formData),
  
  login: (credentials) => api.post('/auth/login', credentials),
  
  logout: () => api.get('/auth/logout'),
  
  getCurrentUser: () => api.get('/auth/session'),
};