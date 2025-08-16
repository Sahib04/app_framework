const { sequelize } = require('../config/database');
const User = require('./User');
const Course = require('./Course');
const Class = require('./Class');

// Import other models (we'll create these next)
// const Attendance = require('./Attendance');
// const Grade = require('./Grade');

// Define associations
// User.hasMany(Course, { as: 'instructedCourses', foreignKey: 'instructorId' });
// Course.belongsTo(User, { as: 'instructor', foreignKey: 'instructorId' });

// User.hasMany(Class, { as: 'taughtClasses', foreignKey: 'teacherId' });
// Class.belongsTo(User, { as: 'teacher', foreignKey: 'teacherId' });

// User.hasMany(Attendance, { as: 'attendanceRecords', foreignKey: 'studentId' });
// Attendance.belongsTo(User, { as: 'student', foreignKey: 'studentId' });

// User.hasMany(Grade, { as: 'grades', foreignKey: 'studentId' });
// Grade.belongsTo(User, { as: 'student', foreignKey: 'studentId' });

// Course.hasMany(Class, { foreignKey: 'courseId' });
// Class.belongsTo(Course, { foreignKey: 'courseId' });

// Course.hasMany(Grade, { foreignKey: 'courseId' });
// Grade.belongsTo(Course, { foreignKey: 'courseId' });

// Class.hasMany(Attendance, { foreignKey: 'classId' });
// Attendance.belongsTo(Class, { foreignKey: 'classId' });

module.exports = {
  sequelize,
  User,
  Course,
  Class,
  // Attendance,
  // Grade
};
