const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect: auth } = require('../middleware/auth');

// Get all notifications for current user
router.get('/', auth, async (req, res) => {
    try {
        const { type, isRead, priority } = req.query;
        const filter = { recipient: req.user.id };

        if (type) filter.type = type;
        if (isRead !== undefined) filter.isRead = isRead === 'true';
        if (priority) filter.priority = priority;

        // Filter out expired notifications
        filter.$or = [
            { expiresAt: { $exists: false } },
            { expiresAt: { $gt: new Date() } }
        ];

        const notifications = await Notification.find(filter)
            .populate('sender', 'firstName lastName')
            .sort({ createdAt: -1 })
            .limit(100);

        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get unread count
router.get('/unread-count', auth, async (req, res) => {
    try {
        const count = await Notification.countDocuments({
            recipient: req.user.id,
            isRead: false,
            $or: [
                { expiresAt: { $exists: false } },
                { expiresAt: { $gt: new Date() } }
            ]
        });

        res.json({ count });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get notification by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id)
            .populate('sender', 'firstName lastName email');

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        // Check if user is recipient
        if (notification.recipient.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json(notification);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create new notification
router.post('/', auth, async (req, res) => {
    try {
        const notification = new Notification({
            ...req.body,
            sender: req.user.id
        });

        await notification.save();
        res.status(201).json(notification);
    } catch (error) {
        res.status(400).json({ message: 'Error creating notification', error: error.message });
    }
});

// Mark notification as read
router.patch('/:id/read', auth, async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        // Check if user is recipient
        if (notification.recipient.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        notification.isRead = true;
        notification.readAt = new Date();
        await notification.save();

        res.json(notification);
    } catch (error) {
        res.status(400).json({ message: 'Error marking as read', error: error.message });
    }
});

// Mark all notifications as read
router.patch('/mark-all/read', auth, async (req, res) => {
    try {
        const result = await Notification.updateMany(
            { recipient: req.user.id, isRead: false },
            { isRead: true, readAt: new Date() }
        );

        res.json({ message: 'All notifications marked as read', count: result.modifiedCount });
    } catch (error) {
        res.status(400).json({ message: 'Error marking all as read', error: error.message });
    }
});

// Delete notification
router.delete('/:id', auth, async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        // Check if user is recipient or admin
        if (notification.recipient.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await notification.deleteOne();
        res.json({ message: 'Notification deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete all read notifications
router.delete('/bulk/read', auth, async (req, res) => {
    try {
        const result = await Notification.deleteMany({
            recipient: req.user.id,
            isRead: true
        });

        res.json({ message: 'Read notifications deleted', count: result.deletedCount });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
