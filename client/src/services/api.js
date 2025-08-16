import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  changePassword: (passwords) => api.post('/auth/change-password', passwords),
  refreshToken: () => api.post('/auth/refresh-token'),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
  setAuthToken: (token) => {
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },
  removeAuthToken: () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  },
};

// Users API
export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getUsers: (params) => api.get('/users', { params }),
  getUser: (id) => api.get(`/users/${id}`),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
  getStudents: (params) => api.get('/users/students', { params }),
  getTeachers: (params) => api.get('/users/teachers', { params }),
  getParents: (params) => api.get('/users/parents', { params }),
};

// Courses API
export const coursesAPI = {
  getCourses: (params) => api.get('/courses', { params }),
  getCourse: (id) => api.get(`/courses/${id}`),
  createCourse: (data) => api.post('/courses', data),
  updateCourse: (id, data) => api.put(`/courses/${id}`, data),
  deleteCourse: (id) => api.delete(`/courses/${id}`),
  enrollCourse: (id) => api.post(`/courses/${id}/enroll`),
  unenrollCourse: (id) => api.post(`/courses/${id}/unenroll`),
};

// Classes API
export const classesAPI = {
  getClasses: (params) => api.get('/classes', { params }),
  getClass: (id) => api.get(`/classes/${id}`),
  createClass: (data) => api.post('/classes', data),
  updateClass: (id, data) => api.put(`/classes/${id}`, data),
  deleteClass: (id) => api.delete(`/classes/${id}`),
  getClassesByCourse: (courseId) => api.get(`/classes/course/${courseId}`),
  getClassesByTeacher: (teacherId) => api.get(`/classes/teacher/${teacherId}`),
};

// Attendance API
export const attendanceAPI = {
  getAttendance: (params) => api.get('/attendance', { params }),
  getAttendanceByClass: (classId) => api.get(`/attendance/class/${classId}`),
  getAttendanceByStudent: (studentId) => api.get(`/attendance/student/${studentId}`),
  markAttendance: (data) => api.post('/attendance', data),
  updateAttendance: (id, data) => api.put(`/attendance/${id}`, data),
  deleteAttendance: (id) => api.delete(`/attendance/${id}`),
};

// Grades API
export const gradesAPI = {
  getGrades: (params) => api.get('/grades', { params }),
  getGrade: (id) => api.get(`/grades/${id}`),
  createGrade: (data) => api.post('/grades', data),
  updateGrade: (id, data) => api.put(`/grades/${id}`, data),
  deleteGrade: (id) => api.delete(`/grades/${id}`),
  getGradesByStudent: (studentId) => api.get(`/grades/student/${studentId}`),
  getGradesByCourse: (courseId) => api.get(`/grades/course/${courseId}`),
};

// Assignments API
export const assignmentsAPI = {
  getAssignments: (params) => api.get('/assignments', { params }),
  getAssignment: (id) => api.get(`/assignments/${id}`),
  createAssignment: (data) => api.post('/assignments', data),
  updateAssignment: (id, data) => api.put(`/assignments/${id}`, data),
  deleteAssignment: (id) => api.delete(`/assignments/${id}`),
  submitAssignment: (id, data) => api.post(`/assignments/${id}/submit`, data),
  gradeAssignment: (id, data) => api.post(`/assignments/${id}/grade`, data),
};

// Messages API
export const messagesAPI = {
  getMessages: (params) => api.get('/messages', { params }),
  getMessage: (id) => api.get(`/messages/${id}`),
  sendMessage: (data) => api.post('/messages', data),
  updateMessage: (id, data) => api.put(`/messages/${id}`, data),
  deleteMessage: (id) => api.delete(`/messages/${id}`),
  markAsRead: (id) => api.put(`/messages/${id}/read`),
  getConversations: () => api.get('/messages/conversations'),
};

// Events API
export const eventsAPI = {
  getEvents: (params) => api.get('/events', { params }),
  getEvent: (id) => api.get(`/events/${id}`),
  createEvent: (data) => api.post('/events', data),
  updateEvent: (id, data) => api.put(`/events/${id}`, data),
  deleteEvent: (id) => api.delete(`/events/${id}`),
  getEventsByDate: (date) => api.get(`/events/date/${date}`),
};

// Fees API
export const feesAPI = {
  getFees: (params) => api.get('/fees', { params }),
  getFee: (id) => api.get(`/fees/${id}`),
  createFee: (data) => api.post('/fees', data),
  updateFee: (id, data) => api.put(`/fees/${id}`, data),
  deleteFee: (id) => api.delete(`/fees/${id}`),
  payFee: (id, data) => api.post(`/fees/${id}/pay`, data),
  getFeesByStudent: (studentId) => api.get(`/fees/student/${studentId}`),
  generateInvoice: (id) => api.get(`/fees/${id}/invoice`),
};

export default api;
