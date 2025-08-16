const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Get user's messages
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { 
      type, 
      search, 
      page = 1, 
      limit = 20 
    } = req.query;
    
    const filter = {
      $or: [
        { senderId: req.user.id },
        { recipientId: req.user.id }
      ]
    };

    if (type === 'sent') {
      filter.senderId = req.user.id;
    } else if (type === 'received') {
      filter.recipientId = req.user.id;
    }

    if (search) {
      filter.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    // const messages = await Message.find(filter)
    //   .populate('senderId', 'firstName lastName email')
    //   .populate('recipientId', 'firstName lastName email')
    //   .skip(skip)
    //   .limit(parseInt(limit))
    //   .sort({ createdAt: -1 });

    // const total = await Message.countDocuments(filter);

    // Placeholder response until Message model is created
    res.json({
      messages: [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: 0,
        pages: 0,
      },
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get message by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    // const message = await Message.findById(req.params.id)
    //   .populate('senderId', 'firstName lastName email')
    //   .populate('recipientId', 'firstName lastName email');

    // if (!message) {
    //   return res.status(404).json({ message: 'Message not found' });
    // }

    // // Check if user has permission to view this message
    // if (message.senderId._id.toString() !== req.user.id && 
    //     message.recipientId._id.toString() !== req.user.id) {
    //   return res.status(403).json({ message: 'Access denied' });
    // }

    // // Mark as read if recipient is viewing
    // if (message.recipientId._id.toString() === req.user.id && !message.isRead) {
    //   message.isRead = true;
    //   message.readAt = new Date();
    //   await message.save();
    // }

    // res.json(message);
    
    // Placeholder response
    res.status(404).json({ message: 'Message not found' });
  } catch (error) {
    console.error('Error fetching message:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Send message
router.post('/', authenticateToken, [
  body('recipientId').isMongoId(),
  body('subject').trim().isLength({ min: 1, max: 200 }),
  body('content').trim().isLength({ min: 1, max: 2000 }),
  body('priority').optional().isIn(['low', 'normal', 'high', 'urgent']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // const message = new Message({
    //   senderId: req.user.id,
    //   recipientId: req.body.recipientId,
    //   subject: req.body.subject,
    //   content: req.body.content,
    //   priority: req.body.priority || 'normal',
    //   isRead: false,
    //   createdAt: new Date(),
    // });

    // await message.save();

    // const populatedMessage = await Message.findById(message._id)
    //   .populate('senderId', 'firstName lastName email')
    //   .populate('recipientId', 'firstName lastName email');

    // // Send real-time notification if Socket.io is available
    // if (req.app.get('io')) {
    //   req.app.get('io').to(req.body.recipientId).emit('new_message', {
    //     message: populatedMessage,
    //     notification: `New message from ${req.user.firstName} ${req.user.lastName}`
    //   });
    // }

    // res.status(201).json(populatedMessage);
    
    // Placeholder response
    res.status(201).json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Reply to message
router.post('/:id/reply', authenticateToken, [
  body('content').trim().isLength({ min: 1, max: 2000 }),
  body('priority').optional().isIn(['low', 'normal', 'high', 'urgent']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // const originalMessage = await Message.findById(req.params.id);
    // if (!originalMessage) {
    //   return res.status(404).json({ message: 'Original message not found' });
    // }

    // // Check if user has permission to reply
    // if (originalMessage.senderId.toString() !== req.user.id && 
    //     originalMessage.recipientId.toString() !== req.user.id) {
    //   return res.status(403).json({ message: 'Access denied' });
    // }

    // const reply = new Message({
    //   senderId: req.user.id,
    //   recipientId: originalMessage.senderId.toString() === req.user.id 
    //     ? originalMessage.recipientId 
    //     : originalMessage.senderId,
    //   subject: `Re: ${originalMessage.subject}`,
    //   content: req.body.content,
    //   priority: req.body.priority || originalMessage.priority,
    //   isRead: false,
    //   parentMessageId: originalMessage._id,
    //   createdAt: new Date(),
    // });

    // await reply.save();

    // const populatedReply = await Message.findById(reply._id)
    //   .populate('senderId', 'firstName lastName email')
    //   .populate('recipientId', 'firstName lastName email');

    // res.status(201).json(populatedReply);
    
    // Placeholder response
    res.status(201).json({ message: 'Reply sent successfully' });
  } catch (error) {
    console.error('Error replying to message:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Mark message as read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    // const message = await Message.findById(req.params.id);
    // if (!message) {
    //   return res.status(404).json({ message: 'Message not found' });
    // }

    // // Check if user is the recipient
    // if (message.recipientId.toString() !== req.user.id) {
    //   return res.status(403).json({ message: 'Access denied' });
    // }

    // message.isRead = true;
    // message.readAt = new Date();
    // await message.save();

    // res.json({ message: 'Message marked as read' });
    
    // Placeholder response
    res.json({ message: 'Message marked as read' });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Mark multiple messages as read
router.put('/bulk/read', authenticateToken, [
  body('messageIds').isArray().notEmpty(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // await Message.updateMany(
    //   {
    //     _id: { $in: req.body.messageIds },
    //     recipientId: req.user.id
    //   },
    //   {
    //     isRead: true,
    //     readAt: new Date()
    //   }
    // );

    // res.json({ message: 'Messages marked as read' });
    
    // Placeholder response
    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete message
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // const message = await Message.findById(req.params.id);
    // if (!message) {
    //   return res.status(404).json({ message: 'Message not found' });
    // }

    // // Check if user has permission to delete this message
    // if (message.senderId.toString() !== req.user.id && 
    //     message.recipientId.toString() !== req.user.id) {
    //   return res.status(403).json({ message: 'Access denied' });
    // }

    // await Message.findByIdAndDelete(req.params.id);
    // res.json({ message: 'Message deleted successfully' });
    
    // Placeholder response
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get unread message count
router.get('/unread/count', authenticateToken, async (req, res) => {
  try {
    // const count = await Message.countDocuments({
    //   recipientId: req.user.id,
    //   isRead: false
    // });

    // res.json({ unreadCount: count });
    
    // Placeholder response
    res.json({ unreadCount: 0 });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get conversation thread
router.get('/conversation/:userId', authenticateToken, async (req, res) => {
  try {
    // const messages = await Message.find({
    //   $or: [
    //     { senderId: req.user.id, recipientId: req.params.userId },
    //     { senderId: req.params.userId, recipientId: req.user.id }
    //   ]
    // })
    // .populate('senderId', 'firstName lastName email')
    // .populate('recipientId', 'firstName lastName email')
    // .sort({ createdAt: 1 });

    // res.json(messages);
    
    // Placeholder response
    res.json([]);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Send bulk message (admin/teacher only)
router.post('/bulk', authenticateToken, authorizeRoles(['admin', 'teacher']), [
  body('recipientIds').isArray().notEmpty(),
  body('subject').trim().isLength({ min: 1, max: 200 }),
  body('content').trim().isLength({ min: 1, max: 2000 }),
  body('priority').optional().isIn(['low', 'normal', 'high', 'urgent']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // const messages = [];
    // for (const recipientId of req.body.recipientIds) {
    //   const message = new Message({
    //     senderId: req.user.id,
    //     recipientId,
    //     subject: req.body.subject,
    //     content: req.body.content,
    //     priority: req.body.priority || 'normal',
    //     isRead: false,
    //     createdAt: new Date(),
    //   });
    //   messages.push(message);
    // }

    // await Message.insertMany(messages);

    // res.status(201).json({ 
    //   message: 'Bulk messages sent successfully',
    //   count: messages.length 
    // });
    
    // Placeholder response
    res.status(201).json({ 
      message: 'Bulk messages sent successfully',
      count: req.body.recipientIds.length 
    });
  } catch (error) {
    console.error('Error sending bulk messages:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
