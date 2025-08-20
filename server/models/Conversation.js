const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Conversation = sequelize.define('Conversation', {
	id: {
		type: DataTypes.UUID,
		primaryKey: true,
		defaultValue: DataTypes.UUIDV4,
	},
	teacherId: {
		type: DataTypes.UUID,
		allowNull: false,
	},
	studentId: {
		type: DataTypes.UUID,
		allowNull: false,
	},
	lastMessageAt: {
		type: DataTypes.DATE,
		allowNull: false,
		defaultValue: DataTypes.NOW,
	},
	createdAt: {
		type: DataTypes.DATE,
		allowNull: false,
		defaultValue: DataTypes.NOW,
	},
	updatedAt: {
		type: DataTypes.DATE,
		allowNull: false,
		defaultValue: DataTypes.NOW,
	},
}, {
	tableName: 'conversations',
	indexes: [
		{ fields: ['teacherId'] },
		{ fields: ['studentId'] },
		{ fields: ['lastMessageAt'] },
		{ unique: true, fields: ['teacherId', 'studentId'] },
	],
});

module.exports = Conversation;
