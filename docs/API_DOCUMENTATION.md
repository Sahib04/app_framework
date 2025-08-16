# School Management System API Documentation

## Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Base URL](#base-url)
4. [Error Handling](#error-handling)
5. [API Endpoints](#api-endpoints)
6. [Data Models](#data-models)
7. [Role-Based Access Control](#role-based-access-control)
8. [File Upload](#file-upload)
9. [Real-time Features](#real-time-features)
10. [Rate Limiting](#rate-limiting)

## Overview

The School Management System API provides a comprehensive RESTful interface for managing educational institutions. The API supports role-based access control with four main user types: Admin, Teacher, Student, and Parent.

### Technology Stack
- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Real-time**: Socket.io
- **Email**: Nodemailer
- **Security**: Helmet, CORS, Rate Limiting

## Authentication

### JWT Token Structure
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Authentication Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

## Base URL

- **Development**: `http://localhost:5000/api`
- **Production**: `https://your-domain.com/api`

## Error Handling

### Standard Error Response Format
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": {}
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `429` - Too Many Requests
- `500` - Internal Server Error

## API Endpoints

### Authentication Routes

#### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "student",
  "phone": "+1234567890",
  "dateOfBirth": "2000-01-01",
  "gender": "male",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful. Please check your email to verify your account.",
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "student",
      "isEmailVerified": false
    }
  }
}
```

#### POST /api/auth/login
Authenticate user and receive JWT tokens.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "student",
      "profilePicture": "profile.jpg"
    },
    "token": "jwt_token_here",
    "refreshToken": "refresh_token_here"
  }
}
```

#### POST /api/auth/verify-email
Verify email address with token.

**Request Body:**
```json
{
  "token": "email_verification_token"
}
```

#### POST /api/auth/forgot-password
Request password reset email.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

#### POST /api/auth/reset-password
Reset password with token.

**Request Body:**
```json
{
  "token": "reset_token",
  "password": "newPassword123"
}
```

#### POST /api/auth/change-password
Change password (requires authentication).

**Request Body:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword123"
}
```

#### POST /api/auth/refresh-token
Refresh JWT token.

**Request Body:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

#### POST /api/auth/logout
Logout user (invalidate tokens).

### User Management Routes

#### GET /api/users/profile
Get current user profile.

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "student",
      "phone": "+1234567890",
      "dateOfBirth": "2000-01-01",
      "gender": "male",
      "address": {},
      "profilePicture": "profile.jpg",
      "isActive": true,
      "isEmailVerified": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### PUT /api/users/profile
Update user profile.

**Request Body:**
```json
{
  "name": "John Smith",
  "phone": "+1234567890",
  "address": {
    "street": "456 Oak St",
    "city": "Los Angeles",
    "state": "CA",
    "zipCode": "90210",
    "country": "USA"
  }
}
```

#### GET /api/users
Get all users (Admin only).

**Query Parameters:**
- `role` - Filter by role (admin, teacher, student, parent)
- `isActive` - Filter by active status
- `search` - Search by name or email
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

#### GET /api/users/:id
Get user by ID.

#### PUT /api/users/:id
Update user (Admin only).

#### DELETE /api/users/:id
Delete user (Admin only).

### Course Management Routes

#### GET /api/courses
Get all courses.

**Query Parameters:**
- `subject` - Filter by subject
- `level` - Filter by level
- `instructor` - Filter by instructor ID
- `status` - Filter by status (active, inactive)
- `search` - Search by title or code
- `page` - Page number
- `limit` - Items per page

**Response:**
```json
{
  "success": true,
  "data": {
    "courses": [
      {
        "id": "course_id",
        "code": "MATH101",
        "title": "Introduction to Mathematics",
        "description": "Basic mathematics course",
        "credits": 3,
        "duration": "16 weeks",
        "level": "beginner",
        "subject": "Mathematics",
        "instructor": {
          "id": "teacher_id",
          "name": "Dr. Smith"
        },
        "status": "active",
        "enrollmentCount": 25,
        "capacity": 30,
        "tuitionFee": 500
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "pages": 5
    }
  }
}
```

#### POST /api/courses
Create new course (Admin/Teacher only).

**Request Body:**
```json
{
  "code": "MATH101",
  "title": "Introduction to Mathematics",
  "description": "Basic mathematics course covering algebra and geometry",
  "credits": 3,
  "duration": "16 weeks",
  "level": "beginner",
  "grade": "9-12",
  "subject": "Mathematics",
  "category": "Core",
  "learningObjectives": ["Understand basic algebra", "Solve geometric problems"],
  "syllabus": "Week 1: Introduction to Algebra...",
  "textbooks": ["Algebra Basics", "Geometry Fundamentals"],
  "assessmentMethods": ["Exams", "Homework", "Projects"],
  "gradingPolicy": "A: 90-100%, B: 80-89%, C: 70-79%",
  "capacity": 30,
  "tuitionFee": 500
}
```

#### GET /api/courses/:id
Get course by ID.

#### PUT /api/courses/:id
Update course (Admin/Instructor only).

#### DELETE /api/courses/:id
Delete course (Admin only).

#### POST /api/courses/:id/enroll
Enroll student in course.

**Request Body:**
```json
{
  "studentId": "student_id"
}
```

#### DELETE /api/courses/:id/enroll
Unenroll student from course.

**Request Body:**
```json
{
  "studentId": "student_id"
}
```

### Class Management Routes

#### GET /api/classes
Get all classes.

**Query Parameters:**
- `course` - Filter by course ID
- `teacher` - Filter by teacher ID
- `date` - Filter by date
- `status` - Filter by status

#### POST /api/classes
Create new class (Teacher only).

**Request Body:**
```json
{
  "courseId": "course_id",
  "title": "Algebra Basics",
  "description": "Introduction to algebraic concepts",
  "date": "2024-01-15",
  "startTime": "09:00",
  "endTime": "10:30",
  "room": "Room 101",
  "type": "lecture",
  "materials": ["textbook", "calculator"],
  "objectives": ["Understand variables", "Solve equations"]
}
```

#### GET /api/classes/:id
Get class by ID.

#### PUT /api/classes/:id
Update class (Teacher only).

#### DELETE /api/classes/:id
Delete class (Teacher only).

### Attendance Routes

#### GET /api/attendance
Get attendance records.

**Query Parameters:**
- `class` - Filter by class ID
- `course` - Filter by course ID
- `student` - Filter by student ID
- `date` - Filter by date
- `status` - Filter by status

#### POST /api/attendance
Create attendance record (Teacher only).

**Request Body:**
```json
{
  "classId": "class_id",
  "courseId": "course_id",
  "date": "2024-01-15",
  "studentRecords": [
    {
      "studentId": "student_id",
      "status": "present",
      "time": "09:05",
      "notes": "Arrived late"
    }
  ]
}
```

#### PUT /api/attendance/:id
Update attendance record (Teacher only).

#### GET /api/attendance/student/:studentId
Get student attendance history.

#### GET /api/attendance/course/:courseId
Get course attendance summary.

### Grade Management Routes

#### GET /api/grades
Get grades.

**Query Parameters:**
- `student` - Filter by student ID
- `course` - Filter by course ID
- `assessment` - Filter by assessment type
- `semester` - Filter by semester

#### POST /api/grades
Create grade record (Teacher only).

**Request Body:**
```json
{
  "studentId": "student_id",
  "courseId": "course_id",
  "classId": "class_id",
  "assessmentType": "exam",
  "title": "Midterm Exam",
  "score": 85,
  "maxScore": 100,
  "weight": 30,
  "category": "exams",
  "feedback": "Good work on algebra problems, need improvement in geometry"
}
```

#### PUT /api/grades/:id
Update grade (Teacher only).

#### GET /api/grades/student/:studentId
Get student grade history.

#### GET /api/grades/course/:courseId
Get course grade summary.

#### POST /api/grades/:id/publish
Publish grades (Teacher only).

#### POST /api/grades/:id/dispute
Dispute grade (Student/Parent only).

### Fee Management Routes

#### GET /api/fees
Get fee records.

**Query Parameters:**
- `student` - Filter by student ID
- `type` - Filter by fee type
- `status` - Filter by payment status
- `dueDate` - Filter by due date

#### POST /api/fees
Create fee record (Admin only).

**Request Body:**
```json
{
  "studentId": "student_id",
  "type": "tuition",
  "amount": 500,
  "dueDate": "2024-02-01",
  "description": "Spring semester tuition",
  "installments": 2
}
```

#### PUT /api/fees/:id
Update fee record (Admin only).

#### POST /api/fees/:id/pay
Record payment.

**Request Body:**
```json
{
  "amount": 250,
  "paymentMethod": "credit_card",
  "transactionId": "txn_123456",
  "notes": "First installment"
}
```

#### GET /api/fees/student/:studentId
Get student fee history.

### Messaging Routes

#### GET /api/messages
Get messages.

**Query Parameters:**
- `recipient` - Filter by recipient ID
- `sender` - Filter by sender ID
- `type` - Filter by message type
- `unread` - Filter unread messages only

#### POST /api/messages
Send message.

**Request Body:**
```json
{
  "recipientId": "recipient_id",
  "subject": "Homework Question",
  "content": "I have a question about the algebra assignment...",
  "type": "direct",
  "attachments": ["file1.pdf", "file2.jpg"]
}
```

#### GET /api/messages/:id
Get message by ID.

#### PUT /api/messages/:id/read
Mark message as read.

#### DELETE /api/messages/:id
Delete message.

### Assignment Routes

#### GET /api/assignments
Get assignments.

**Query Parameters:**
- `course` - Filter by course ID
- `teacher` - Filter by teacher ID
- `dueDate` - Filter by due date
- `status` - Filter by status

#### POST /api/assignments
Create assignment (Teacher only).

**Request Body:**
```json
{
  "courseId": "course_id",
  "title": "Algebra Problem Set",
  "description": "Complete problems 1-20 in Chapter 3",
  "dueDate": "2024-01-20T23:59:59.000Z",
  "maxScore": 100,
  "weight": 15,
  "type": "homework",
  "attachments": ["problem_set.pdf"],
  "rubric": "Grading criteria..."
}
```

#### GET /api/assignments/:id
Get assignment by ID.

#### PUT /api/assignments/:id
Update assignment (Teacher only).

#### DELETE /api/assignments/:id
Delete assignment (Teacher only).

#### POST /api/assignments/:id/submit
Submit assignment (Student only).

**Request Body:**
```json
{
  "content": "My solution to the problems...",
  "attachments": ["solution.pdf"]
}
```

#### GET /api/assignments/:id/submissions
Get assignment submissions (Teacher only).

### Event Routes

#### GET /api/events
Get events.

**Query Parameters:**
- `type` - Filter by event type
- `startDate` - Filter by start date
- `endDate` - Filter by end date
- `category` - Filter by category

#### POST /api/events
Create event (Admin/Teacher only).

**Request Body:**
```json
{
  "title": "Parent-Teacher Conference",
  "description": "Annual parent-teacher conference",
  "type": "meeting",
  "category": "academic",
  "startDate": "2024-02-15T09:00:00.000Z",
  "endDate": "2024-02-15T17:00:00.000Z",
  "location": "School Auditorium",
  "attendees": ["parent_id1", "parent_id2"],
  "isRecurring": false,
  "reminderTime": 24
}
```

#### GET /api/events/:id
Get event by ID.

#### PUT /api/events/:id
Update event (Admin/Teacher only).

#### DELETE /api/events/:id
Delete event (Admin/Teacher only).

## Data Models

### User Model
```javascript
{
  name: String,
  email: String,
  password: String,
  role: String, // admin, teacher, student, parent
  phone: String,
  dateOfBirth: Date,
  gender: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  profilePicture: String,
  isActive: Boolean,
  isEmailVerified: Boolean,
  // Role-specific fields
  teacher: {
    subjects: [String],
    qualifications: [String],
    experience: Number
  },
  student: {
    studentId: String,
    grade: String,
    parentId: String,
    emergencyContact: String
  },
  parent: {
    children: [String], // Student IDs
    relationship: String
  }
}
```

### Course Model
```javascript
{
  code: String,
  title: String,
  description: String,
  credits: Number,
  duration: String,
  level: String,
  grade: String,
  prerequisites: [String],
  subject: String,
  category: String,
  learningObjectives: [String],
  syllabus: String,
  textbooks: [String],
  assessmentMethods: [String],
  gradingPolicy: String,
  capacity: Number,
  schedule: String,
  instructor: String, // Teacher ID
  status: String, // active, inactive
  tuitionFee: Number
}
```

### Attendance Model
```javascript
{
  date: Date,
  classId: String,
  courseId: String,
  teacherId: String,
  studentRecords: [{
    studentId: String,
    status: String, // present, absent, late
    time: String,
    notes: String
  }],
  statistics: {
    present: Number,
    absent: Number,
    late: Number
  },
  status: String, // pending, completed
  isLocked: Boolean
}
```

### Grade Model
```javascript
{
  studentId: String,
  courseId: String,
  classId: String,
  teacherId: String,
  assessmentType: String,
  title: String,
  score: Number,
  maxScore: Number,
  percentage: Number,
  letterGrade: String,
  gradePoints: Number,
  weight: Number,
  category: String,
  submissionDate: Date,
  feedback: String,
  status: String // draft, published, disputed
}
```

## Role-Based Access Control

### Admin Permissions
- Full system access
- User management
- Course creation and management
- System configuration
- Reports and analytics

### Teacher Permissions
- View assigned courses and classes
- Create and manage classes
- Take attendance
- Grade assignments and exams
- Send messages to students and parents
- Create assignments
- View student progress

### Student Permissions
- View enrolled courses
- Submit assignments
- View grades (when published)
- Send messages to teachers
- View attendance records
- Access course materials

### Parent Permissions
- View child's courses and grades
- View child's attendance
- Send messages to teachers
- View school events
- Access fee information

## File Upload

### Supported File Types
- Images: JPG, PNG, GIF, WebP
- Documents: PDF, DOC, DOCX, TXT
- Spreadsheets: XLS, XLSX, CSV
- Presentations: PPT, PPTX

### Upload Endpoints
- `POST /api/upload/profile-picture` - Profile picture upload
- `POST /api/upload/assignment` - Assignment file upload
- `POST /api/upload/course-material` - Course material upload

### File Size Limits
- Profile pictures: 5MB
- Assignment files: 10MB
- Course materials: 20MB

## Real-time Features

### Socket.io Events

#### Connection
```javascript
// Client connects
socket.emit('user_connected', { userId: 'user_id' });

// Server acknowledges
socket.emit('connection_established', { message: 'Connected successfully' });
```

#### Messaging
```javascript
// Send message
socket.emit('send_message', {
  recipientId: 'recipient_id',
  message: 'Hello!'
});

// Receive message
socket.on('new_message', (data) => {
  console.log('New message:', data);
});
```

#### Notifications
```javascript
// Receive notification
socket.on('notification', (data) => {
  console.log('Notification:', data);
});
```

#### Attendance Updates
```javascript
// Teacher marks attendance
socket.emit('attendance_updated', {
  classId: 'class_id',
  attendanceData: {}
});

// Students receive update
socket.on('attendance_updated', (data) => {
  console.log('Attendance updated:', data);
});
```

## Rate Limiting

### Authentication Endpoints
- Login: 5 attempts per 15 minutes
- Register: 3 attempts per hour
- Password reset: 3 attempts per hour

### API Endpoints
- General API: 100 requests per 15 minutes
- File uploads: 10 uploads per hour
- Messaging: 50 messages per hour

### Rate Limit Response
```json
{
  "success": false,
  "error": {
    "message": "Too many requests. Please try again later.",
    "code": "RATE_LIMIT_EXCEEDED",
    "retryAfter": 900
  }
}
```

## Testing

### Test Endpoints
- `GET /api/health` - Health check
- `GET /api/test/auth` - Test authentication
- `POST /api/test/seed` - Seed test data

### Test Data
The system includes sample data for testing:
- Admin user: admin@school.com / admin123
- Teacher user: teacher@school.com / teacher123
- Student user: student@school.com / student123
- Parent user: parent@school.com / parent123

## Deployment

### Environment Variables
See `.env.example` for all required environment variables.

### Production Checklist
- [ ] Set NODE_ENV=production
- [ ] Configure MongoDB connection
- [ ] Set JWT secrets
- [ ] Configure email service
- [ ] Set up file storage
- [ ] Configure CORS origins
- [ ] Set up SSL certificates
- [ ] Configure logging
- [ ] Set up monitoring

### Docker Deployment
```bash
# Build image
docker build -t school-management-system .

# Run container
docker run -p 5000:5000 school-management-system
```

## Support

For API support and questions:
- Email: support@schoolsystem.com
- Documentation: https://docs.schoolsystem.com
- GitHub Issues: https://github.com/school-system/issues

---

*Last updated: January 2024*
*Version: 1.0.0*
