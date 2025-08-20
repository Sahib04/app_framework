const { sequelize } = require('../config/database');
const User = require('./User');
const Course = require('./Course');
const Class = require('./Class');
const Conversation = require('./Conversation');
const Message = require('./Message');
const Attachment = require('./Attachment');

// Associations
Conversation.belongsTo(User, { as: 'teacher', foreignKey: 'teacherId' });
Conversation.belongsTo(User, { as: 'student', foreignKey: 'studentId' });

Message.belongsTo(Conversation, { foreignKey: 'conversationId' });
Message.belongsTo(User, { as: 'sender', foreignKey: 'senderId' });
Message.belongsTo(User, { as: 'receiver', foreignKey: 'receiverId' });

Attachment.belongsTo(Message, { foreignKey: 'messageId' });

module.exports = {
	sequelize,
	User,
	Course,
	Class,
	Conversation,
	Message,
	Attachment,
};
