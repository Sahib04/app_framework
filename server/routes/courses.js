const express = require('express');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const Course = require('../models/Course');
const User = require('../models/User');
const CourseEnrollment = require('../models/CourseEnrollment');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Get all courses (public)
router.get('/', async (req, res) => {
  try {
    const { 
      search, 
      subject, 
      level, 
      instructor, 
      status, 
      page = 1, 
      limit = 10,
    } = req.query;
    
    const where = {};
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { code: { [Op.iLike]: `%${search}%` } },
      ];
    }
    if (subject) {
      // Map client subject filter to model's category when provided
      where.category = subject;
    }
    if (level) {
      where.level = String(level).toLowerCase();
    }
    if (status) {
      where.status = status;
    }
    if (instructor) {
      where.instructorId = instructor;
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { rows, count } = await Course.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      offset,
      limit: parseInt(limit),
    });

    res.json({
      courses: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get course by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
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
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const studentId = req.user.role === 'student' ? req.user.id : req.body.studentId;
    if (!studentId) return res.status(400).json({ message: 'Student ID is required' });

    const student = await User.findByPk(studentId);
    if (!student || student.role !== 'student') return res.status(400).json({ message: 'Invalid student' });

    await CourseEnrollment.findOrCreate({ where: { courseId: course.id, studentId } });
    await course.enrollStudent();
    res.json({ message: 'Enrolled successfully' });
  } catch (error) {
    console.error('Error enrolling student:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Unenroll student from course
router.post('/:id/unenroll', authenticateToken, authorizeRoles(['student', 'admin']), async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const studentId = req.user.role === 'student' ? req.user.id : req.body.studentId;
    if (!studentId) return res.status(400).json({ message: 'Student ID is required' });

    await CourseEnrollment.destroy({ where: { courseId: course.id, studentId } });
    await course.unenrollStudent();
    res.json({ message: 'Unenrolled successfully' });
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
    const mine = await CourseEnrollment.findAll({ where: { studentId: req.user.id } });
    const courseIds = mine.map(m => m.courseId);
    const courses = await Course.findAll({ where: { id: courseIds }, order: [['createdAt', 'DESC']] });
    res.json(courses);
  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
