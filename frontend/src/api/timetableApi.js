import api from './axiosInstance';

export const timetableApi = {
  // --- AUTH & ACCOUNT ---
  // You might already have an authApi, but adding this here for subscription context
getSubscriptionStatus: () => api.get('/payment/my-subscription'),

  // --- CLASSES ---
  getClasses: () => api.get('/classes'),
  createClass: (data) => api.post('/classes', data),
  updateClass: (id, data) => api.put(`/classes/${id}`, data),
  deleteClass: (id) => api.delete(`/classes/${id}`),

  // --- COURSES ---
  getCourses: () => api.get('/courses'),
  getCourseById: (id) => api.get(`/courses/${id}`),
  createCourse: (data) => api.post('/courses', data),
  updateCourse: (id, data) => api.put(`/courses/${id}`, data),
  deleteCourse: (id) => api.delete(`/courses/${id}`),

  // --- FACULTY ---
  getFaculty: () => api.get('/faculty'),
  createFaculty: (data) => api.post('/faculty', data),
  updateFaculty: (id, data) => api.put(`/faculty/${id}`, data),
  deleteFaculty: (id) => api.delete(`/faculty/${id}`),

  // --- ROOMS ---
  getRooms: () => api.get('/rooms'),
  createRoom: (data) => api.post('/rooms', data),
  updateRoom: (id, data) => api.put(`/rooms/${id}`, data),
  deleteRoom: (id) => api.delete(`/rooms/${id}`),

  // --- METADATA ---
  getMetadata: () => api.get("/metadata"),
  createMetadata: (data) => api.post("/metadata", data),
  updateMetadata: (id, data) => api.put(`/metadata/${id}`, data),
  deleteMetadata: (id) => api.delete(`/metadata/${id}`),

  // --- TIMETABLE AI ENGINE ---
  generateTimetable: (classId, suggestions) => 
    api.post('/timetable/generate', { classId, suggestions }),
  searchTimetables: (params) => 
    api.get('/timetable', { params }),
  deleteTimetable: (id) => 
    api.delete(`/timetable/${id}`),

  // --- PAYMENT SYSTEM (CASHFREE) ---
  /**
   * @param {string} planId - The MongoDB ID of the Plan (PRO/ENTERPRISE)
   * @param {object} customerDetails - { phone, email }
   */
createPaymentOrder: (planId, customerDetails) => 
    api.post('/payment/checkout', { planId, ...customerDetails }),

  /**
   * @param {string} orderId - The Order ID returned by Cashfree
   */
verifyPaymentStatus: (orderId) => 
    api.get(`/payment/verify-status?order_id=${orderId}`),
    
getAvailablePlans: () => api.get('/payment/plans'),
};