const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Get all events
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { 
      type, 
      startDate, 
      endDate, 
      category, 
      page = 1, 
      limit = 20 
    } = req.query;
    
    const filter = {};

    if (type) filter.type = type;
    if (category) filter.category = category;
    if (startDate && endDate) {
      filter.startDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Role-based filtering
    if (req.user.role === 'student') {
      // Get events relevant to student's courses
      filter.$or = [
        { type: 'holiday' },
        { type: 'exam' },
        { type: 'general' },
        { audience: { $in: ['all', 'students'] } }
      ];
    } else if (req.user.role === 'teacher') {
      filter.$or = [
        { type: 'holiday' },
        { type: 'exam' },
        { type: 'general' },
        { audience: { $in: ['all', 'teachers'] } },
        { createdBy: req.user.id }
      ];
    }

    const skip = (page - 1) * limit;
    // const events = await Event.find(filter)
    //   .populate('createdBy', 'firstName lastName email')
    //   .populate('courseId', 'title code')
    //   .skip(skip)
    //   .limit(parseInt(limit))
    //   .sort({ startDate: 1 });

    // const total = await Event.countDocuments(filter);

    // Placeholder response until Event model is created
    res.json({
      events: [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: 0,
        pages: 0,
      },
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get event by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    // const event = await Event.findById(req.params.id)
    //   .populate('createdBy', 'firstName lastName email')
    //   .populate('courseId', 'title code');

    // if (!event) {
    //   return res.status(404).json({ message: 'Event not found' });
    // }

    // res.json(event);
    
    // Placeholder response
    res.status(404).json({ message: 'Event not found' });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create event (admin/teacher only)
router.post('/', authenticateToken, authorizeRoles(['admin', 'teacher']), [
  body('title').trim().isLength({ min: 3, max: 200 }),
  body('description').optional().trim().isLength({ max: 1000 }),
  body('type').isIn(['holiday', 'exam', 'meeting', 'activity', 'general']),
  body('category').optional().isIn(['academic', 'social', 'sports', 'cultural', 'administrative']),
  body('startDate').isISO8601(),
  body('endDate').isISO8601(),
  body('location').optional().trim().isLength({ max: 200 }),
  body('audience').isIn(['all', 'students', 'teachers', 'parents', 'admin']),
  body('courseId').optional().isMongoId(),
  body('isRecurring').optional().isBoolean(),
  body('recurringPattern').optional().isObject(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Validate date range
    const startDate = new Date(req.body.startDate);
    const endDate = new Date(req.body.endDate);
    if (startDate >= endDate) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    // const event = new Event({
    //   ...req.body,
    //   createdBy: req.user.id,
    //   createdAt: new Date(),
    // });

    // await event.save();

    // const populatedEvent = await Event.findById(event._id)
    //   .populate('createdBy', 'firstName lastName email')
    //   .populate('courseId', 'title code');

    // res.status(201).json(populatedEvent);
    
    // Placeholder response
    res.status(201).json({ message: 'Event created successfully' });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update event (admin or event creator)
router.put('/:id', authenticateToken, authorizeRoles(['admin', 'teacher']), [
  body('title').optional().trim().isLength({ min: 3, max: 200 }),
  body('description').optional().trim().isLength({ max: 1000 }),
  body('type').optional().isIn(['holiday', 'exam', 'meeting', 'activity', 'general']),
  body('category').optional().isIn(['academic', 'social', 'sports', 'cultural', 'administrative']),
  body('startDate').optional().isISO8601(),
  body('endDate').optional().isISO8601(),
  body('location').optional().trim().isLength({ max: 200 }),
  body('audience').optional().isIn(['all', 'students', 'teachers', 'parents', 'admin']),
  body('courseId').optional().isMongoId(),
  body('isRecurring').optional().isBoolean(),
  body('recurringPattern').optional().isObject(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // const event = await Event.findById(req.params.id);
    // if (!event) {
    //   return res.status(404).json({ message: 'Event not found' });
    // }

    // // Check if user has permission to update this event
    // if (req.user.role === 'teacher' && event.createdBy.toString() !== req.user.id) {
    //   return res.status(403).json({ message: 'Access denied' });
    // }

    // // Validate date range if dates are being updated
    // if (req.body.startDate && req.body.endDate) {
    //   const startDate = new Date(req.body.startDate);
    //   const endDate = new Date(req.body.endDate);
    //   if (startDate >= endDate) {
    //     return res.status(400).json({ message: 'End date must be after start date' });
    //   }
    // }

    // Object.assign(event, req.body);
    // await event.save();

    // const updatedEvent = await Event.findById(event._id)
    //   .populate('createdBy', 'firstName lastName email')
    //   .populate('courseId', 'title code');

    // res.json(updatedEvent);
    
    // Placeholder response
    res.json({ message: 'Event updated successfully' });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete event (admin or event creator)
router.delete('/:id', authenticateToken, authorizeRoles(['admin', 'teacher']), async (req, res) => {
  try {
    // const event = await Event.findById(req.params.id);
    // if (!event) {
    //   return res.status(404).json({ message: 'Event not found' });
    // }

    // // Check if user has permission to delete this event
    // if (req.user.role === 'teacher' && event.createdBy.toString() !== req.user.id) {
    //   return res.status(403).json({ message: 'Access denied' });
    // }

    // await Event.findByIdAndDelete(req.params.id);
    // res.json({ message: 'Event deleted successfully' });
    
    // Placeholder response
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get calendar events
router.get('/calendar/events', authenticateToken, async (req, res) => {
  try {
    const { start, end } = req.query;
    
    if (!start || !end) {
      return res.status(400).json({ message: 'Start and end dates are required' });
    }

    const filter = {
      startDate: {
        $gte: new Date(start),
        $lte: new Date(end)
      }
    };

    // Role-based filtering
    if (req.user.role === 'student') {
      filter.$or = [
        { type: 'holiday' },
        { type: 'exam' },
        { type: 'general' },
        { audience: { $in: ['all', 'students'] } }
      ];
    } else if (req.user.role === 'teacher') {
      filter.$or = [
        { type: 'holiday' },
        { type: 'exam' },
        { type: 'general' },
        { audience: { $in: ['all', 'teachers'] } },
        { createdBy: req.user.id }
      ];
    }

    // const events = await Event.find(filter)
    //   .populate('createdBy', 'firstName lastName email')
    //   .populate('courseId', 'title code')
    //   .sort({ startDate: 1 });

    // Format events for calendar
    // const calendarEvents = events.map(event => ({
    //   id: event._id,
    //   title: event.title,
    //   start: event.startDate,
    //   end: event.endDate,
    //   type: event.type,
    //   category: event.category,
    //   location: event.location,
    //   description: event.description,
    //   createdBy: event.createdBy,
    //   courseId: event.courseId,
    // }));

    // res.json(calendarEvents);
    
    // Placeholder response
    res.json([]);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get upcoming events
router.get('/upcoming/list', authenticateToken, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const now = new Date();

    const filter = {
      startDate: { $gte: now }
    };

    // Role-based filtering
    if (req.user.role === 'student') {
      filter.$or = [
        { type: 'holiday' },
        { type: 'exam' },
        { type: 'general' },
        { audience: { $in: ['all', 'students'] } }
      ];
    } else if (req.user.role === 'teacher') {
      filter.$or = [
        { type: 'holiday' },
        { type: 'exam' },
        { type: 'general' },
        { audience: { $in: ['all', 'teachers'] } },
        { createdBy: req.user.id }
      ];
    }

    // const events = await Event.find(filter)
    //   .populate('createdBy', 'firstName lastName email')
    //   .populate('courseId', 'title code')
    //   .limit(parseInt(limit))
    //   .sort({ startDate: 1 });

    // res.json(events);
    
    // Placeholder response
    res.json([]);
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get events by type
router.get('/type/:type', authenticateToken, async (req, res) => {
  try {
    const { type } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const filter = { type };

    // Role-based filtering
    if (req.user.role === 'student') {
      filter.$or = [
        { audience: { $in: ['all', 'students'] } }
      ];
    } else if (req.user.role === 'teacher') {
      filter.$or = [
        { audience: { $in: ['all', 'teachers'] } },
        { createdBy: req.user.id }
      ];
    }

    const skip = (page - 1) * limit;
    // const events = await Event.find(filter)
    //   .populate('createdBy', 'firstName lastName email')
    //   .populate('courseId', 'title code')
    //   .skip(skip)
    //   .limit(parseInt(limit))
    //   .sort({ startDate: 1 });

    // const total = await Event.countDocuments(filter);

    // res.json({
    //   events,
    //   pagination: {
    //     page: parseInt(page),
    //     limit: parseInt(limit),
    //     total,
    //     pages: Math.ceil(total / limit),
    //   },
    // });
    
    // Placeholder response
    res.json({
      events: [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: 0,
        pages: 0,
      },
    });
  } catch (error) {
    console.error('Error fetching events by type:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get course-specific events
router.get('/course/:courseId', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const filter = { courseId };

    const skip = (page - 1) * limit;
    // const events = await Event.find(filter)
    //   .populate('createdBy', 'firstName lastName email')
    //   .populate('courseId', 'title code')
    //   .skip(skip)
    //   .limit(parseInt(limit))
    //   .sort({ startDate: 1 });

    // const total = await Event.countDocuments(filter);

    // res.json({
    //   events,
    //   pagination: {
    //     page: parseInt(page),
    //     limit: parseInt(limit),
    //     total,
    //     pages: Math.ceil(total / limit),
    //   },
    // });
    
    // Placeholder response
    res.json({
      events: [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: 0,
        pages: 0,
      },
    });
  } catch (error) {
    console.error('Error fetching course events:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get event statistics
router.get('/statistics/overview', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    // const totalEvents = await Event.countDocuments();
    // const upcomingEvents = await Event.countDocuments({ startDate: { $gte: new Date() } });
    // const pastEvents = await Event.countDocuments({ endDate: { $lt: new Date() } });
    // const todayEvents = await Event.countDocuments({
    //   startDate: { $lte: new Date() },
    //   endDate: { $gte: new Date() }
    // });

    // const eventsByType = await Event.aggregate([
    //   { $group: { _id: '$type', count: { $sum: 1 } } }
    // ]);

    // const eventsByCategory = await Event.aggregate([
    //   { $group: { _id: '$category', count: { $sum: 1 } } }
    // ]);

    // res.json({
    //   totalEvents,
    //   upcomingEvents,
    //   pastEvents,
    //   todayEvents,
    //   eventsByType,
    //   eventsByCategory,
    // });
    
    // Placeholder response
    res.json({
      totalEvents: 0,
      upcomingEvents: 0,
      pastEvents: 0,
      todayEvents: 0,
      eventsByType: [],
      eventsByCategory: [],
    });
  } catch (error) {
    console.error('Error fetching event statistics:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
