const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Course = sequelize.define('Course', {
  // Basic Course Information
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: { msg: 'Course code is required' }
    }
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Course title is required' },
      len: { args: [1, 200], msg: 'Course title cannot exceed 200 characters' }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Course description is required' },
      len: { args: [1, 1000], msg: 'Course description cannot exceed 1000 characters' }
    }
  },
  shortDescription: {
    type: DataTypes.STRING(300),
    validate: {
      len: { args: [0, 300], msg: 'Short description cannot exceed 300 characters' }
    }
  },

  // Course Details
  credits: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: { args: [0], msg: 'Credits cannot be negative' }
    }
  },
  duration: {
    type: DataTypes.INTEGER, // in weeks
    allowNull: false,
    validate: {
      min: { args: [1], msg: 'Duration must be at least 1 week' }
    }
  },
  level: {
    type: DataTypes.ENUM('beginner', 'intermediate', 'advanced', 'expert'),
    allowNull: false
  },
  grade: {
    type: DataTypes.STRING,
    allowNull: false
  },

  // Prerequisites and Dependencies
  prerequisites: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  corequisites: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  isPrerequisiteFor: {
    type: DataTypes.JSONB,
    defaultValue: []
  },

  // Subject and Category
  subjectId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  category: {
    type: DataTypes.ENUM('core', 'elective', 'honors', 'ap', 'ib', 'remedial'),
    allowNull: false
  },

  // Curriculum Information
  learningObjectives: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  syllabus: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  textbooks: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  resources: {
    type: DataTypes.JSONB,
    defaultValue: []
  },

  // Assessment and Grading
  assessmentMethods: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  gradingPolicy: {
    type: DataTypes.JSONB,
    defaultValue: {
      exams: 40,
      assignments: 30,
      participation: 15,
      projects: 15
    }
  },
  passingGrade: {
    type: DataTypes.INTEGER,
    defaultValue: 60,
    validate: {
      min: { args: [0], msg: 'Passing grade cannot be negative' },
      max: { args: [100], msg: 'Passing grade cannot exceed 100' }
    }
  },

  // Capacity and Enrollment
  maxCapacity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: { args: [1], msg: 'Capacity must be at least 1' }
    }
  },
  currentEnrollment: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  waitlistCapacity: {
    type: DataTypes.INTEGER,
    defaultValue: 10
  },

  // Schedule and Timing
  academicYear: {
    type: DataTypes.STRING,
    allowNull: false
  },
  semester: {
    type: DataTypes.ENUM('fall', 'spring', 'summer', 'winter'),
    allowNull: false
  },
  schedule: {
    type: DataTypes.JSONB,
    defaultValue: []
  },

  // Instructor Information
  instructorId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  teachingAssistants: {
    type: DataTypes.JSONB,
    defaultValue: []
  },

  // Course Status and Settings
  status: {
    type: DataTypes.ENUM('draft', 'active', 'inactive', 'archived'),
    defaultValue: 'draft'
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  enrollmentOpen: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  allowAudit: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },

  // Fees and Financial
  tuition: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: { args: [0], msg: 'Tuition cannot be negative' }
    }
  },
  additionalFees: {
    type: DataTypes.JSONB,
    defaultValue: []
  },

  // Metadata
  tags: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  keywords: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  rating: {
    type: DataTypes.JSONB,
    defaultValue: {
      average: 0,
      count: 0
    }
  },
  reviews: {
    type: DataTypes.JSONB,
    defaultValue: []
  }
       }, {
         tableName: 'courses',
         timestamps: true,
  hooks: {
    beforeSave: (course) => {
      if (course.currentEnrollment > course.maxCapacity) {
        throw new Error('Current enrollment cannot exceed maximum capacity');
      }
    }
  }
});

// Instance methods
Course.prototype.isAvailable = function() {
  return this.currentEnrollment < this.maxCapacity;
};

Course.prototype.isWaitlistAvailable = function() {
  return this.currentEnrollment >= this.maxCapacity && 
         this.currentEnrollment < (this.maxCapacity + this.waitlistCapacity);
};

Course.prototype.getEnrollmentPercentage = function() {
  return Math.round((this.currentEnrollment / this.maxCapacity) * 100);
};

Course.prototype.enrollStudent = async function() {
  if (this.currentEnrollment < this.maxCapacity) {
    this.currentEnrollment += 1;
    return this.save();
  }
  throw new Error('Course is at maximum capacity');
};

Course.prototype.unenrollStudent = async function() {
  if (this.currentEnrollment > 0) {
    this.currentEnrollment -= 1;
    return this.save();
  }
  throw new Error('No students enrolled to unenroll');
};

// Static methods
Course.findAvailable = function() {
  return this.findAll({
    where: {
      status: 'active',
      isPublished: true,
      enrollmentOpen: true
    },
    having: sequelize.literal('currentEnrollment < maxCapacity')
  });
};

module.exports = Course;
