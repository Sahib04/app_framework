const express = require('express');
const { Sequelize } = require('sequelize');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();

// Import models
const { sequelize } = require('./models');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const courseRoutes = require('./routes/courses');
const classRoutes = require('./routes/classes');
const attendanceRoutes = require('./routes/attendance');
const gradeRoutes = require('./routes/grades');
const feeRoutes = require('./routes/fees');
const messageRoutes = require('./routes/messages');
const assignmentRoutes = require('./routes/assignments');
const eventRoutes = require('./routes/events');

// Import middleware
const { authenticateToken } = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Test the database connection
sequelize.authenticate()
  .then(() => {
    console.log('✅ Connected to PostgreSQL database');
    // Sync all models (in development)
    if (process.env.NODE_ENV !== 'production') {
      return sequelize.sync({ alter: true });
    }
  })
  .then(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('✅ Database models synchronized');
    }
  })
  .catch(err => console.error('❌ PostgreSQL connection error:', err));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/courses', authenticateToken, courseRoutes);
app.use('/api/classes', authenticateToken, classRoutes);
app.use('/api/attendance', authenticateToken, attendanceRoutes);
app.use('/api/grades', authenticateToken, gradeRoutes);
app.use('/api/fees', authenticateToken, feeRoutes);
app.use('/api/messages', authenticateToken, messageRoutes);
app.use('/api/assignments', authenticateToken, assignmentRoutes);
app.use('/api/events', authenticateToken, eventRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Serve React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API URL: http://localhost:${PORT}/api`);
});

module.exports = app;
