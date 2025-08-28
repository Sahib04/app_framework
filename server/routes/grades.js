const express = require('express');
const { body, validationResult } = require('express-validator');
const Grade = require('../models/Grade');
const Course = require('../models/Course');
const User = require('../models/User');
const { authorizeTeacher, authorizeResource } = require('../middleware/auth');

const router = express.Router();

// Mixed-ORM import: use Sequelize User model for grade-level summaries
const { User: SequelizeUser } = require('../models');

// Get grades
router.get('/', async (req, res) => {
  try {
    const { student, course, assessment, semester, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    if (student) filter.studentId = student;
    if (course) filter.courseId = course;
    if (assessment) filter.assessmentType = assessment;
    if (semester) filter.semester = semester;

    const grades = await Grade.find(filter)
      .populate('studentId', 'name email studentId')
      .populate('courseId', 'code title subject')
      .populate('classId', 'title date')
      .populate('teacherId', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Grade.countDocuments(filter);

    res.json({
      success: true,
      data: {
        grades,
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
        message: 'Error fetching grades',
        details: error.message
      }
    });
  }
});

// Create grade record
router.post('/', [
  authorizeTeacher,
  body('studentId').isMongoId().withMessage('Valid student ID is required'),
  body('courseId').isMongoId().withMessage('Valid course ID is required'),
  body('assessmentType').isIn(['exam', 'quiz', 'homework', 'project', 'participation', 'other']).withMessage('Valid assessment type is required'),
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required and must be less than 200 characters'),
  body('score').isFloat({ min: 0 }).withMessage('Score must be a positive number'),
  body('maxScore').isFloat({ min: 1 }).withMessage('Maximum score must be at least 1'),
  body('weight').optional().isFloat({ min: 0, max: 100 }).withMessage('Weight must be between 0 and 100'),
  body('category').optional().isIn(['exams', 'quizzes', 'homework', 'projects', 'participation', 'other']).withMessage('Valid category is required'),
  body('feedback').optional().trim().isLength({ max: 1000 }).withMessage('Feedback must be less than 1000 characters')
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
      studentId,
      courseId,
      classId,
      assessmentType,
      title,
      score,
      maxScore,
      weight,
      category,
      feedback
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
          message: 'You can only grade students in courses you teach'
        }
      });
    }

    // Check if student is enrolled in the course
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Student not found'
        }
      });
    }

    if (!student.student.enrolledCourses.includes(courseId)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Student is not enrolled in this course'
        }
      });
    }

    // Calculate percentage and letter grade
    const percentage = (score / maxScore) * 100;
    const letterGrade = calculateLetterGrade(percentage);
    const gradePoints = calculateGradePoints(letterGrade);

    const newGrade = new Grade({
      studentId,
      courseId,
      classId,
      teacherId: req.user.id,
      assessmentType,
      title,
      score,
      maxScore,
      percentage,
      letterGrade,
      gradePoints,
      weight: weight || 0,
      category: category || assessmentType,
      feedback,
      status: 'draft'
    });

    await newGrade.save();

    await newGrade.populate('studentId', 'name email studentId');
    await newGrade.populate('courseId', 'code title subject');
    await newGrade.populate('classId', 'title date');
    await newGrade.populate('teacherId', 'name email');

    res.status(201).json({
      success: true,
      message: 'Grade recorded successfully',
      data: {
        grade: newGrade
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Error creating grade record',
        details: error.message
      }
    });
  }
});

// Update grade
router.put('/:id', [
  authorizeTeacher,
  body('score').optional().isFloat({ min: 0 }).withMessage('Score must be a positive number'),
  body('maxScore').optional().isFloat({ min: 1 }).withMessage('Maximum score must be at least 1'),
  body('weight').optional().isFloat({ min: 0, max: 100 }).withMessage('Weight must be between 0 and 100'),
  body('feedback').optional().trim().isLength({ max: 1000 }).withMessage('Feedback must be less than 1000 characters')
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

    const grade = await Grade.findById(req.params.id);
    if (!grade) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Grade record not found'
        }
      });
    }

    // Check if teacher owns this grade
    if (grade.teacherId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'You can only update your own grades'
        }
      });
    }

    // Check if grade is published
    if (grade.status === 'published') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Cannot update published grades'
        }
      });
    }

    const { score, maxScore, weight, feedback } = req.body;
    const updateData = {};

    if (score !== undefined) updateData.score = score;
    if (maxScore !== undefined) updateData.maxScore = maxScore;
    if (weight !== undefined) updateData.weight = weight;
    if (feedback !== undefined) updateData.feedback = feedback;

    // Recalculate percentage and letter grade if score or maxScore changed
    if (score !== undefined || maxScore !== undefined) {
      const finalScore = score !== undefined ? score : grade.score;
      const finalMaxScore = maxScore !== undefined ? maxScore : grade.maxScore;
      const percentage = (finalScore / finalMaxScore) * 100;
      const letterGrade = calculateLetterGrade(percentage);
      const gradePoints = calculateGradePoints(letterGrade);

      updateData.percentage = percentage;
      updateData.letterGrade = letterGrade;
      updateData.gradePoints = gradePoints;
    }

    const updatedGrade = await Grade.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('studentId', 'name email studentId')
      .populate('courseId', 'code title subject')
      .populate('classId', 'title date')
      .populate('teacherId', 'name email');

    res.json({
      success: true,
      message: 'Grade updated successfully',
      data: {
        grade: updatedGrade
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Error updating grade',
        details: error.message
      }
    });
  }
});

// Get grade by ID
router.get('/:id', async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id)
      .populate('studentId', 'name email studentId profilePicture')
      .populate('courseId', 'code title subject')
      .populate('classId', 'title date')
      .populate('teacherId', 'name email phone');

    if (!grade) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Grade record not found'
        }
      });
    }

    res.json({
      success: true,
      data: {
        grade
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Error fetching grade record',
        details: error.message
      }
    });
  }
});

// Get student grade history
router.get('/student/:studentId', async (req, res) => {
  try {
    const { course, assessment, semester, page = 1, limit = 10 } = req.query;
    
    const filter = { studentId: req.params.studentId };
    if (course) filter.courseId = course;
    if (assessment) filter.assessmentType = assessment;
    if (semester) filter.semester = semester;

    const grades = await Grade.find(filter)
      .populate('courseId', 'code title subject')
      .populate('classId', 'title date')
      .populate('teacherId', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Grade.countDocuments(filter);

    // Calculate student statistics
    const statistics = {
      totalGrades: grades.length,
      averageScore: 0,
      averagePercentage: 0,
      gpa: 0,
      gradeDistribution: {
        A: 0, B: 0, C: 0, D: 0, F: 0
      }
    };

    if (grades.length > 0) {
      const totalScore = grades.reduce((sum, grade) => sum + grade.score, 0);
      const totalMaxScore = grades.reduce((sum, grade) => sum + grade.maxScore, 0);
      const totalGradePoints = grades.reduce((sum, grade) => sum + grade.gradePoints, 0);

      statistics.averageScore = totalScore / grades.length;
      statistics.averagePercentage = (totalScore / totalMaxScore) * 100;
      statistics.gpa = totalGradePoints / grades.length;

      grades.forEach(grade => {
        if (grade.letterGrade) {
          statistics.gradeDistribution[grade.letterGrade] = 
            (statistics.gradeDistribution[grade.letterGrade] || 0) + 1;
        }
      });
    }

    res.json({
      success: true,
      data: {
        grades,
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
        message: 'Error fetching student grade history',
        details: error.message
      }
    });
  }
});

// Get course grade summary
router.get('/course/:courseId', async (req, res) => {
  try {
    const { assessment, semester } = req.query;
    
    const filter = { courseId: req.params.courseId };
    if (assessment) filter.assessmentType = assessment;
    if (semester) filter.semester = semester;

    const grades = await Grade.find(filter)
      .populate('studentId', 'name email studentId')
      .populate('classId', 'title date')
      .populate('teacherId', 'name email')
      .sort({ createdAt: -1 });

    // Calculate course statistics
    const courseStatistics = {
      totalGrades: grades.length,
      averageScore: 0,
      averagePercentage: 0,
      averageGPA: 0,
      gradeDistribution: {
        A: 0, B: 0, C: 0, D: 0, F: 0
      },
      assessmentTypeDistribution: {},
      topPerformers: [],
      strugglingStudents: []
    };

    if (grades.length > 0) {
      const totalScore = grades.reduce((sum, grade) => sum + grade.score, 0);
      const totalMaxScore = grades.reduce((sum, grade) => sum + grade.maxScore, 0);
      const totalGradePoints = grades.reduce((sum, grade) => sum + grade.gradePoints, 0);

      courseStatistics.averageScore = totalScore / grades.length;
      courseStatistics.averagePercentage = (totalScore / totalMaxScore) * 100;
      courseStatistics.averageGPA = totalGradePoints / grades.length;

      // Grade distribution
      grades.forEach(grade => {
        if (grade.letterGrade) {
          courseStatistics.gradeDistribution[grade.letterGrade] = 
            (courseStatistics.gradeDistribution[grade.letterGrade] || 0) + 1;
        }

        // Assessment type distribution
        courseStatistics.assessmentTypeDistribution[grade.assessmentType] = 
          (courseStatistics.assessmentTypeDistribution[grade.assessmentType] || 0) + 1;
      });

      // Calculate per-student statistics
      const studentStats = {};
      grades.forEach(grade => {
        const studentId = grade.studentId._id.toString();
        if (!studentStats[studentId]) {
          studentStats[studentId] = {
            student: grade.studentId,
            grades: [],
            totalScore: 0,
            totalMaxScore: 0,
            totalGradePoints: 0,
            count: 0
          };
        }

        studentStats[studentId].grades.push(grade);
        studentStats[studentId].totalScore += grade.score;
        studentStats[studentId].totalMaxScore += grade.maxScore;
        studentStats[studentId].totalGradePoints += grade.gradePoints;
        studentStats[studentId].count++;
      });

      // Calculate averages and identify top/struggling students
      Object.values(studentStats).forEach(student => {
        student.averageScore = student.totalScore / student.count;
        student.averagePercentage = (student.totalScore / student.totalMaxScore) * 100;
        student.gpa = student.totalGradePoints / student.count;
      });

      // Sort students by GPA
      const sortedStudents = Object.values(studentStats).sort((a, b) => b.gpa - a.gpa);
      courseStatistics.topPerformers = sortedStudents.slice(0, 5);
      courseStatistics.strugglingStudents = sortedStudents.slice(-5).reverse();
    }

    res.json({
      success: true,
      data: {
        grades,
        courseStatistics,
        studentStats: Object.values(studentStats),
        pagination: {
          total: grades.length
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Error fetching course grade summary',
        details: error.message
      }
    });
  }
});

// Publish grades
router.post('/:id/publish', authorizeTeacher, async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id);
    if (!grade) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Grade record not found'
        }
      });
    }

    if (grade.teacherId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'You can only publish your own grades'
        }
      });
    }

    if (grade.status === 'published') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Grade is already published'
        }
      });
    }

    grade.status = 'published';
    grade.publishedAt = new Date();
    await grade.save();

    res.json({
      success: true,
      message: 'Grade published successfully',
      data: {
        grade
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Error publishing grade',
        details: error.message
      }
    });
  }
});

// Dispute grade
router.post('/:id/dispute', async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Dispute reason is required'
        }
      });
    }

    const grade = await Grade.findById(req.params.id);
    if (!grade) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Grade record not found'
        }
      });
    }

    // Check if user can dispute this grade
    if (req.user.role === 'student' && grade.studentId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'You can only dispute your own grades'
        }
      });
    }

    if (req.user.role === 'parent') {
      const student = await User.findById(grade.studentId);
      if (!student || student.student.parentId.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: {
            message: 'You can only dispute grades for your children'
          }
        });
      }
    }

    if (grade.status !== 'published') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Can only dispute published grades'
        }
      });
    }

    grade.status = 'disputed';
    grade.dispute = {
      reason: reason.trim(),
      disputedBy: req.user.id,
      disputedAt: new Date()
    };

    await grade.save();

    res.json({
      success: true,
      message: 'Grade dispute submitted successfully',
      data: {
        grade
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Error disputing grade',
        details: error.message
      }
    });
  }
});

// Grade level summaries (real data)
router.get('/summary', async (req, res) => {
  try {
    const { level } = req.query;
    const where = { role: 'student' };
    if (level) where.grade = level;

    const students = await SequelizeUser.findAll({ where });

    // Aggregate real counts by grade; GPA/topCourse placeholders until grade model linkage is defined
    const byGrade = {};
    students.forEach((s) => {
      const key = s.grade || 'Unassigned';
      if (!byGrade[key]) byGrade[key] = { level: key, students: 0, averageGpa: 0, topCourse: '-', lastUpdated: new Date().toISOString() };
      byGrade[key].students += 1;
    });

    const summaries = Object.values(byGrade).sort((a, b) => a.level.localeCompare(b.level));
    res.json({ summaries });
  } catch (error) {
    res.status(500).json({ message: 'Failed to compute grade summaries', error: error.message });
  }
});

// Calculate letter grade based on percentage
function calculateLetterGrade(percentage) {
  if (percentage >= 93) return 'A';
  if (percentage >= 90) return 'A-';
  if (percentage >= 87) return 'B+';
  if (percentage >= 83) return 'B';
  if (percentage >= 80) return 'B-';
  if (percentage >= 77) return 'C+';
  if (percentage >= 73) return 'C';
  if (percentage >= 70) return 'C-';
  if (percentage >= 67) return 'D+';
  if (percentage >= 63) return 'D';
  if (percentage >= 60) return 'D-';
  return 'F';
}

// Calculate grade points based on letter grade
function calculateGradePoints(letterGrade) {
  const gradePoints = {
    'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
    'D+': 1.3, 'D': 1.0, 'D-': 0.7,
    'F': 0.0
  };
  return gradePoints[letterGrade] || 0.0;
}

module.exports = router;
