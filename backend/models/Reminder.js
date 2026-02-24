const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    lead: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lead'
    },
    property: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property'
    },
    type: {
        type: String,
        enum: ['follow_up', 'callback', 'visit', 'renewal', 'custom'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    reminderDate: {
        type: Date,
        required: true
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Date
    },
    notificationSent: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

reminderSchema.index({ user: 1, reminderDate: 1, isCompleted: 1 });
reminderSchema.index({ reminderDate: 1, notificationSent: 1 });

module.exports = mongoose.model('Reminder', reminderSchema);
