const express = require('express');
const { body, validationResult } = require('express-validator');
const Course = require('../models/Course');
const User = require('../models/User');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Get all courses
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { 
      search, 
      subject, 
      level, 
      instructor, 
      status, 
      page = 1, 
      limit = 10 
    } = req.query;
    
    const filter = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
      ];
    }
    if (subject) filter.subject = subject;
    if (level) filter.level = level;
    if (instructor) filter.instructorId = instructor;
    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    const courses = await Course.find(filter)
      .populate('instructorId', 'firstName lastName email')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Course.countDocuments(filter);

    res.json({
      courses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get course by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructorId', 'firstName lastName email phone')
      .populate('prerequisites', 'title code description');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json(course);
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create course (admin/teacher only)
router.post('/', authenticateToken, authorizeRoles(['admin', 'teacher']), [
  body('title').trim().isLength({ min: 3, max: 100 }),
  body('code').trim().isLength({ min: 2, max: 20 }),
  body('description').optional().trim().isLength({ max: 1000 }),
  body('credits').isInt({ min: 1, max: 10 }),
  body('duration').isInt({ min: 1 }),
  body('level').isIn(['beginner', 'intermediate', 'advanced']),
  body('subject').trim().isLength({ min: 2, max: 50 }),
  body('maxCapacity').isInt({ min: 1 }),
  body('fee').isFloat({ min: 0 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if course code already exists
    const existingCourse = await Course.findOne({ code: req.body.code });
    if (existingCourse) {
      return res.status(400).json({ message: 'Course code already exists' });
    }

    const courseData = {
      ...req.body,
      instructorId: req.user.role === 'teacher' ? req.user.id : req.body.instructorId,
      status: 'active',
    };

    const course = new Course(courseData);
    await course.save();

    const populatedCourse = await Course.findById(course._id)
      .populate('instructorId', 'firstName lastName email');

    res.status(201).json(populatedCourse);
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update course (admin or course instructor)
router.put('/:id', authenticateToken, authorizeRoles(['admin', 'teacher']), [
  body('title').optional().trim().isLength({ min: 3, max: 100 }),
  body('code').optional().trim().isLength({ min: 2, max: 20 }),
  body('description').optional().trim().isLength({ max: 1000 }),
  body('credits').optional().isInt({ min: 1, max: 10 }),
  body('duration').optional().isInt({ min: 1 }),
  body('level').optional().isIn(['beginner', 'intermediate', 'advanced']),
  body('subject').optional().trim().isLength({ min: 2, max: 50 }),
  body('maxCapacity').optional().isInt({ min: 1 }),
  body('fee').optional().isFloat({ min: 0 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user has permission to update this course
    if (req.user.role === 'teacher' && course.instructorId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if course code is being changed and if it already exists
    if (req.body.code && req.body.code !== course.code) {
      const existingCourse = await Course.findOne({ code: req.body.code });
      if (existingCourse) {
        return res.status(400).json({ message: 'Course code already exists' });
      }
    }

    Object.assign(course, req.body);
    await course.save();

    const updatedCourse = await Course.findById(course._id)
      .populate('instructorId', 'firstName lastName email');

    res.json(updatedCourse);
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete course (admin or course instructor)
router.delete('/:id', authenticateToken, authorizeRoles(['admin', 'teacher']), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user has permission to delete this course
    if (req.user.role === 'teacher' && course.instructorId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if course has enrolled students
    if (course.enrolledStudents.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete course with enrolled students' 
      });
    }

    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Enroll student in course
router.post('/:id/enroll', authenticateToken, authorizeRoles(['student', 'admin']), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const studentId = req.user.role === 'student' ? req.user.id : req.body.studentId;
    
    if (!studentId) {
      return res.status(400).json({ message: 'Student ID is required' });
    }

    // Verify student exists
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(400).json({ message: 'Invalid student' });
    }

    const result = await course.enrollStudent(studentId);
    
    if (result.success) {
      res.json({ 
        message: 'Enrolled successfully',
        course: result.course 
      });
    } else {
      res.status(400).json({ message: result.message });
    }
  } catch (error) {
    console.error('Error enrolling student:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Unenroll student from course
router.post('/:id/unenroll', authenticateToken, authorizeRoles(['student', 'admin']), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const studentId = req.user.role === 'student' ? req.user.id : req.body.studentId;
    
    if (!studentId) {
      return res.status(400).json({ message: 'Student ID is required' });
    }

    const result = await course.unenrollStudent(studentId);
    
    if (result.success) {
      res.json({ 
        message: 'Unenrolled successfully',
        course: result.course 
      });
    } else {
      res.status(400).json({ message: result.message });
    }
  } catch (error) {
    console.error('Error unenrolling student:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get course enrollment
router.get('/:id/enrollment', authenticateToken, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('enrolledStudents', 'firstName lastName email studentId')
      .populate('waitlist', 'firstName lastName email studentId');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json({
      enrolledStudents: course.enrolledStudents,
      waitlist: course.waitlist,
      enrollmentCount: course.enrolledStudents.length,
      waitlistCount: course.waitlist.length,
      maxCapacity: course.maxCapacity,
      isAvailable: course.isAvailable,
      isWaitlistAvailable: course.isWaitlistAvailable,
    });
  } catch (error) {
    console.error('Error fetching course enrollment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get courses by instructor
router.get('/instructor/:instructorId', authenticateToken, async (req, res) => {
  try {
    const courses = await Course.find({ instructorId: req.params.instructorId })
      .populate('instructorId', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json(courses);
  } catch (error) {
    console.error('Error fetching instructor courses:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get student's enrolled courses
router.get('/student/enrolled', authenticateToken, authorizeRoles(['student']), async (req, res) => {
  try {
    const courses = await Course.find({ 
      enrolledStudents: req.user.id 
    })
    .populate('instructorId', 'firstName lastName email')
    .sort({ createdAt: -1 });

    res.json(courses);
  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
