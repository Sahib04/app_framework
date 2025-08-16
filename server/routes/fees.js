const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Get all fees
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { 
      studentId, 
      status, 
      type, 
      dueDate, 
      page = 1, 
      limit = 10 
    } = req.query;
    
    const filter = {};
    if (studentId) filter.studentId = studentId;
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
      filter.studentId = req.user.id;
    } else if (req.user.role === 'parent') {
      // Get student IDs associated with this parent
      // This would need to be implemented based on your parent-student relationship
      filter.studentId = { $in: [] }; // Placeholder
    }

    const skip = (page - 1) * limit;
    // const fees = await Fee.find(filter)
    //   .populate('studentId', 'firstName lastName email studentId')
    //   .skip(skip)
    //   .limit(parseInt(limit))
    //   .sort({ dueDate: 1 });

    // const total = await Fee.countDocuments(filter);

    // Placeholder response until Fee model is created
    res.json({
      fees: [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: 0,
        pages: 0,
      },
    });
  } catch (error) {
    console.error('Error fetching fees:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get fee by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    // const fee = await Fee.findById(req.params.id)
    //   .populate('studentId', 'firstName lastName email studentId')
    //   .populate('courseId', 'title code');

    // if (!fee) {
    //   return res.status(404).json({ message: 'Fee not found' });
    // }

    // // Check if user has permission to view this fee
    // if (req.user.role === 'student' && fee.studentId._id.toString() !== req.user.id) {
    //   return res.status(403).json({ message: 'Access denied' });
    // }

    // res.json(fee);
    
    // Placeholder response
    res.status(404).json({ message: 'Fee not found' });
  } catch (error) {
    console.error('Error fetching fee:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create fee (admin only)
router.post('/', authenticateToken, authorizeRoles(['admin']), [
  body('studentId').isMongoId(),
  body('type').isIn(['tuition', 'library', 'laboratory', 'transportation', 'other']),
  body('amount').isFloat({ min: 0 }),
  body('dueDate').isISO8601(),
  body('description').optional().trim().isLength({ max: 500 }),
  body('courseId').optional().isMongoId(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // const fee = new Fee({
    //   ...req.body,
    //   status: 'pending',
    //   createdAt: new Date(),
    // });

    // await fee.save();

    // const populatedFee = await Fee.findById(fee._id)
    //   .populate('studentId', 'firstName lastName email studentId')
    //   .populate('courseId', 'title code');

    // res.status(201).json(populatedFee);
    
    // Placeholder response
    res.status(201).json({ message: 'Fee created successfully' });
  } catch (error) {
    console.error('Error creating fee:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update fee (admin only)
router.put('/:id', authenticateToken, authorizeRoles(['admin']), [
  body('type').optional().isIn(['tuition', 'library', 'laboratory', 'transportation', 'other']),
  body('amount').optional().isFloat({ min: 0 }),
  body('dueDate').optional().isISO8601(),
  body('description').optional().trim().isLength({ max: 500 }),
  body('status').optional().isIn(['pending', 'paid', 'overdue', 'cancelled']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // const fee = await Fee.findById(req.params.id);
    // if (!fee) {
    //   return res.status(404).json({ message: 'Fee not found' });
    // }

    // Object.assign(fee, req.body);
    // await fee.save();

    // const updatedFee = await Fee.findById(fee._id)
    //   .populate('studentId', 'firstName lastName email studentId')
    //   .populate('courseId', 'title code');

    // res.json(updatedFee);
    
    // Placeholder response
    res.json({ message: 'Fee updated successfully' });
  } catch (error) {
    console.error('Error updating fee:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Process payment
router.post('/:id/pay', authenticateToken, [
  body('amount').isFloat({ min: 0 }),
  body('paymentMethod').isIn(['cash', 'card', 'bank_transfer', 'online']),
  body('transactionId').optional().trim(),
  body('notes').optional().trim().isLength({ max: 500 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // const fee = await Fee.findById(req.params.id);
    // if (!fee) {
    //   return res.status(404).json({ message: 'Fee not found' });
    // }

    // // Check if user has permission to pay this fee
    // if (req.user.role === 'student' && fee.studentId.toString() !== req.user.id) {
    //   return res.status(403).json({ message: 'Access denied' });
    // }

    // if (fee.status === 'paid') {
    //   return res.status(400).json({ message: 'Fee is already paid' });
    // }

    // const payment = {
    //   amount: req.body.amount,
    //   paymentMethod: req.body.paymentMethod,
    //   transactionId: req.body.transactionId,
    //   notes: req.body.notes,
    //   paidBy: req.user.id,
    //   paidAt: new Date(),
    // };

    // fee.payments.push(payment);
    // fee.status = 'paid';
    // fee.paidAt = new Date();

    // await fee.save();

    // res.json({ 
    //   message: 'Payment processed successfully',
    //   fee 
    // });
    
    // Placeholder response
    res.json({ message: 'Payment processed successfully' });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get fee statistics
router.get('/statistics/overview', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    // const totalFees = await Fee.countDocuments();
    // const pendingFees = await Fee.countDocuments({ status: 'pending' });
    // const paidFees = await Fee.countDocuments({ status: 'paid' });
    // const overdueFees = await Fee.countDocuments({ 
    //   status: 'pending', 
    //   dueDate: { $lt: new Date() } 
    // });

    // const totalAmount = await Fee.aggregate([
    //   { $group: { _id: null, total: { $sum: '$amount' } } }
    // ]);

    // const paidAmount = await Fee.aggregate([
    //   { $match: { status: 'paid' } },
    //   { $group: { _id: null, total: { $sum: '$amount' } } }
    // ]);

    // Placeholder response
    res.json({
      totalFees: 0,
      pendingFees: 0,
      paidFees: 0,
      overdueFees: 0,
      totalAmount: 0,
      paidAmount: 0,
      outstandingAmount: 0,
    });
  } catch (error) {
    console.error('Error fetching fee statistics:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get student fee history
router.get('/student/:studentId/history', authenticateToken, async (req, res) => {
  try {
    // Check if user has permission to view this student's fees
    if (req.user.role === 'student' && req.params.studentId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // const fees = await Fee.find({ studentId: req.params.studentId })
    //   .populate('courseId', 'title code')
    //   .sort({ dueDate: -1 });

    // res.json(fees);
    
    // Placeholder response
    res.json([]);
  } catch (error) {
    console.error('Error fetching student fee history:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Generate fee report
router.get('/report/generate', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const { startDate, endDate, status, type } = req.query;
    
    const filter = {};
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    if (status) filter.status = status;
    if (type) filter.type = type;

    // const fees = await Fee.find(filter)
    //   .populate('studentId', 'firstName lastName email studentId')
    //   .populate('courseId', 'title code')
    //   .sort({ createdAt: -1 });

    // Generate report logic here
    // This could include creating PDF, Excel, or other formats

    // res.json({
    //   fees,
    //   summary: {
    //     totalFees: fees.length,
    //     totalAmount: fees.reduce((sum, fee) => sum + fee.amount, 0),
    //     paidAmount: fees.filter(f => f.status === 'paid').reduce((sum, fee) => sum + fee.amount, 0),
    //   }
    // });
    
    // Placeholder response
    res.json({
      fees: [],
      summary: {
        totalFees: 0,
        totalAmount: 0,
        paidAmount: 0,
      }
    });
  } catch (error) {
    console.error('Error generating fee report:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
