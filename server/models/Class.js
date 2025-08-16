const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Class = sequelize.define('Class', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  courseId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'courses',
      key: 'id'
    }
  },
  teacherId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      len: [1, 200]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 1000]
    }
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  startTime: {
    type: DataTypes.STRING(5),
    allowNull: false,
    validate: {
      is: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    }
  },
  endTime: {
    type: DataTypes.STRING(5),
    allowNull: false,
    validate: {
      is: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    }
  },
  room: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      len: [1, 50]
    }
  },
  type: {
    type: DataTypes.ENUM('lecture', 'lab', 'discussion', 'exam', 'other'),
    defaultValue: 'lecture'
  },
  materials: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  objectives: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'in-progress', 'completed', 'cancelled'),
    defaultValue: 'scheduled'
  },
  attendanceId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 1000]
    }
  },
  isRecurring: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  recurringPattern: {
    type: DataTypes.JSON,
    allowNull: true
  },
  maxCapacity: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1
    }
  },
  currentEnrollment: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  isOnline: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  meetingLink: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  meetingPassword: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  recordingUrl: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  resources: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  assignments: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  announcements: {
    type: DataTypes.JSON,
    defaultValue: []
  }
}, {
  tableName: 'classes',
  timestamps: true,
  hooks: {
    beforeValidate: (classInstance) => {
      // Validate time format
      if (classInstance.startTime && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(classInstance.startTime)) {
        throw new Error('Invalid start time format');
      }
      if (classInstance.endTime && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(classInstance.endTime)) {
        throw new Error('Invalid end time format');
      }
    }
  }
});

// Instance methods
Class.prototype.getDurationMinutes = function() {
  if (!this.startTime || !this.endTime) return 0;
  
  const start = new Date(`2000-01-01T${this.startTime}:00`);
  const end = new Date(`2000-01-01T${this.endTime}:00`);
  
  return Math.round((end - start) / (1000 * 60));
};

Class.prototype.getFormattedDate = function() {
  if (!this.date) return '';
  return new Date(this.date).toLocaleDateString();
};

Class.prototype.getFormattedTimeRange = function() {
  if (!this.startTime || !this.endTime) return '';
  return `${this.startTime} - ${this.endTime}`;
};

Class.prototype.isAvailable = function() {
  return this.currentEnrollment < this.maxCapacity;
};

Class.prototype.getEnrollmentPercentage = function() {
  if (!this.maxCapacity) return 0;
  return Math.round((this.currentEnrollment / this.maxCapacity) * 100);
};

// Static methods
Class.findByDateRange = async function(startDate, endDate) {
  return await this.findAll({
    where: {
      date: {
        [sequelize.Op.between]: [startDate, endDate]
      }
    },
    order: [['date', 'ASC'], ['startTime', 'ASC']]
  });
};

Class.findByTeacher = async function(teacherId) {
  return await this.findAll({
    where: { teacherId },
    order: [['date', 'ASC'], ['startTime', 'ASC']]
  });
};

Class.findByCourse = async function(courseId) {
  return await this.findAll({
    where: { courseId },
    order: [['date', 'ASC'], ['startTime', 'ASC']]
  });
};

module.exports = Class;
