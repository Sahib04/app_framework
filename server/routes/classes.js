const express = require('express');
const { body, validationResult } = require('express-validator');
const Class = require('../models/Class');
const Course = require('../models/Course');
const { authorizeTeacher, authorizeResource } = require('../middleware/auth');

const router = express.Router();

// Get all classes
router.get('/', async (req, res) => {
  try {
    const { course, teacher, date, status, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    if (course) filter.courseId = course;
    if (teacher) filter.teacherId = teacher;
    if (date) filter.date = new Date(date);
    if (status) filter.status = status;

    const classes = await Class.find(filter)
      .populate('courseId', 'code title subject')
      .populate('teacherId', 'name email')
      .sort({ date: -1, startTime: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Class.countDocuments(filter);

    res.json({
      success: true,
      data: {
        classes,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Error fetching classes',
        details: error.message
      }
    });
  }
});

// Create new class
router.post('/', [
  authorizeTeacher,
  body('courseId').isMongoId().withMessage('Valid course ID is required'),
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required and must be less than 200 characters'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid start time is required (HH:MM)'),
  body('endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid end time is required (HH:MM)'),
  body('room').trim().isLength({ min: 1, max: 50 }).withMessage('Room is required and must be less than 50 characters'),
  body('type').isIn(['lecture', 'lab', 'discussion', 'exam', 'other']).withMessage('Valid class type is required'),
  body('materials').optional().isArray().withMessage('Materials must be an array'),
  body('objectives').optional().isArray().withMessage('Objectives must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        error: {
          message: 'Validation failed',
          details: errors.array()
        }
      });
    }

    const {
      courseId,
      title,
      description,
      date,
      startTime,
      endTime,
      room,
      type,
      materials,
      objectives
    } = req.body;

    // Check if course exists and teacher is assigned
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Course not found'
        }
      });
    }

    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'You can only create classes for courses you teach'
        }
      });
    }

    // Check for time conflicts
    const existingClass = await Class.findOne({
      courseId,
      date: new Date(date),
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime }
        }
      ]
    });

    if (existingClass) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Time conflict with existing class'
        }
      });
    }

    const newClass = new Class({
      courseId,
      teacherId: req.user.id,
      title,
      description,
      date: new Date(date),
      startTime,
      endTime,
      room,
      type,
      materials: materials || [],
      objectives: objectives || [],
      status: 'scheduled'
    });

    await newClass.save();

    await newClass.populate('courseId', 'code title subject');
    await newClass.populate('teacherId', 'name email');

    res.status(201).json({
      success: true,
      message: 'Class created successfully',
      data: {
        class: newClass
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Error creating class',
        details: error.message
      }
    });
  }
});

// Get class by ID
router.get('/:id', async (req, res) => {
  try {
    const classDoc = await Class.findById(req.params.id)
      .populate('courseId', 'code title subject description')
      .populate('teacherId', 'name email phone')
      .populate('attendanceId');

    if (!classDoc) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Class not found'
        }
      });
    }

    res.json({
      success: true,
      data: {
        class: classDoc
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Error fetching class',
        details: error.message
      }
    });
  }
});

// Update class
router.put('/:id', [
  authorizeTeacher,
  body('title').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Title must be less than 200 characters'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
  body('date').optional().isISO8601().withMessage('Valid date is required'),
  body('startTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid start time is required (HH:MM)'),
  body('endTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid end time is required (HH:MM)'),
  body('room').optional().trim().isLength({ min: 1, max: 50 }).withMessage('Room must be less than 50 characters'),
  body('type').optional().isIn(['lecture', 'lab', 'discussion', 'exam', 'other']).withMessage('Valid class type is required'),
  body('materials').optional().isArray().withMessage('Materials must be an array'),
  body('objectives').optional().isArray().withMessage('Objectives must be an array'),
  body('status').optional().isIn(['scheduled', 'in-progress', 'completed', 'cancelled']).withMessage('Valid status is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        error: {
          message: 'Validation failed',
          details: errors.array()
        }
      });
    }

    const classDoc = await Class.findById(req.params.id);
    if (!classDoc) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Class not found'
        }
      });
    }

    // Check if teacher owns this class
    if (classDoc.teacherId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'You can only update your own classes'
        }
      });
    }

    // Check for time conflicts if date/time is being updated
    if (req.body.date || req.body.startTime || req.body.endTime) {
      const date = req.body.date ? new Date(req.body.date) : classDoc.date;
      const startTime = req.body.startTime || classDoc.startTime;
      const endTime = req.body.endTime || classDoc.endTime;

      const existingClass = await Class.findOne({
        _id: { $ne: req.params.id },
        courseId: classDoc.courseId,
        date: date,
        $or: [
          {
            startTime: { $lt: endTime },
            endTime: { $gt: startTime }
          }
        ]
      });

      if (existingClass) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Time conflict with existing class'
          }
        });
      }
    }

    const updatedClass = await Class.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    )
      .populate('courseId', 'code title subject')
      .populate('teacherId', 'name email');

    res.json({
      success: true,
      message: 'Class updated successfully',
      data: {
        class: updatedClass
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Error updating class',
        details: error.message
      }
    });
  }
});

// Delete class
router.delete('/:id', authorizeTeacher, async (req, res) => {
  try {
    const classDoc = await Class.findById(req.params.id);
    if (!classDoc) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Class not found'
        }
      });
    }

    // Check if teacher owns this class
    if (classDoc.teacherId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'You can only delete your own classes'
        }
      });
    }

    // Check if class has attendance records
    if (classDoc.attendanceId) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Cannot delete class with attendance records'
        }
      });
    }

    await Class.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Class deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Error deleting class',
        details: error.message
      }
    });
  }
});

// Get classes by course
router.get('/course/:courseId', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const classes = await Class.find({ courseId: req.params.courseId })
      .populate('teacherId', 'name email')
      .sort({ date: -1, startTime: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Class.countDocuments({ courseId: req.params.courseId });

    res.json({
      success: true,
      data: {
        classes,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Error fetching course classes',
        details: error.message
      }
    });
  }
});

// Get teacher's classes
router.get('/teacher/my-classes', authorizeTeacher, async (req, res) => {
  try {
    const { date, status, page = 1, limit = 10 } = req.query;
    
    const filter = { teacherId: req.user.id };
    if (date) filter.date = new Date(date);
    if (status) filter.status = status;

    const classes = await Class.find(filter)
      .populate('courseId', 'code title subject')
      .sort({ date: -1, startTime: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Class.countDocuments(filter);

    res.json({
      success: true,
      data: {
        classes,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Error fetching teacher classes',
        details: error.message
      }
    });
  }
});

module.exports = router;
