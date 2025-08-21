const express = require('express');
const { Op } = require('sequelize');
const { body, validationResult } = require('express-validator');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { Conversation, Message, Attachment, User } = require('../models');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const router = express.Router();

const ensureUploadDir = () => {
	const dir = path.join(__dirname, '../../uploads');
	if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
	return dir;
};

// Utility: ensure teacher-student pair
async function ensurePair(sender, receiver) {
	if (sender.role === 'student' && receiver.role !== 'teacher') {
		const err = new Error('Students can only message teachers');
		err.status = 403; throw err;
	}
	if (sender.role === 'teacher' && receiver.role === 'teacher') {
		const err = new Error('Teachers cannot message teachers');
		err.status = 403; throw err;
	}
}

async function getOrCreateConversation(teacherId, studentId) {
	let conv = await Conversation.findOne({ where: { teacherId, studentId } });
	if (!conv) {
		conv = await Conversation.create({ teacherId, studentId });
	}
	return conv;
}

// List conversations for current user
router.get('/conversations', authenticateToken, async (req, res) => {
	try {
		const where = req.user.role === 'teacher' ? { teacherId: req.user.id } : { studentId: req.user.id };
		const items = await Conversation.findAll({ where, order: [['lastMessageAt', 'DESC']] });
		res.json(items);
	} catch (e) {
		console.error(e); res.status(500).json({ message: 'Internal server error' });
	}
});

// Get messages in conversation with pagination
router.get('/:conversationId', authenticateToken, async (req, res) => {
	try {
		const { conversationId } = req.params;
		const limit = Math.min(parseInt(req.query.limit || '30', 10), 100);
		const cursor = req.query.cursor ? new Date(req.query.cursor) : null;

		const conv = await Conversation.findByPk(conversationId);
		if (!conv || ![conv.teacherId, conv.studentId].includes(req.user.id)) {
			return res.status(404).json({ message: 'Conversation not found' });
		}

		const where = { conversationId };
		if (cursor) where.sentAt = { [Op.lt]: cursor };

		const items = await Message.findAll({
			where,
			include: [{ model: Attachment, as: 'attachment', attributes: ['id','storage','fileKey','mimeType','size','width','height'] }],
			order: [['sentAt', 'DESC']],
			limit,
		});
		res.json(items.reverse());
	} catch (e) {
		console.error(e); res.status(500).json({ message: 'Internal server error' });
	}
});

// Send message
router.post('/', authenticateToken, [
	body('receiverId').isUUID().withMessage('receiverId is required'),
	body('body').optional().isString(),
	body('contentType').optional().isIn(['text','image','emoji','video','audio','file','document','link']),
], async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

		const sender = await User.findByPk(req.user.id);
		const receiver = await User.findByPk(req.body.receiverId);
		if (!receiver) return res.status(404).json({ message: 'Receiver not found' });
		await ensurePair(sender, receiver);

		const teacherId = sender.role === 'teacher' ? sender.id : receiver.id;
		const studentId = sender.role === 'student' ? sender.id : receiver.id;
		const conv = await getOrCreateConversation(teacherId, studentId);

		const msg = await Message.create({
			conversationId: conv.id,
			senderId: sender.id,
			receiverId: receiver.id,
			body: req.body.body || null,
			contentType: req.body.contentType || 'text',
		});
		await conv.update({ lastMessageAt: new Date() });

		// emit via socket.io if available
		const io = req.app.get('io');
		if (io) {
			io.to(String(receiver.id)).emit('message', { message: msg });
		}

		res.status(201).json(msg);
	} catch (e) {
		console.error(e); res.status(e.status || 500).json({ message: e.message || 'Internal server error' });
	}
});

// Mark message as seen
router.post('/:id/seen', authenticateToken, async (req, res) => {
	try {
		const msg = await Message.findByPk(req.params.id);
		if (!msg || msg.receiverId !== req.user.id) return res.status(404).json({ message: 'Message not found' });
		msg.seenAt = new Date();
		await msg.save();
		const io = req.app.get('io');
		if (io) io.to(String(msg.senderId)).emit('seen', { messageId: String(msg.id), seenAt: msg.seenAt.toISOString() });
		res.json({ ok: true, seenAt: msg.seenAt });
	} catch (e) {
		console.error(e); res.status(500).json({ message: 'Internal server error' });
	}
});

const uploadDir = ensureUploadDir();
const storage = multer.diskStorage({
	destination: function (req, file, cb) { cb(null, uploadDir); },
	filename: function (req, file, cb) {
		const ext = path.extname(file.originalname).toLowerCase();
		cb(null, `${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`);
	}
});
const upload = multer({ storage, limits: { fileSize: 25 * 1024 * 1024 } });

// Multipart photo upload -> creates attachment and image message
router.post('/upload-photo', authenticateToken, upload.single('file'), async (req, res) => {
	try {
		const { receiverId } = req.body;
		if (!receiverId) return res.status(400).json({ message: 'receiverId required' });
		const sender = await User.findByPk(req.user.id);
		const receiver = await User.findByPk(receiverId);
		if (!receiver) return res.status(404).json({ message: 'Receiver not found' });
		await ensurePair(sender, receiver);

		const teacherId = sender.role === 'teacher' ? sender.id : receiver.id;
		const studentId = sender.role === 'student' ? sender.id : receiver.id;
		const conv = await getOrCreateConversation(teacherId, studentId);

		const fileKey = path.basename(req.file.path);
		const msg = await Message.create({
			conversationId: conv.id,
			senderId: sender.id,
			receiverId: receiver.id,
			body: `/uploads/${fileKey}`,
			contentType: 'image',
		});
		await Attachment.create({
			messageId: msg.id,
			storage: 'local',
			fileKey: fileKey,
			mimeType: req.file.mimetype,
			size: req.file.size,
		});
		await conv.update({ lastMessageAt: new Date() });

		const io = req.app.get('io');
		if (io) io.to(String(receiver.id)).emit('message', { message: msg });
		res.status(201).json(msg);
	} catch (e) {
		console.error(e); res.status(500).json({ message: 'Internal server error' });
	}
});

// Generic file upload (image, video, audio, any document)
router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
    try {
        const { receiverId } = req.body;
        if (!receiverId) return res.status(400).json({ message: 'receiverId required' });
        const sender = await User.findByPk(req.user.id);
        const receiver = await User.findByPk(receiverId);
        if (!receiver) return res.status(404).json({ message: 'Receiver not found' });
        await ensurePair(sender, receiver);

        const teacherId = sender.role === 'teacher' ? sender.id : receiver.id;
        const studentId = sender.role === 'student' ? sender.id : receiver.id;
        const conv = await getOrCreateConversation(teacherId, studentId);

        const fileKey = path.basename(req.file.path);
        const publicPath = `/uploads/${fileKey}`;
        const mime = (req.file.mimetype || '').toLowerCase();
        let contentType = 'file';
        if (mime.startsWith('image/')) contentType = 'image';
        else if (mime.startsWith('video/')) contentType = 'video';
        else if (mime.startsWith('audio/')) contentType = 'audio';
        else contentType = 'document';

        const msg = await Message.create({
            conversationId: conv.id,
            senderId: sender.id,
            receiverId: receiver.id,
            body: publicPath,
            contentType,
        });
        await Attachment.create({
            messageId: msg.id,
            storage: 'local',
            fileKey: fileKey,
            mimeType: req.file.mimetype,
            size: req.file.size,
        });
        await conv.update({ lastMessageAt: new Date() });

        const io = req.app.get('io');
        if (io) io.to(String(receiver.id)).emit('message', { message: msg });
        res.status(201).json(msg);
    } catch (e) {
        console.error(e); res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
