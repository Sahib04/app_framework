const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Message = sequelize.define('Message', {
	id: {
		type: DataTypes.UUID,
		primaryKey: true,
		defaultValue: DataTypes.UUIDV4,
	},
	conversationId: {
		type: DataTypes.UUID,
		allowNull: false,
	},
	senderId: {
		type: DataTypes.UUID,
		allowNull: false,
	},
	receiverId: {
		type: DataTypes.UUID,
		allowNull: false,
	},
	body: {
		type: DataTypes.TEXT,
		allowNull: true,
	},
	contentType: {
		type: DataTypes.STRING(20),
		allowNull: false,
		defaultValue: 'text',
	},
	sentAt: {
		type: DataTypes.DATE,
		allowNull: false,
		defaultValue: DataTypes.NOW,
	},
	deliveredAt: {
		type: DataTypes.DATE,
		allowNull: true,
	},
	seenAt: {
		type: DataTypes.DATE,
		allowNull: true,
	},
}, {
	tableName: 'messages',
	indexes: [
		{ fields: ['conversationId', 'sentAt'] },
		{ fields: ['receiverId', 'deliveredAt'] },
		{ fields: ['receiverId', 'seenAt'] },
	],
});

module.exports = Message;
