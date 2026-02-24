const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    type: {
        type: String,
        enum: [
            // Owner notifications
            'property_liked', 'property_saved', 'new_follower', 'property_review',
            'visit_request', 'visit_confirmed', 'visit_cancelled',
            'offer_received', 'offer_accepted_by_tenant', 'offer_counter',
            'new_message', 'property_views_milestone',
            
            // Lead/Contact notifications
            'new_lead', 'unlock_request', 'lead_update', 'contact_unlocked',
            
            // Tenant notifications
            'new_property_in_area', 'price_drop', 'property_available',
            'owner_new_property', 'owner_replied', 'visit_approved', 'visit_rejected',
            'visit_reminder_1day', 'visit_reminder_1hour', 'visit_completed',
            'offer_accepted', 'offer_rejected', 'counter_offer_received', 'offer_expiring',
            'followed_back', 'owner_liked_review',
            
            // General
            'subscription_expiry', 'performance_report', 'recommendation'
        ],
        required: true
    },
    priority: {
        type: String,
        enum: ['high', 'medium', 'low'],
        default: 'medium'
    },
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    badge: {
        type: String,
        enum: ['PRO PARTNER', 'ELITE MEMBER', null],
        default: null
    },
    data: {
        propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
        visitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Visit' },
        offerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer' },
        chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' },
        leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
        priority: String,
        status: String,
        ownerPhone: String,
        actionUrl: String,
        imageUrl: String
    },
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster queries
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
