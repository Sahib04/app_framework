const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Subject = sequelize.define('Subject', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: { msg: 'Subject name is required' },
      len: { args: [1, 100], msg: 'Subject name cannot exceed 100 characters' }
    }
  },
  code: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: { msg: 'Subject code is required' },
      len: { args: [1, 10], msg: 'Subject code cannot exceed 10 characters' }
    }
  },
  description: {
    type: DataTypes.TEXT,
    validate: {
      len: { args: [0, 500], msg: 'Description cannot exceed 500 characters' }
    }
  },
  department: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  gradeLevel: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  color: {
    type: DataTypes.STRING(7), // Hex color code
    defaultValue: '#3B82F6'
  },
  icon: {
    type: DataTypes.STRING,
    defaultValue: 'book'
  }
}, {
  timestamps: true
});

module.exports = Subject;
