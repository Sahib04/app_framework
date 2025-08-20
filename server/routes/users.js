const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { authenticateToken, authorizeRoles, authorizeResource } = require('../middleware/auth');

const router = express.Router();

// Get peers for messaging (teacher -> students, student -> teachers)
router.get('/peers', authenticateToken, async (req, res) => {
  try {
    const { Op } = require('sequelize');
    let targetRole = null;
    if (req.user.role === 'teacher') targetRole = 'student';
    else if (req.user.role === 'student') targetRole = 'teacher';
    else if (req.user.role === 'admin') targetRole = req.query.role || 'student';
    else targetRole = 'teacher';

    const search = req.query.search || '';
    const where = { role: targetRole, isActive: true };
    if (search) {
      where[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const users = await User.findAll({
      where,
      attributes: ['id', 'firstName', 'lastName', 'email', 'role', 'profilePicture'],
      order: [['firstName', 'ASC'], ['lastName', 'ASC']]
    });

    res.json(users);
  } catch (error) {
    console.error('Error fetching peers:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create user (admin)
router.post('/', authenticateToken, authorizeRoles(['admin']), [
  body('role').isIn(['admin','teacher','student','parent']).withMessage('Invalid role'),
  body('firstName').trim().isLength({ min: 2, max: 50 }),
  body('lastName').trim().isLength({ min: 2, max: 50 }),
  body('email').isEmail(),
  body('password').optional().isLength({ min: 6 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const existing = await User.findOne({ where: { email: req.body.email } });
    if (existing) return res.status(400).json({ message: 'Email already exists' });

    const payload = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      role: req.body.role,
      phone: req.body.phone || null,
      isActive: req.body.isActive !== undefined ? !!req.body.isActive : true,
      isEmailVerified: req.body.isEmailVerified !== undefined ? !!req.body.isEmailVerified : true,
      department: req.body.department,
      specialization: req.body.specialization,
      studentId: req.body.studentId,
      grade: req.body.grade,
      section: req.body.section,
      enrollmentDate: req.body.enrollmentDate || null,
    };

    // Hash password if provided
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      payload.password = await bcrypt.hash(req.body.password, salt);
    } else {
      // default password for parent accounts, etc.
      const salt = await bcrypt.genSalt(10);
      payload.password = await bcrypt.hash('ChangeMe123!', salt);
    }

    const created = await User.create(payload);
    const safe = await User.findByPk(created.id, { attributes: { exclude: ['password'] } });
    res.status(201).json(safe);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create student with guardian(s) (admin)
router.post('/students', authenticateToken, authorizeRoles(['admin']), [
  body('student.firstName').trim().isLength({ min: 2, max: 50 }),
  body('student.lastName').trim().isLength({ min: 2, max: 50 }),
  body('student.email').isEmail(),
  body('student.grade').optional().isString(),
  body('student.section').optional().isString(),
  body('guardians').isArray().withMessage('guardians must be array'),
], async (req, res) => {
  const t = await User.sequelize.transaction();
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { student, guardians } = req.body;
    const exists = await User.findOne({ where: { email: student.email } });
    if (exists) return res.status(400).json({ message: 'Student email already exists' });

    // Create student
    const salt = await bcrypt.genSalt(10);
    const studentPayload = {
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      role: 'student',
      phone: student.phone || null,
      studentId: student.studentId || null,
      grade: student.grade || null,
      section: student.section || null,
      enrollmentDate: student.enrollmentDate || null,
      isActive: true,
      isEmailVerified: true,
      password: await bcrypt.hash(student.password || 'student123', salt),
    };
    const createdStudent = await User.create(studentPayload, { transaction: t });
    const studentIdValue = createdStudent.studentId || createdStudent.id;

    // Create guardians (parents). If parent email exists, attach child; else create.
    for (const g of guardians) {
      if (!g || !g.email) continue;
      let parent = await User.findOne({ where: { email: g.email }, transaction: t });
      if (!parent) {
        const psalt = await bcrypt.genSalt(10);
        parent = await User.create({
          firstName: g.firstName || 'Guardian',
          lastName: g.lastName || '',
          email: g.email,
          role: 'parent',
          phone: g.phone || null,
          isActive: true,
          isEmailVerified: true,
          password: await bcrypt.hash(g.password || 'parent123', psalt),
          children: [{ studentId: String(studentIdValue), relation: g.relation || 'guardian' }],
        }, { transaction: t });
      } else {
        const kids = Array.isArray(parent.children) ? parent.children : [];
        if (!kids.some(k => (k?.studentId || k) === String(studentIdValue))) {
          kids.push({ studentId: String(studentIdValue), relation: g.relation || 'guardian' });
          parent.children = kids;
          await parent.save({ transaction: t });
        }
      }
    }

    await t.commit();
    const safe = await User.findByPk(createdStudent.id, { attributes: { exclude: ['password'] } });
    res.status(201).json(safe);
  } catch (error) {
    await t.rollback();
    console.error('Error creating student with guardians:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all users (admin only)
router.get('/', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const { role, isActive, search, page = 1, limit = 10 } = req.query;
    
    const { Op } = require('sequelize');
    
    const where = {};
    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (search) {
      where[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const offset = (page - 1) * limit;
    const users = await User.findAll({
      where,
      attributes: { exclude: ['password'] },
      offset,
      limit: parseInt(limit),
      order: [['createdAt', 'DESC']]
    });

    const total = await User.count({ where });

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user by ID (admin or self)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!authorizeResource(req.user, user)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update user (admin only)
router.put('/:id', authenticateToken, authorizeRoles(['admin']), [
  body('firstName').optional().trim().isLength({ min: 2, max: 50 }),
  body('lastName').optional().trim().isLength({ min: 2, max: 50 }),
  body('email').optional().isEmail(),
  body('phone').optional().isMobilePhone(),
  body('role').optional().isIn(['admin', 'teacher', 'student', 'parent']),
  body('isActive').optional().isBoolean(),
  body('isEmailVerified').optional().isBoolean(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const allowedFields = ['firstName', 'lastName', 'email', 'phone', 'role', 'isActive', 'isEmailVerified', 'department', 'specialization', 'studentId', 'grade', 'section'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) user[field] = req.body[field];
    });

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    await user.save();
    const safe = await User.findByPk(user.id, { attributes: { exclude: ['password'] } });
    res.json(safe);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Change password
router.put('/change-password', authenticateToken, [
  body('currentPassword').isLength({ min: 6 }),
  body('newPassword').isLength({ min: 6 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete user (admin only)
router.delete('/:id', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent admin from deleting themselves
    if (user.id === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    await user.destroy();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get students (teacher/admin only)
router.get('/students/list', authenticateToken, authorizeRoles(['admin', 'teacher']), async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    
    const filter = { role: 'student' };
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const students = await User.findAll({
      where: filter,
      attributes: { exclude: ['password'] },
      offset: skip,
      limit: parseInt(limit),
      order: [['firstName', 'ASC'], ['lastName', 'ASC']]
    });

    const total = await User.count({ where: filter });

    res.json({
      students,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get teachers (admin only)
router.get('/teachers/list', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    
    const filter = { role: 'teacher' };
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const teachers = await User.findAll({
      where: filter,
      attributes: { exclude: ['password'] },
      offset: skip,
      limit: parseInt(limit),
      order: [['firstName', 'ASC'], ['lastName', 'ASC']]
    });

    const total = await User.count({ where: filter });

    res.json({
      teachers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching teachers:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get parents (admin/teacher only)
router.get('/parents/list', authenticateToken, authorizeRoles(['admin', 'teacher']), async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    
    const filter = { role: 'parent' };
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const parents = await User.findAll({
      where: filter,
      attributes: { exclude: ['password'] },
      offset: skip,
      limit: parseInt(limit),
      order: [['firstName', 'ASC'], ['lastName', 'ASC']]
    });

    const total = await User.count({ where: filter });

    res.json({
      parents,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching parents:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Bulk operations (admin only)
router.post('/bulk', authenticateToken, authorizeRoles(['admin']), [
  body('action').isIn(['activate', 'deactivate', 'delete']),
  body('userIds').isArray().notEmpty(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { action, userIds } = req.body;
    let result;

    switch (action) {
      case 'activate':
        result = await User.updateMany(
          { _id: { $in: userIds } },
          { $set: { isActive: true } }
        );
        break;
      case 'deactivate':
        result = await User.updateMany(
          { _id: { $in: userIds } },
          { $set: { isActive: false } }
        );
        break;
      case 'delete':
        result = await User.deleteMany({ _id: { $in: userIds } });
        break;
    }

    res.json({
      message: `Bulk ${action} completed successfully`,
      modifiedCount: result.modifiedCount || result.deletedCount,
    });
  } catch (error) {
    console.error('Error in bulk operation:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get guardians for a student (admin/teacher)
router.get('/guardians-of/:student', authenticateToken, authorizeRoles(['admin','teacher']), async (req, res) => {
  try {
    const { Op } = require('sequelize');
    const studentParam = req.params.student; // could be UUID or studentId string

    let student = null;
    if (/^[0-9a-fA-F-]{36}$/.test(studentParam)) {
      student = await User.findByPk(studentParam);
    }

    const studentIdValue = student?.studentId || studentParam;

    const parents = await User.findAll({ where: { role: 'parent', isActive: true }, attributes: ['id','firstName','lastName','email','phone','profilePicture','children'] });
    const guardians = parents.filter(p => {
      const kids = Array.isArray(p.children) ? p.children : [];
      return kids.some(k => (k?.studentId || k) === studentIdValue);
    }).map(p => ({ id: p.id, firstName: p.firstName, lastName: p.lastName, email: p.email, phone: p.phone, profilePicture: p.profilePicture }));

    res.json({ guardians, by: studentIdValue });
  } catch (error) {
    console.error('Error fetching guardians:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
