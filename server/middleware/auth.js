const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    console.log('=== AUTH DEBUG ===');
    console.log('Auth header:', authHeader);
    console.log('Token:', token ? `${token.substring(0, 20)}...` : 'No token');

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access token required' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);
    
    // Find user and check if active
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['password'] }
    });
    
    console.log('Found user:', user ? {
      id: user.id,
      role: user.role,
      email: user.email,
      isActive: user.isActive
    } : 'No user found');
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ 
        success: false, 
        message: 'Account is deactivated' 
      });
    }

    // Check if account is locked
    if (user.isLocked && user.lockUntil > Date.now()) {
      return res.status(423).json({ 
        success: false, 
        message: 'Account is temporarily locked due to multiple failed login attempts' 
      });
    }

    req.user = user;
    console.log('Set req.user:', {
      id: req.user.id,
      role: req.user.role,
      email: req.user.email
    });
    console.log('==================');
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired' 
      });
    }
    return res.status(500).json({ 
      success: false, 
      message: 'Authentication error' 
    });
  }
};

// Role-based authorization middleware
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    console.log('=== ROLE CHECK DEBUG ===');
    console.log('Required roles:', roles);
    console.log('req.user:', req.user ? {
      id: req.user.id,
      role: req.user.role,
      email: req.user.email
    } : 'No user');
    
    if (!req.user) {
      console.log('No user found in req.user');
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    console.log('User role:', req.user.role);
    console.log('Checking if role is in:', roles);
    console.log('Result:', roles.includes(req.user.role));
    
    if (!roles.includes(req.user.role)) {
      console.log('Access denied - role not in required roles');
      return res.status(403).json({ 
        success: false, 
        message: `Access denied. Required roles: ${roles.join(', ')}` 
      });
    }

    console.log('Role check passed - proceeding');
    console.log('==================');
    next();
  };
};

// Admin only access
const authorizeAdmin = authorizeRoles('admin');

// Teacher only access
const authorizeTeacher = authorizeRoles('admin', 'teacher');

// Student only access
const authorizeStudent = authorizeRoles('student');

// Parent only access
const authorizeParent = authorizeRoles('parent');

// Admin or Teacher access
const authorizeAdminOrTeacher = authorizeRoles('admin', 'teacher');

// Admin, Teacher, or Student access
const authorizeAdminTeacherStudent = authorizeRoles('admin', 'teacher', 'student');

// Admin, Teacher, or Parent access
const authorizeAdminTeacherParent = authorizeRoles('admin', 'teacher', 'parent');

// Check if user can access specific resource
const authorizeResource = (resourceType) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      const resourceId = req.params.id || req.body.id;

      if (!resourceId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Resource ID required' 
        });
      }

      let hasAccess = false;

      switch (resourceType) {
        case 'course':
          // Admin can access all courses
          if (user.role === 'admin') {
            hasAccess = true;
          }
          // Teacher can access courses they teach
          else if (user.role === 'teacher') {
            const Course = require('../models/Course');
            const course = await Course.findById(resourceId);
            hasAccess = course && course.instructor.toString() === user._id.toString();
          }
          // Student can access courses they're enrolled in
          else if (user.role === 'student') {
            const Enrollment = require('../models/Enrollment');
            const enrollment = await Enrollment.findOne({
              student: user._id,
              course: resourceId,
              status: 'active'
            });
            hasAccess = !!enrollment;
          }
          break;

        case 'grade':
          // Admin can access all grades
          if (user.role === 'admin') {
            hasAccess = true;
          }
          // Teacher can access grades for courses they teach
          else if (user.role === 'teacher') {
            const Grade = require('../models/Grade');
            const grade = await Grade.findById(resourceId).populate('course');
            hasAccess = grade && grade.course.instructor.toString() === user._id.toString();
          }
          // Student can access their own grades
          else if (user.role === 'student') {
            const Grade = require('../models/Grade');
            const grade = await Grade.findById(resourceId);
            hasAccess = grade && grade.student.toString() === user._id.toString();
          }
          // Parent can access their children's grades
          else if (user.role === 'parent') {
            const Grade = require('../models/Grade');
            const grade = await Grade.findById(resourceId);
            if (grade) {
              const User = require('../models/User');
              const parent = await User.findById(user._id).populate('parent.children');
              hasAccess = parent.parent.children.some(child => 
                child._id.toString() === grade.student.toString()
              );
            }
          }
          break;

        case 'attendance':
          // Admin can access all attendance records
          if (user.role === 'admin') {
            hasAccess = true;
          }
          // Teacher can access attendance for their classes
          else if (user.role === 'teacher') {
            const Attendance = require('../models/Attendance');
            const attendance = await Attendance.findById(resourceId);
            hasAccess = attendance && attendance.teacher.toString() === user._id.toString();
          }
          // Student can access their own attendance
          else if (user.role === 'student') {
            const Attendance = require('../models/Attendance');
            const attendance = await Attendance.findById(resourceId);
            hasAccess = attendance && attendance.records.some(record => 
              record.student.toString() === user._id.toString()
            );
          }
          break;

        default:
          hasAccess = false;
      }

      if (!hasAccess) {
        return res.status(403).json({ 
          success: false, 
          message: 'Access denied to this resource' 
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({ 
        success: false, 
        message: 'Authorization error' 
      });
    }
  };
};

// Check if user is the owner of the resource
const authorizeOwner = (resourceType) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      const resourceId = req.params.id || req.body.id;

      if (!resourceId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Resource ID required' 
        });
      }

      let isOwner = false;

      switch (resourceType) {
        case 'profile':
          isOwner = resourceId === user._id.toString();
          break;

        case 'assignment':
          const Assignment = require('../models/Assignment');
          const assignment = await Assignment.findById(resourceId);
          isOwner = assignment && assignment.student.toString() === user._id.toString();
          break;

        case 'message':
          const Message = require('../models/Message');
          const message = await Message.findById(resourceId);
          isOwner = message && message.sender.toString() === user._id.toString();
          break;

        default:
          isOwner = false;
      }

      if (!isOwner && user.role !== 'admin') {
        return res.status(403).json({ 
          success: false, 
          message: 'Access denied. You can only modify your own resources.' 
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({ 
        success: false, 
        message: 'Authorization error' 
      });
    }
  };
};

// Rate limiting for authentication attempts
const rateLimit = require('express-rate-limit');

const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  authenticateToken,
  authorizeRoles,
  authorizeAdmin,
  authorizeTeacher,
  authorizeStudent,
  authorizeParent,
  authorizeAdminOrTeacher,
  authorizeAdminTeacherStudent,
  authorizeAdminTeacherParent,
  authorizeResource,
  authorizeOwner,
  authRateLimit
};
