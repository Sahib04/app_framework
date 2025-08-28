const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CourseEnrollment = sequelize.define('CourseEnrollment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  courseId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  studentId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
}, {
  tableName: 'course_enrollments',
  timestamps: true,
  indexes: [
    { unique: true, fields: ['courseId', 'studentId'] }
  ]
});

module.exports = CourseEnrollment;

