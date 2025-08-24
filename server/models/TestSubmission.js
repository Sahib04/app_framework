const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TestSubmission = sequelize.define('TestSubmission', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  submittedAt: {
    type: DataTypes.DATE,
    allowNull: false
  },
  score: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 0
    }
  },
  status: {
    type: DataTypes.ENUM('submitted', 'graded', 'late'),
    defaultValue: 'submitted'
  },
  feedback: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  testId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'tests', // Changed from 'Tests' to 'tests' (lowercase)
      key: 'id'
    }
  },
  studentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users', // Changed from 'Users' to 'users' (lowercase)
      key: 'id'
    }
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['testId']
    },
    {
      fields: ['studentId']
    },
    {
      fields: ['status']
    }
  ]
});

module.exports = TestSubmission;
