const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  // Basic Information
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: [true, 'Class is required']
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course is required']
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Teacher is required']
  },

  // Attendance Records
  records: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'excused', 'tardy'],
      default: 'absent'
    },
    timeIn: {
      type: Date
    },
    timeOut: {
      type: Date
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters']
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    markedAt: {
      type: Date,
      default: Date.now
    },
    verified: {
      type: Boolean,
      default: false
    }
  }],

  // Session Information
  session: {
    type: String,
    enum: ['morning', 'afternoon', 'evening', 'full-day'],
    required: [true, 'Session is required']
  },
  period: {
    type: String,
    trim: true
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: String,
    required: [true, 'End time is required']
  },

  // Location and Room
  room: {
    type: String,
    trim: true
  },
  building: {
    type: String,
    trim: true
  },

  // Attendance Statistics
  totalStudents: {
    type: Number,
    required: [true, 'Total students count is required'],
    min: [0, 'Total students cannot be negative']
  },
  presentCount: {
    type: Number,
    default: 0,
    min: [0, 'Present count cannot be negative']
  },
  absentCount: {
    type: Number,
    default: 0,
    min: [0, 'Absent count cannot be negative']
  },
  lateCount: {
    type: Number,
    default: 0,
    min: [0, 'Late count cannot be negative']
  },
  excusedCount: {
    type: Number,
    default: 0,
    min: [0, 'Excused count cannot be negative']
  },

  // Attendance Status
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'verified'],
    default: 'pending'
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  lockedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lockedAt: {
    type: Date
  },

  // Special Circumstances
  isHoliday: {
    type: Boolean,
    default: false
  },
  isExamDay: {
    type: Boolean,
    default: false
  },
  isSpecialEvent: {
    type: Boolean,
    default: false
  },
  specialNotes: {
    type: String,
    maxlength: [1000, 'Special notes cannot exceed 1000 characters']
  },

  // Automated Features
  autoMarkAbsent: {
    type: Boolean,
    default: true
  },
  gracePeriod: {
    type: Number, // in minutes
    default: 15
  },
  lateThreshold: {
    type: Number, // in minutes
    default: 5
  },

  // Notifications
  notificationsSent: {
    type: Boolean,
    default: false
  },
  notificationSentAt: {
    type: Date
  },

  // Audit Trail
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for attendance percentage
attendanceSchema.virtual('attendancePercentage').get(function() {
  if (this.totalStudents === 0) return 0;
  return Math.round((this.presentCount / this.totalStudents) * 100);
});

// Virtual for absent percentage
attendanceSchema.virtual('absentPercentage').get(function() {
  if (this.totalStudents === 0) return 0;
  return Math.round((this.absentCount / this.totalStudents) * 100);
});

// Virtual for late percentage
attendanceSchema.virtual('latePercentage').get(function() {
  if (this.totalStudents === 0) return 0;
  return Math.round((this.lateCount / this.totalStudents) * 100);
});

// Virtual for formatted date
attendanceSchema.virtual('formattedDate').get(function() {
  return this.date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Indexes
attendanceSchema.index({ date: 1 });
attendanceSchema.index({ class: 1, date: 1 });
attendanceSchema.index({ course: 1, date: 1 });
attendanceSchema.index({ teacher: 1, date: 1 });
attendanceSchema.index({ 'records.student': 1, date: 1 });
attendanceSchema.index({ status: 1 });

// Compound index for efficient queries
attendanceSchema.index({ class: 1, date: 1, status: 1 });

// Pre-save middleware to update counts
attendanceSchema.pre('save', function(next) {
  if (this.records && this.records.length > 0) {
    this.presentCount = this.records.filter(r => r.status === 'present').length;
    this.absentCount = this.records.filter(r => r.status === 'absent').length;
    this.lateCount = this.records.filter(r => r.status === 'late').length;
    this.excusedCount = this.records.filter(r => r.status === 'excused').length;
  }
  next();
});

// Static method to find attendance by date range
attendanceSchema.statics.findByDateRange = function(startDate, endDate, classId = null) {
  const query = {
    date: {
      $gte: startDate,
      $lte: endDate
    }
  };
  
  if (classId) {
    query.class = classId;
  }
  
  return this.find(query).populate('class course teacher');
};

// Static method to find student attendance
attendanceSchema.statics.findStudentAttendance = function(studentId, startDate, endDate) {
  return this.find({
    date: {
      $gte: startDate,
      $lte: endDate
    },
    'records.student': studentId
  }).populate('class course teacher');
};

// Instance method to mark student attendance
attendanceSchema.methods.markStudentAttendance = function(studentId, status, notes = '') {
  const record = this.records.find(r => r.student.toString() === studentId.toString());
  
  if (record) {
    record.status = status;
    record.notes = notes;
    record.markedAt = new Date();
  } else {
    this.records.push({
      student: studentId,
      status: status,
      notes: notes,
      markedAt: new Date()
    });
  }
  
  return this.save();
};

// Instance method to lock attendance
attendanceSchema.methods.lockAttendance = function(userId) {
  this.isLocked = true;
  this.lockedBy = userId;
  this.lockedAt = new Date();
  this.status = 'completed';
  return this.save();
};

// Instance method to unlock attendance
attendanceSchema.methods.unlockAttendance = function() {
  this.isLocked = false;
  this.lockedBy = null;
  this.lockedAt = null;
  this.status = 'in-progress';
  return this.save();
};

// Instance method to calculate attendance statistics
attendanceSchema.methods.calculateStats = function() {
  const stats = {
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
    total: this.records.length
  };
  
  this.records.forEach(record => {
    stats[record.status]++;
  });
  
  return stats;
};

module.exports = mongoose.model('Attendance', attendanceSchema);
