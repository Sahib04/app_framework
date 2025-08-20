const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Attachment = sequelize.define('Attachment', {
	id: {
		type: DataTypes.UUID,
		primaryKey: true,
		defaultValue: DataTypes.UUIDV4,
	},
	messageId: {
		type: DataTypes.UUID,
		allowNull: false,
	},
	storage: {
		type: DataTypes.STRING(20),
		allowNull: false,
		defaultValue: 'local',
	},
	fileKey: {
		type: DataTypes.TEXT,
		allowNull: false,
	},
	mimeType: {
		type: DataTypes.STRING(100),
		allowNull: false,
	},
	size: {
		type: DataTypes.INTEGER,
		allowNull: true,
	},
	width: {
		type: DataTypes.INTEGER,
		allowNull: true,
	},
	height: {
		type: DataTypes.INTEGER,
		allowNull: true,
	},
	createdAt: {
		type: DataTypes.DATE,
		allowNull: false,
		defaultValue: DataTypes.NOW,
	},
}, {
	tableName: 'attachments',
	indexes: [
		{ fields: ['messageId'] },
	],
});

module.exports = Attachment;
