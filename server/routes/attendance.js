const express = require('express');
const { body, validationResult } = require('express-validator');
const Attendance = require('../models/Attendance');
const Class = require('../models/Class');
const Course = require('../models/Course');
const User = require('../models/User');
const { authorizeTeacher, authorizeResource } = require('../middleware/auth');

const router = express.Router();

// Get attendance records
router.get('/', async (req, res) => {
  try {
    const { class: classId, course, student, date, status, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    if (classId) filter.classId = classId;
    if (course) filter.courseId = course;
    if (student) filter['studentRecords.studentId'] = student;
    if (date) filter.date = new Date(date);
    if (status) filter.status = status;

    const attendance = await Attendance.find(filter)
      .populate('classId', 'title date startTime endTime')
      .populate('courseId', 'code title')
      .populate('teacherId', 'name email')
      .populate('studentRecords.studentId', 'name email studentId')
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Attendance.countDocuments(filter);

    res.json({
      success: true,
      data: {
        attendance,
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
        message: 'Error fetching attendance records',
        details: error.message
      }
    });
  }
});

// Create attendance record
router.post('/', [
  authorizeTeacher,
  body('classId').isMongoId().withMessage('Valid class ID is required'),
  body('courseId').isMongoId().withMessage('Valid course ID is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('studentRecords').isArray().withMessage('Student records must be an array'),
  body('studentRecords.*.studentId').isMongoId().withMessage('Valid student ID is required'),
  body('studentRecords.*.status').isIn(['present', 'absent', 'late', 'excused']).withMessage('Valid status is required')
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

    const { classId, courseId, date, studentRecords } = req.body;

    // Check if class exists and teacher is assigned
    const classDoc = await Class.findById(classId);
    if (!classDoc) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Class not found'
        }
      });
    }

    if (classDoc.teacherId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'You can only take attendance for your own classes'
        }
      });
    }

    // Check if attendance already exists for this class and date
    const existingAttendance = await Attendance.findOne({
      classId,
      date: new Date(date)
    });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Attendance already exists for this class and date'
        }
      });
    }

    // Validate that all students are enrolled in the course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Course not found'
        }
      });
    }

    const studentIds = studentRecords.map(record => record.studentId);
    const enrolledStudents = await User.find({
      _id: { $in: studentIds },
      role: 'student',
      'student.enrolledCourses': courseId
    });

    if (enrolledStudents.length !== studentIds.length) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Some students are not enrolled in this course'
        }
      });
    }

    // Calculate statistics
    const statistics = {
      present: studentRecords.filter(r => r.status === 'present').length,
      absent: studentRecords.filter(r => r.status === 'absent').length,
      late: studentRecords.filter(r => r.status === 'late').length,
      excused: studentRecords.filter(r => r.status === 'excused').length
    };

    const newAttendance = new Attendance({
      classId,
      courseId,
      teacherId: req.user.id,
      date: new Date(date),
      studentRecords,
      statistics,
      status: 'completed'
    });

    await newAttendance.save();

    // Update class with attendance reference
    await Class.findByIdAndUpdate(classId, {
      attendanceId: newAttendance._id
    });

    await newAttendance.populate('classId', 'title date startTime endTime');
    await newAttendance.populate('courseId', 'code title');
    await newAttendance.populate('teacherId', 'name email');
    await newAttendance.populate('studentRecords.studentId', 'name email studentId');

    res.status(201).json({
      success: true,
      message: 'Attendance recorded successfully',
      data: {
        attendance: newAttendance
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Error creating attendance record',
        details: error.message
      }
    });
  }
});

// Update attendance record
router.put('/:id', [
  authorizeTeacher,
  body('studentRecords').isArray().withMessage('Student records must be an array'),
  body('studentRecords.*.studentId').isMongoId().withMessage('Valid student ID is required'),
  body('studentRecords.*.status').isIn(['present', 'absent', 'late', 'excused']).withMessage('Valid status is required')
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

    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Attendance record not found'
        }
      });
    }

    // Check if teacher owns this attendance record
    if (attendance.teacherId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'You can only update your own attendance records'
        }
      });
    }

    // Check if attendance is locked
    if (attendance.isLocked) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Attendance record is locked and cannot be modified'
        }
      });
    }

    const { studentRecords } = req.body;

    // Calculate new statistics
    const statistics = {
      present: studentRecords.filter(r => r.status === 'present').length,
      absent: studentRecords.filter(r => r.status === 'absent').length,
      late: studentRecords.filter(r => r.status === 'late').length,
      excused: studentRecords.filter(r => r.status === 'excused').length
    };

    const updatedAttendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          studentRecords,
          statistics,
          updatedAt: new Date()
        }
      },
      { new: true, runValidators: true }
    )
      .populate('classId', 'title date startTime endTime')
      .populate('courseId', 'code title')
      .populate('teacherId', 'name email')
      .populate('studentRecords.studentId', 'name email studentId');

    res.json({
      success: true,
      message: 'Attendance updated successfully',
      data: {
        attendance: updatedAttendance
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Error updating attendance record',
        details: error.message
      }
    });
  }
});

// Get attendance by ID
router.get('/:id', async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id)
      .populate('classId', 'title date startTime endTime room')
      .populate('courseId', 'code title subject')
      .populate('teacherId', 'name email phone')
      .populate('studentRecords.studentId', 'name email studentId profilePicture');

    if (!attendance) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Attendance record not found'
        }
      });
    }

    res.json({
      success: true,
      data: {
        attendance
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Error fetching attendance record',
        details: error.message
      }
    });
  }
});

// Get student attendance history
router.get('/student/:studentId', async (req, res) => {
  try {
    const { course, startDate, endDate, page = 1, limit = 10 } = req.query;
    
    const filter = { 'studentRecords.studentId': req.params.studentId };
    if (course) filter.courseId = course;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const attendance = await Attendance.find(filter)
      .populate('classId', 'title date startTime endTime')
      .populate('courseId', 'code title subject')
      .populate('teacherId', 'name email')
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Attendance.countDocuments(filter);

    // Calculate attendance statistics for the student
    const studentRecords = attendance.flatMap(a => 
      a.studentRecords.filter(r => r.studentId.toString() === req.params.studentId)
    );

    const statistics = {
      total: studentRecords.length,
      present: studentRecords.filter(r => r.status === 'present').length,
      absent: studentRecords.filter(r => r.status === 'absent').length,
      late: studentRecords.filter(r => r.status === 'late').length,
      excused: studentRecords.filter(r => r.status === 'excused').length
    };

    statistics.attendancePercentage = statistics.total > 0 
      ? Math.round((statistics.present / statistics.total) * 100) 
      : 0;

    res.json({
      success: true,
      data: {
        attendance,
        statistics,
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
        message: 'Error fetching student attendance history',
        details: error.message
      }
    });
  }
});

// Get course attendance summary
router.get('/course/:courseId', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const filter = { courseId: req.params.courseId };
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const attendance = await Attendance.find(filter)
      .populate('classId', 'title date')
      .populate('studentRecords.studentId', 'name email studentId')
      .sort({ date: -1 });

    // Calculate course-wide statistics
    const allStudentRecords = attendance.flatMap(a => a.studentRecords);
    const uniqueStudents = [...new Set(allStudentRecords.map(r => r.studentId.toString()))];

    const courseStatistics = {
      totalClasses: attendance.length,
      totalStudentRecords: allStudentRecords.length,
      uniqueStudents: uniqueStudents.length,
      present: allStudentRecords.filter(r => r.status === 'present').length,
      absent: allStudentRecords.filter(r => r.status === 'absent').length,
      late: allStudentRecords.filter(r => r.status === 'late').length,
      excused: allStudentRecords.filter(r => r.status === 'excused').length
    };

    courseStatistics.attendancePercentage = courseStatistics.totalStudentRecords > 0 
      ? Math.round((courseStatistics.present / courseStatistics.totalStudentRecords) * 100) 
      : 0;

    // Calculate per-student statistics
    const studentStats = {};
    uniqueStudents.forEach(studentId => {
      const studentRecords = allStudentRecords.filter(r => r.studentId.toString() === studentId);
      const student = attendance
        .flatMap(a => a.studentRecords)
        .find(r => r.studentId.toString() === studentId)?.studentId;

      studentStats[studentId] = {
        student,
        total: studentRecords.length,
        present: studentRecords.filter(r => r.status === 'present').length,
        absent: studentRecords.filter(r => r.status === 'absent').length,
        late: studentRecords.filter(r => r.status === 'late').length,
        excused: studentRecords.filter(r => r.status === 'excused').length,
        attendancePercentage: studentRecords.length > 0 
          ? Math.round((studentRecords.filter(r => r.status === 'present').length / studentRecords.length) * 100) 
          : 0
      };
    });

    res.json({
      success: true,
      data: {
        attendance,
        courseStatistics,
        studentStats: Object.values(studentStats),
        pagination: {
          total: attendance.length
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Error fetching course attendance summary',
        details: error.message
      }
    });
  }
});

// Lock/unlock attendance record
router.post('/:id/lock', authorizeTeacher, async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Attendance record not found'
        }
      });
    }

    if (attendance.teacherId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'You can only lock/unlock your own attendance records'
        }
      });
    }

    attendance.isLocked = !attendance.isLocked;
    await attendance.save();

    res.json({
      success: true,
      message: `Attendance record ${attendance.isLocked ? 'locked' : 'unlocked'} successfully`,
      data: {
        isLocked: attendance.isLocked
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Error updating attendance lock status',
        details: error.message
      }
    });
  }
});

// Bulk mark attendance
router.post('/bulk', [
  authorizeTeacher,
  body('classId').isMongoId().withMessage('Valid class ID is required'),
  body('courseId').isMongoId().withMessage('Valid course ID is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('attendanceData').isArray().withMessage('Attendance data must be an array'),
  body('attendanceData.*.studentId').isMongoId().withMessage('Valid student ID is required'),
  body('attendanceData.*.status').isIn(['present', 'absent', 'late', 'excused']).withMessage('Valid status is required')
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

    const { classId, courseId, date, attendanceData } = req.body;

    // Check if class exists and teacher is assigned
    const classDoc = await Class.findById(classId);
    if (!classDoc) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Class not found'
        }
      });
    }

    if (classDoc.teacherId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'You can only take attendance for your own classes'
        }
      });
    }

    // Check if attendance already exists
    let attendance = await Attendance.findOne({
      classId,
      date: new Date(date)
    });

    if (attendance) {
      // Update existing attendance
      if (attendance.isLocked) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Attendance record is locked and cannot be modified'
          }
        });
      }

      attendance.studentRecords = attendanceData;
      attendance.statistics = {
        present: attendanceData.filter(r => r.status === 'present').length,
        absent: attendanceData.filter(r => r.status === 'absent').length,
        late: attendanceData.filter(r => r.status === 'late').length,
        excused: attendanceData.filter(r => r.status === 'excused').length
      };
    } else {
      // Create new attendance
      const statistics = {
        present: attendanceData.filter(r => r.status === 'present').length,
        absent: attendanceData.filter(r => r.status === 'absent').length,
        late: attendanceData.filter(r => r.status === 'late').length,
        excused: attendanceData.filter(r => r.status === 'excused').length
      };

      attendance = new Attendance({
        classId,
        courseId,
        teacherId: req.user.id,
        date: new Date(date),
        studentRecords: attendanceData,
        statistics,
        status: 'completed'
      });

      // Update class with attendance reference
      await Class.findByIdAndUpdate(classId, {
        attendanceId: attendance._id
      });
    }

    await attendance.save();

    await attendance.populate('classId', 'title date startTime endTime');
    await attendance.populate('courseId', 'code title');
    await attendance.populate('teacherId', 'name email');
    await attendance.populate('studentRecords.studentId', 'name email studentId');

    res.json({
      success: true,
      message: 'Bulk attendance marked successfully',
      data: {
        attendance
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Error marking bulk attendance',
        details: error.message
      }
    });
  }
});

module.exports = router;
