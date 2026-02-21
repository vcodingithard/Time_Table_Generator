import api from './axiosInstance';

export const timetableApi = {
  // Class Methods
  getClasses: () => api.get('/classes'),
  createClass: (data) => api.post('/classes', data),
  deleteClass: (id) => api.delete(`/classes/${id}`),

  // Supporting Data
  getRooms: () => api.get('/rooms'),
  getFaculty: () => api.get('/faculty'),
};