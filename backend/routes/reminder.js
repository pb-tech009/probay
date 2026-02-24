const express = require('express');
const router = express.Router();
const Reminder = require('../models/Reminder');
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Create reminder
router.post('/create', [
    auth,
    body('type').isIn(['follow_up', 'callback', 'visit', 'renewal', 'custom']).withMessage('Valid type required'),
    body('title').notEmpty().withMessage('Title is required'),
    body('reminderDate').isISO8601().withMessage('Valid date required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { type, title, description, reminderDate, leadId, propertyId } = req.body;

        const reminder = new Reminder({
            user: req.user.id,
            type,
            title,
            description,
            reminderDate: new Date(reminderDate),
            lead: leadId || null,
            property: propertyId || null
        });

        await reminder.save();
        res.status(201).json(reminder);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// Get all reminders
router.get('/', auth, async (req, res) => {
    try {
        const { status = 'pending', page = 1, limit = 20 } = req.query;

        let query = { user: req.user.id };
        
        if (status === 'pending') {
            query.isCompleted = false;
            query.reminderDate = { $gte: new Date() };
        } else if (status === 'overdue') {
            query.isCompleted = false;
            query.reminderDate = { $lt: new Date() };
        } else if (status === 'completed') {
            query.isCompleted = true;
        }

        const reminders = await Reminder.find(query)
            .populate('lead', 'property tenant priority status')
            .populate('property', 'title images price')
            .sort({ reminderDate: 1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Reminder.countDocuments(query);

        res.json({
            reminders,
            totalPages: Math.ceil(total / limit),
            currentPage: Number(page),
            totalResults: total
        });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// Get today's reminders
router.get('/today', auth, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const reminders = await Reminder.find({
            user: req.user.id,
            isCompleted: false,
            reminderDate: {
                $gte: today,
                $lt: tomorrow
            }
        })
        .populate('lead', 'property tenant priority')
        .populate('property', 'title images')
        .sort({ reminderDate: 1 });

        res.json(reminders);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// Mark reminder as completed
router.put('/complete/:id', auth, async (req, res) => {
    try {
        const reminder = await Reminder.findById(req.params.id);
        
        if (!reminder) {
            return res.status(404).json({ msg: 'Reminder not found' });
        }

        if (reminder.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Unauthorized' });
        }

        reminder.isCompleted = true;
        reminder.completedAt = new Date();
        await reminder.save();

        res.json(reminder);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// Delete reminder
router.delete('/:id', auth, async (req, res) => {
    try {
        const reminder = await Reminder.findById(req.params.id);
        
        if (!reminder) {
            return res.status(404).json({ msg: 'Reminder not found' });
        }

        if (reminder.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Unauthorized' });
        }

        await Reminder.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Reminder deleted' });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// Get reminder stats
router.get('/stats', auth, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const pending = await Reminder.countDocuments({
            user: req.user.id,
            isCompleted: false,
            reminderDate: { $gte: today }
        });

        const overdue = await Reminder.countDocuments({
            user: req.user.id,
            isCompleted: false,
            reminderDate: { $lt: today }
        });

        const completed = await Reminder.countDocuments({
            user: req.user.id,
            isCompleted: true
        });

        res.json({ pending, overdue, completed });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

module.exports = router;
