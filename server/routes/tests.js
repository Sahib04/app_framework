const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { Test, TestComment, TestSubmission, User } = require('../models');

const router = express.Router();

// Get all tests (filtered by role)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, subject, search } = req.query;
    const where = { isActive: true };
    
    if (status && status !== 'all') {
      where.status = status;
    }
    
    if (subject && subject !== 'all') {
      where.subject = subject;
    }

    let tests;
    if (req.user.role === 'teacher') {
      // Teachers see their own tests
      where.teacherId = req.user.id;
      tests = await Test.findAll({
        where,
        include: [
          { model: User, as: 'teacher', attributes: ['id', 'firstName', 'lastName', 'email'] },
          { model: TestComment, as: 'comments', include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'role'] }] },
          { model: TestSubmission, as: 'submissions', include: [{ model: User, as: 'student', attributes: ['id', 'firstName', 'lastName', 'email'] }] }
        ],
        order: [['conductDate', 'ASC']]
      });
    } else if (req.user.role === 'student') {
      // Students see all active tests
      where.status = ['upcoming', 'active'];
      tests = await Test.findAll({
        where,
        include: [
          { model: User, as: 'teacher', attributes: ['id', 'firstName', 'lastName', 'email'] },
          { model: TestComment, as: 'comments', include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'role'] }] },
          { model: TestSubmission, as: 'submissions', where: { studentId: req.user.id } }
        ],
        order: [['conductDate', 'ASC']]
      });
    } else if (req.user.role === 'admin') {
      // Admins see all tests
      tests = await Test.findAll({
        where,
        include: [
          { model: User, as: 'teacher', attributes: ['id', 'firstName', 'lastName', 'email'] },
          { model: TestComment, as: 'comments', include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'role'] }] },
          { model: TestSubmission, as: 'submissions', include: [{ model: User, as: 'student', attributes: ['id', 'firstName', 'lastName', 'email'] }] }
        ],
        order: [['conductDate', 'ASC']]
      });
    }

    // Filter by search if provided
    if (search) {
      tests = tests.filter(test => 
        test.title.toLowerCase().includes(search.toLowerCase()) ||
        test.subject.toLowerCase().includes(search.toLowerCase()) ||
        test.topic.toLowerCase().includes(search.toLowerCase())
      );
    }

    res.json({
      success: true,
      tests: tests || []
    });
  } catch (error) {
    console.error('Error fetching tests:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    });
  }
});

// Get test by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const test = await Test.findByPk(req.params.id, {
      include: [
        { model: User, as: 'teacher', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: TestComment, as: 'comments', include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'role'] }] },
        { model: TestSubmission, as: 'submissions', include: [{ model: User, as: 'student', attributes: ['id', 'firstName', 'lastName', 'email'] }] }
      ]
    });

    if (!test) {
      return res.status(404).json({ 
        success: false,
        message: 'Test not found' 
      });
    }

    res.json({
      success: true,
      test
    });
  } catch (error) {
    console.error('Error fetching test:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    });
  }
});

// Create test (teacher only)
router.post('/', authenticateToken, authorizeRoles('teacher', 'admin'), [
  body('title').trim().isLength({ min: 3, max: 200 }).withMessage('Title must be 3-200 characters'),
  body('subject').trim().isLength({ min: 2, max: 100 }).withMessage('Subject must be 2-100 characters'),
  body('topic').trim().isLength({ min: 10 }).withMessage('Topic must be at least 10 characters'),
  body('totalMarks').isInt({ min: 1, max: 100 }).withMessage('Total marks must be 1-100'),
  body('duration').isInt({ min: 15, max: 300 }).withMessage('Duration must be 15-300 minutes'),
  body('announcementDate').isISO8601().withMessage('Valid announcement date required'),
  body('conductDate').isISO8601().withMessage('Valid conduct date required'),
  body('instructions').optional().trim().isLength({ max: 1000 }).withMessage('Instructions must be under 1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const testData = {
      ...req.body,
      teacherId: req.user.id,
      status: 'upcoming'
    };

    const test = await Test.create(testData);
    
    const createdTest = await Test.findByPk(test.id, {
      include: [
        { model: User, as: 'teacher', attributes: ['id', 'firstName', 'lastName', 'email'] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Test created successfully',
      test: createdTest
    });
  } catch (error) {
    console.error('Error creating test:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    });
  }
});

// Update test (teacher who created it or admin)
router.put('/:id', authenticateToken, authorizeRoles('teacher', 'admin'), [
  body('title').optional().trim().isLength({ min: 3, max: 200 }).withMessage('Title must be 3-200 characters'),
  body('subject').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Subject must be 2-100 characters'),
  body('topic').optional().trim().isLength({ min: 10 }).withMessage('Topic must be at least 10 characters'),
  body('totalMarks').optional().isInt({ min: 1, max: 100 }).withMessage('Total marks must be 1-100'),
  body('duration').optional().isInt({ min: 15, max: 300 }).withMessage('Duration must be 15-300 minutes'),
  body('announcementDate').optional().isISO8601().withMessage('Valid announcement date required'),
  body('conductDate').optional().isISO8601().withMessage('Valid conduct date required'),
  body('instructions').optional().trim().isLength({ max: 1000 }).withMessage('Instructions must be under 1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const test = await Test.findByPk(req.params.id);
    if (!test) {
      return res.status(404).json({ 
        success: false,
        message: 'Test not found' 
      });
    }

    // Only teacher who created it or admin can update
    if (req.user.role === 'teacher' && test.teacherId !== req.user.id) {
      return res.status(403).json({ 
        success: false,
        message: 'You can only update your own tests' 
      });
    }

    await test.update(req.body);
    
    const updatedTest = await Test.findByPk(test.id, {
      include: [
        { model: User, as: 'teacher', attributes: ['id', 'firstName', 'lastName', 'email'] }
      ]
    });

    res.json({
      success: true,
      message: 'Test updated successfully',
      test: updatedTest
    });
  } catch (error) {
    console.error('Error updating test:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    });
  }
});

// Delete test (teacher who created it or admin)
router.delete('/:id', authenticateToken, authorizeRoles('teacher', 'admin'), async (req, res) => {
  try {
    const test = await Test.findByPk(req.params.id);
    if (!test) {
      return res.status(404).json({ 
        success: false,
        message: 'Test not found' 
      });
    }

    // Only teacher who created it or admin can delete
    if (req.user.role === 'teacher' && test.teacherId !== req.user.id) {
      return res.status(403).json({ 
        success: false,
        message: 'You can only delete your own tests' 
      });
    }

    await test.update({ isActive: false });

    res.json({
      success: true,
      message: 'Test deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting test:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    });
  }
});

// Add comment to test
router.post('/:id/comments', authenticateToken, [
  body('content').trim().isLength({ min: 1, max: 500 }).withMessage('Comment must be 1-500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const test = await Test.findByPk(req.params.id);
    if (!test) {
      return res.status(404).json({ 
        success: false,
        message: 'Test not found' 
      });
    }

    const comment = await TestComment.create({
      content: req.body.content,
      testId: req.params.id,
      userId: req.user.id,
      isTeacherReply: req.user.role === 'teacher'
    });

    const createdComment = await TestComment.findByPk(comment.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'role'] }]
    });

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment: createdComment
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    });
  }
});

// Get test comments
router.get('/:id/comments', authenticateToken, async (req, res) => {
  try {
    const comments = await TestComment.findAll({
      where: { 
        testId: req.params.id,
        isActive: true
      },
      include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'role'] }],
      order: [['createdAt', 'ASC']]
    });

    res.json({
      success: true,
      comments
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    });
  }
});

// Submit test (student only)
router.post('/:id/submit', authenticateToken, authorizeRoles('student'), async (req, res) => {
  try {
    const test = await Test.findByPk(req.params.id);
    if (!test) {
      return res.status(404).json({ 
        success: false,
        message: 'Test not found' 
      });
    }

    if (test.status !== 'active') {
      return res.status(400).json({ 
        success: false,
        message: 'Test is not currently active' 
      });
    }

    // Check if student already submitted
    const existingSubmission = await TestSubmission.findOne({
      where: { testId: req.params.id, studentId: req.user.id }
    });

    if (existingSubmission) {
      return res.status(400).json({ 
        success: false,
        message: 'You have already submitted this test' 
      });
    }

    const submission = await TestSubmission.create({
      testId: req.params.id,
      studentId: req.user.id,
      submittedAt: new Date(),
      status: 'submitted'
    });

    res.status(201).json({
      success: true,
      message: 'Test submitted successfully',
      submission
    });
  } catch (error) {
    console.error('Error submitting test:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    });
  }
});

// Grade test submission (teacher only)
router.put('/:id/submissions/:submissionId/grade', authenticateToken, authorizeRoles('teacher', 'admin'), [
  body('score').isInt({ min: 0 }).withMessage('Score must be a positive integer'),
  body('feedback').optional().trim().isLength({ max: 1000 }).withMessage('Feedback must be under 1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const test = await Test.findByPk(req.params.id);
    if (!test) {
      return res.status(404).json({ 
        success: false,
        message: 'Test not found' 
      });
    }

    // Only teacher who created it or admin can grade
    if (req.user.role === 'teacher' && test.teacherId !== req.user.id) {
      return res.status(403).json({ 
        success: false,
        message: 'You can only grade submissions for your own tests' 
      });
    }

    const submission = await TestSubmission.findByPk(req.params.submissionId);
    if (!submission) {
      return res.status(404).json({ 
        success: false,
        message: 'Submission not found' 
      });
    }

    await submission.update({
      score: req.body.score,
      feedback: req.body.feedback,
      status: 'graded'
    });

    res.json({
      success: true,
      message: 'Test graded successfully',
      submission
    });
  } catch (error) {
    console.error('Error grading test:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    });
  }
});

module.exports = router;
