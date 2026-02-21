import api from './axiosInstance';

export const timetableApi = {
  generate: (data) => api.post('/api/timetable/generate', data),
  getClasses: () => api.get('/api/classes'),
  getCourses: () => api.get('/api/courses'),
  search: (params) => api.get('/api/timetable/search', { params }),
};