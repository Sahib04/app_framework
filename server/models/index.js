const { sequelize } = require('../config/database');

// Import models (all are already defined with sequelize instance)
const User = require('./User');
const Course = require('./Course');
const CourseEnrollment = require('./CourseEnrollment');
const Class = require('./Class');
const Conversation = require('./Conversation');
const Message = require('./Message');
const Attachment = require('./Attachment');
const Test = require('./Test');
const TestComment = require('./TestComment');
const TestSubmission = require('./TestSubmission');

// Associations
Conversation.belongsTo(User, { as: 'teacher', foreignKey: 'teacherId' });
Conversation.belongsTo(User, { as: 'student', foreignKey: 'studentId' });

Message.belongsTo(Conversation, { foreignKey: 'conversationId' });
Message.belongsTo(User, { as: 'sender', foreignKey: 'senderId' });
Message.belongsTo(User, { as: 'receiver', foreignKey: 'receiverId' });

// Message attachments
Message.hasOne(Attachment, { foreignKey: 'messageId', as: 'attachment' });
Attachment.belongsTo(Message, { foreignKey: 'messageId' });

// Test associations
Test.belongsTo(User, { as: 'teacher', foreignKey: 'teacherId' });
Test.hasMany(TestComment, { as: 'comments', foreignKey: 'testId' });
Test.hasMany(TestSubmission, { as: 'submissions', foreignKey: 'testId' });

TestComment.belongsTo(Test, { as: 'test', foreignKey: 'testId' });
TestComment.belongsTo(User, { as: 'user', foreignKey: 'userId' });

TestSubmission.belongsTo(Test, { as: 'test', foreignKey: 'testId' });
TestSubmission.belongsTo(User, { as: 'student', foreignKey: 'studentId' });

module.exports = {
	sequelize,
	User,
	Course,
  CourseEnrollment,
	Class,
	Conversation,
	Message,
	Attachment,
	Test,
	TestComment,
	TestSubmission,
};
