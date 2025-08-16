const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Get all assignments
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { 
      courseId, 
      status, 
      type, 
      dueDate, 
      page = 1, 
      limit = 10 
    } = req.query;
    
    const filter = {};

    if (courseId) filter.courseId = courseId;
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (dueDate) {
      const date = new Date(dueDate);
      filter.dueDate = {
        $gte: date,
        $lt: new Date(date.getTime() + 24 * 60 * 60 * 1000)
      };
    }

    // Role-based filtering
    if (req.user.role === 'student') {
      // Get assignments for courses the student is enrolled in
      // This would need to be implemented based on enrollment
      filter.courseId = { $in: [] }; // Placeholder
    } else if (req.user.role === 'teacher') {
      filter.teacherId = req.user.id;
    }

    const skip = (page - 1) * limit;
    // const assignments = await Assignment.find(filter)
    //   .populate('courseId', 'title code')
    //   .populate('teacherId', 'firstName lastName email')
    //   .skip(skip)
    //   .limit(parseInt(limit))
    //   .sort({ dueDate: 1 });

    // const total = await Assignment.countDocuments(filter);

    // Placeholder response until Assignment model is created
    res.json({
      assignments: [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: 0,
        pages: 0,
      },
    });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get assignment by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    // const assignment = await Assignment.findById(req.params.id)
    //   .populate('courseId', 'title code')
    //   .populate('teacherId', 'firstName lastName email');

    // if (!assignment) {
    //   return res.status(404).json({ message: 'Assignment not found' });
    // }

    // res.json(assignment);
    
    // Placeholder response
    res.status(404).json({ message: 'Assignment not found' });
  } catch (error) {
    console.error('Error fetching assignment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create assignment (teacher only)
router.post('/', authenticateToken, authorizeRoles(['teacher']), [
  body('courseId').isMongoId(),
  body('title').trim().isLength({ min: 3, max: 200 }),
  body('description').trim().isLength({ min: 10, max: 2000 }),
  body('type').isIn(['homework', 'project', 'quiz', 'exam', 'essay', 'presentation']),
  body('dueDate').isISO8601(),
  body('maxScore').isInt({ min: 1 }),
  body('weight').optional().isFloat({ min: 0, max: 100 }),
  body('instructions').optional().trim().isLength({ max: 1000 }),
  body('attachments').optional().isArray(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // const assignment = new Assignment({
    //   ...req.body,
    //   teacherId: req.user.id,
    //   status: 'active',
    //   createdAt: new Date(),
    // });

    // await assignment.save();

    // const populatedAssignment = await Assignment.findById(assignment._id)
    //   .populate('courseId', 'title code')
    //   .populate('teacherId', 'firstName lastName email');

    // res.status(201).json(populatedAssignment);
    
    // Placeholder response
    res.status(201).json({ message: 'Assignment created successfully' });
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update assignment (teacher only)
router.put('/:id', authenticateToken, authorizeRoles(['teacher']), [
  body('title').optional().trim().isLength({ min: 3, max: 200 }),
  body('description').optional().trim().isLength({ min: 10, max: 2000 }),
  body('type').optional().isIn(['homework', 'project', 'quiz', 'exam', 'essay', 'presentation']),
  body('dueDate').optional().isISO8601(),
  body('maxScore').optional().isInt({ min: 1 }),
  body('weight').optional().isFloat({ min: 0, max: 100 }),
  body('instructions').optional().trim().isLength({ max: 1000 }),
  body('status').optional().isIn(['active', 'inactive', 'extended']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // const assignment = await Assignment.findById(req.params.id);
    // if (!assignment) {
    //   return res.status(404).json({ message: 'Assignment not found' });
    // }

    // // Check if teacher owns this assignment
    // if (assignment.teacherId.toString() !== req.user.id) {
    //   return res.status(403).json({ message: 'Access denied' });
    // }

    // Object.assign(assignment, req.body);
    // await assignment.save();

    // const updatedAssignment = await Assignment.findById(assignment._id)
    //   .populate('courseId', 'title code')
    //   .populate('teacherId', 'firstName lastName email');

    // res.json(updatedAssignment);
    
    // Placeholder response
    res.json({ message: 'Assignment updated successfully' });
  } catch (error) {
    console.error('Error updating assignment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete assignment (teacher only)
router.delete('/:id', authenticateToken, authorizeRoles(['teacher']), async (req, res) => {
  try {
    // const assignment = await Assignment.findById(req.params.id);
    // if (!assignment) {
    //   return res.status(404).json({ message: 'Assignment not found' });
    // }

    // // Check if teacher owns this assignment
    // if (assignment.teacherId.toString() !== req.user.id) {
    //   return res.status(403).json({ message: 'Access denied' });
    // }

    // // Check if there are submissions
    // const submissionCount = await Submission.countDocuments({ assignmentId: req.params.id });
    // if (submissionCount > 0) {
    //   return res.status(400).json({ 
    //     message: 'Cannot delete assignment with submissions' 
    //   });
    // }

    // await Assignment.findByIdAndDelete(req.params.id);
    // res.json({ message: 'Assignment deleted successfully' });
    
    // Placeholder response
    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Submit assignment (student only)
router.post('/:id/submit', authenticateToken, authorizeRoles(['student']), [
  body('content').trim().isLength({ min: 1, max: 10000 }),
  body('attachments').optional().isArray(),
  body('notes').optional().trim().isLength({ max: 500 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // const assignment = await Assignment.findById(req.params.id);
    // if (!assignment) {
    //   return res.status(404).json({ message: 'Assignment not found' });
    // }

    // // Check if student is enrolled in the course
    // const isEnrolled = await Course.findOne({
    //   _id: assignment.courseId,
    //   enrolledStudents: req.user.id
    // });
    // if (!isEnrolled) {
    //   return res.status(403).json({ message: 'Not enrolled in this course' });
    // }

    // // Check if already submitted
    // const existingSubmission = await Submission.findOne({
    //   assignmentId: req.params.id,
    //   studentId: req.user.id
    // });
    // if (existingSubmission) {
    //   return res.status(400).json({ message: 'Already submitted' });
    // }

    // // Check if due date has passed
    // if (new Date() > assignment.dueDate) {
    //   return res.status(400).json({ message: 'Assignment due date has passed' });
    // }

    // const submission = new Submission({
    //   assignmentId: req.params.id,
    //   studentId: req.user.id,
    //   content: req.body.content,
    //   attachments: req.body.attachments || [],
    //   notes: req.body.notes,
    //   submittedAt: new Date(),
    //   status: 'submitted',
    // });

    // await submission.save();

    // const populatedSubmission = await Submission.findById(submission._id)
    //   .populate('studentId', 'firstName lastName email')
    //   .populate('assignmentId', 'title dueDate');

    // res.status(201).json(populatedSubmission);
    
    // Placeholder response
    res.status(201).json({ message: 'Assignment submitted successfully' });
  } catch (error) {
    console.error('Error submitting assignment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get assignment submissions (teacher only)
router.get('/:id/submissions', authenticateToken, authorizeRoles(['teacher']), async (req, res) => {
  try {
    // const assignment = await Assignment.findById(req.params.id);
    // if (!assignment) {
    //   return res.status(404).json({ message: 'Assignment not found' });
    // }

    // // Check if teacher owns this assignment
    // if (assignment.teacherId.toString() !== req.user.id) {
    //   return res.status(403).json({ message: 'Access denied' });
    // }

    // const submissions = await Submission.find({ assignmentId: req.params.id })
    //   .populate('studentId', 'firstName lastName email studentId')
    //   .sort({ submittedAt: -1 });

    // res.json(submissions);
    
    // Placeholder response
    res.json([]);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Grade submission (teacher only)
router.post('/submissions/:submissionId/grade', authenticateToken, authorizeRoles(['teacher']), [
  body('score').isFloat({ min: 0 }),
  body('feedback').optional().trim().isLength({ max: 1000 }),
  body('comments').optional().trim().isLength({ max: 500 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // const submission = await Submission.findById(req.params.submissionId)
    //   .populate('assignmentId')
    //   .populate('studentId', 'firstName lastName email');

    // if (!submission) {
    //   return res.status(404).json({ message: 'Submission not found' });
    // }

    // // Check if teacher owns the assignment
    // if (submission.assignmentId.teacherId.toString() !== req.user.id) {
    //   return res.status(403).json({ message: 'Access denied' });
    // }

    // submission.score = req.body.score;
    // submission.maxScore = submission.assignmentId.maxScore;
    // submission.percentage = (req.body.score / submission.assignmentId.maxScore) * 100;
    // submission.feedback = req.body.feedback;
    // submission.comments = req.body.comments;
    // submission.gradedBy = req.user.id;
    // submission.gradedAt = new Date();
    // submission.status = 'graded';

    // await submission.save();

    // res.json(submission);
    
    // Placeholder response
    res.json({ message: 'Submission graded successfully' });
  } catch (error) {
    console.error('Error grading submission:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get student's submissions
router.get('/student/submissions', authenticateToken, authorizeRoles(['student']), async (req, res) => {
  try {
    // const submissions = await Submission.find({ studentId: req.user.id })
    //   .populate('assignmentId', 'title dueDate maxScore')
    //   .populate('courseId', 'title code')
    //   .sort({ submittedAt: -1 });

    // res.json(submissions);
    
    // Placeholder response
    res.json([]);
  } catch (error) {
    console.error('Error fetching student submissions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get assignment statistics
router.get('/:id/statistics', authenticateToken, authorizeRoles(['teacher']), async (req, res) => {
  try {
    // const assignment = await Assignment.findById(req.params.id);
    // if (!assignment) {
    //   return res.status(404).json({ message: 'Assignment not found' });
    // }

    // // Check if teacher owns this assignment
    // if (assignment.teacherId.toString() !== req.user.id) {
    //   return res.status(403).json({ message: 'Access denied' });
    // }

    // const submissions = await Submission.find({ assignmentId: req.params.id });
    // const totalStudents = await Course.findById(assignment.courseId).then(course => course.enrolledStudents.length);

    // const statistics = {
    //   totalStudents,
    //   submittedCount: submissions.length,
    //   submittedPercentage: (submissions.length / totalStudents) * 100,
    //   gradedCount: submissions.filter(s => s.status === 'graded').length,
    //   averageScore: submissions.filter(s => s.score).reduce((sum, s) => sum + s.score, 0) / submissions.filter(s => s.score).length || 0,
    //   averagePercentage: submissions.filter(s => s.percentage).reduce((sum, s) => sum + s.percentage, 0) / submissions.filter(s => s.percentage).length || 0,
    // };

    // res.json(statistics);
    
    // Placeholder response
    res.json({
      totalStudents: 0,
      submittedCount: 0,
      submittedPercentage: 0,
      gradedCount: 0,
      averageScore: 0,
      averagePercentage: 0,
    });
  } catch (error) {
    console.error('Error fetching assignment statistics:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
