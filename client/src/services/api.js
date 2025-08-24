// Removed axios import as we're using fetch API

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Helper method to get auth token
  getAuthToken() {
    return localStorage.getItem('token');
  }

  // Helper method to get auth headers
  getAuthHeaders() {
    const token = this.getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getAuthHeaders(),
      ...options
    };

    try {
      const response = await fetch(url, config);
      
      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(credentials) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }

  async register(userData) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async forgotPassword(email) {
    return this.request('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }

  async resetPassword(token, password) {
    return this.request('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password })
    });
  }

  async verifyEmail(token) {
    return this.request('/api/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token })
    });
  }

  // User endpoints
  async getCurrentUser() {
    return this.request('/api/users/me');
  }

  async updateProfile(userData) {
    return this.request('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  }

  async getAllUsers() {
    return this.request('/api/users');
  }

  // Course endpoints
  async getCourses() {
    return this.request('/api/courses');
  }

  async createCourse(courseData) {
    return this.request('/api/courses', {
      method: 'POST',
      body: JSON.stringify(courseData)
    });
  }

  async updateCourse(id, courseData) {
    return this.request(`/api/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(courseData)
    });
  }

  async deleteCourse(id) {
    return this.request(`/api/courses/${id}`, {
      method: 'DELETE'
    });
  }

  // Class endpoints
  async getClasses() {
    return this.request('/api/classes');
  }

  async createClass(classData) {
    return this.request('/api/classes', {
      method: 'POST',
      body: JSON.stringify(classData)
    });
  }

  async updateClass(id, classData) {
    return this.request(`/api/classes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(classData)
    });
  }

  async deleteClass(id) {
    return this.request(`/api/classes/${id}`, {
      method: 'DELETE'
    });
  }

  // Assignment endpoints
  async getAssignments() {
    return this.request('/api/assignments');
  }

  async createAssignment(assignmentData) {
    return this.request('/api/assignments', {
      method: 'POST',
      body: JSON.stringify(assignmentData)
    });
  }

  async updateAssignment(id, assignmentData) {
    return this.request(`/api/assignments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(assignmentData)
    });
  }

  async deleteAssignment(id) {
    return this.request(`/api/assignments/${id}`, {
      method: 'DELETE'
    });
  }

  // Attendance endpoints
  async getAttendance() {
    return this.request('/api/attendance');
  }

  async markAttendance(attendanceData) {
    return this.request('/api/attendance', {
      method: 'POST',
      body: JSON.stringify(attendanceData)
    });
  }

  // Grade endpoints
  async getGrades() {
    return this.request('/api/grades');
  }

  async submitGrade(gradeData) {
    return this.request('/api/grades', {
      method: 'POST',
      body: JSON.stringify(gradeData)
    });
  }

  // Event endpoints
  async getEvents() {
    return this.request('/api/events');
  }

  async createEvent(eventData) {
    return this.request('/api/events', {
      method: 'POST',
      body: JSON.stringify(eventData)
    });
  }

  async updateEvent(id, eventData) {
    return this.request(`/api/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData)
    });
  }

  async deleteEvent(id) {
    return this.request(`/api/events/${id}`, {
      method: 'DELETE'
    });
  }

  // Fee endpoints
  async getFees() {
    return this.request('/api/fees');
  }

  async createFee(feeData) {
    return this.request('/api/fees', {
      method: 'POST',
      body: JSON.stringify(feeData)
    });
  }

  async updateFee(id, feeData) {
    return this.request(`/api/fees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(feeData)
    });
  }

  async deleteFee(id) {
    return this.request(`/api/fees/${id}`, {
      method: 'DELETE'
    });
  }

  // Message endpoints
  async getMessages() {
    return this.request('/api/messages');
  }

  async sendMessage(messageData) {
    return this.request('/api/messages', {
      method: 'POST',
      body: JSON.stringify(messageData)
    });
  }

  // Test endpoints
  async getTests() {
    return this.request('/api/tests');
  }

  async createTest(testData) {
    return this.request('/api/tests', {
      method: 'POST',
      body: JSON.stringify(testData)
    });
  }

  async updateTest(id, testData) {
    return this.request(`/api/tests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(testData)
    });
  }

  async deleteTest(id) {
    return this.request(`/api/tests/${id}`, {
      method: 'DELETE'
    });
  }

  async addTestComment(testId, commentData) {
    return this.request(`/api/tests/${testId}/comments`, {
      method: 'POST',
      body: JSON.stringify(commentData)
    });
  }

  async getTestComments(testId) {
    return this.request(`/api/tests/${testId}/comments`);
  }

  async submitTest(testId) {
    return this.request(`/api/tests/${testId}/submit`, {
      method: 'POST'
    });
  }
}

const apiService = new ApiService();

// Export individual API methods for backward compatibility
export const authAPI = {
  login: apiService.login.bind(apiService),
  register: apiService.register.bind(apiService),
  forgotPassword: apiService.forgotPassword.bind(apiService),
  resetPassword: apiService.resetPassword.bind(apiService),
  verifyEmail: apiService.verifyEmail.bind(apiService)
};

// eslint-disable-next-line import/no-anonymous-default-export
export default apiService;
