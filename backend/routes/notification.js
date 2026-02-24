const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get all notifications for user
router.get('/', auth, async (req, res) => {
    try {
        const { page = 1, limit = 20, unreadOnly = false } = req.query;
        
        const query = { recipient: req.user.id };
        if (unreadOnly === 'true') {
            query.isRead = false;
        }

        const notifications = await Notification.find(query)
            .populate('sender', 'name profileImage role')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Notification.countDocuments(query);
        const unreadCount = await Notification.countDocuments({ 
            recipient: req.user.id, 
            isRead: false 
        });

        res.json({
            notifications,
            totalPages: Math.ceil(total / limit),
            currentPage: Number(page),
            totalResults: total,
            unreadCount
        });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// Get unread count
router.get('/unread-count', auth, async (req, res) => {
    try {
        const count = await Notification.countDocuments({
            recipient: req.user.id,
            isRead: false
        });
        res.json({ count });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// Mark notification as read
router.put('/read/:id', auth, async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        
        if (!notification) {
            return res.status(404).json({ msg: 'Notification not found' });
        }

        if (notification.recipient.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Unauthorized' });
        }

        notification.isRead = true;
        notification.readAt = new Date();
        await notification.save();

        res.json(notification);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// Mark all notifications as read
router.put('/read-all', auth, async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user.id, isRead: false },
            { isRead: true, readAt: new Date() }
        );

        res.json({ msg: 'All notifications marked as read' });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// Delete notification
router.delete('/:id', auth, async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        
        if (!notification) {
            return res.status(404).json({ msg: 'Notification not found' });
        }

        if (notification.recipient.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Unauthorized' });
        }

        await Notification.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Notification deleted' });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// Delete all notifications
router.delete('/', auth, async (req, res) => {
    try {
        await Notification.deleteMany({ recipient: req.user.id });
        res.json({ msg: 'All notifications deleted' });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// Update FCM token
router.post('/fcm-token', auth, async (req, res) => {
    try {
        const { fcmToken } = req.body;
        
        if (!fcmToken) {
            return res.status(400).json({ msg: 'FCM token is required' });
        }

        await User.findByIdAndUpdate(req.user.id, { fcmToken });
        res.json({ msg: 'FCM token updated successfully' });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

module.exports = router;
