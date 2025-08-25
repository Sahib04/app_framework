const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TestComment = sequelize.define('TestComment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  isTeacherReply: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
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
  userId: {
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
      fields: ['userId']
    },
    {
      fields: ['createdAt']
    }
  ]
});

module.exports = TestComment;
