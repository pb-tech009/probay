const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendNotification } = require('./firebase');

// Get user badge based on role
const getUserBadge = (role) => {
    if (role === 'owner' || role === 'broker') return 'PRO PARTNER';
    if (role === 'tenant') return 'ELITE MEMBER';
    return null;
};

// Priority mapping for notification types
const getPriority = (type) => {
    const highPriority = [
        'visit_request', 'visit_approved', 'offer_accepted', 
        'new_message', 'visit_reminder_1hour'
    ];
    
    const lowPriority = [
        'performance_report', 'recommendation', 'subscription_expiry'
    ];
    
    if (highPriority.includes(type)) return 'high';
    if (lowPriority.includes(type)) return 'low';
    return 'medium';
};

// Create and send notification
const createNotification = async ({
    recipientId,
    senderId,
    type,
    title,
    body,
    data = {}
}) => {
    try {
        // Get recipient user
        const recipient = await User.findById(recipientId);
        if (!recipient) {
            console.error('Recipient not found');
            return null;
        }

        // Get sender user for badge
        let senderBadge = null;
        if (senderId) {
            const sender = await User.findById(senderId);
            if (sender) {
                senderBadge = getUserBadge(sender.role);
            }
        }

        const priority = getPriority(type);

        // Create notification in database
        const notification = new Notification({
            recipient: recipientId,
            sender: senderId,
            type,
            priority,
            title,
            body,
            badge: senderBadge,
            data
        });

        await notification.save();

        // Send FCM notification if user has FCM token
        if (recipient.fcmToken) {
            await sendNotification(recipient.fcmToken, {
                title,
                body,
                type,
                priority,
                badge: senderBadge,
                data,
                imageUrl: data.imageUrl
            });
        }

        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        return null;
    }
};

// Notification templates
const NotificationTemplates = {
    // Owner notifications
    propertyLiked: (senderName, propertyTitle) => ({
        title: '❤️ Property Liked',
        body: `${senderName} liked your property "${propertyTitle}"`
    }),

    propertySaved: (senderName, propertyTitle) => ({
        title: '⭐ Property Saved',
        body: `${senderName} saved your property "${propertyTitle}"`
    }),

    newFollower: (senderName) => ({
        title: '👥 New Follower',
        body: `${senderName} started following you`
    }),

    visitRequest: (senderName, propertyTitle, date) => ({
        title: '📅 New Visit Request',
        body: `${senderName} wants to visit "${propertyTitle}" on ${date}`
    }),

    offerReceived: (senderName, amount, propertyTitle) => ({
        title: '💰 New Offer Received',
        body: `${senderName} offered ₹${amount} for "${propertyTitle}"`
    }),

    newMessage: (senderName) => ({
        title: '💬 New Message',
        body: `${senderName} sent you a message`
    }),

    propertyReview: (senderName, rating, propertyTitle) => ({
        title: '⭐ New Review',
        body: `${senderName} rated "${propertyTitle}" ${rating} stars`
    }),

    // Tenant notifications
    visitApproved: (ownerName, propertyTitle, date) => ({
        title: '✅ Visit Approved',
        body: `${ownerName} approved your visit to "${propertyTitle}" on ${date}`
    }),

    visitRejected: (ownerName, propertyTitle) => ({
        title: '❌ Visit Declined',
        body: `${ownerName} declined your visit request for "${propertyTitle}"`
    }),

    offerAccepted: (ownerName, propertyTitle) => ({
        title: '🎉 Offer Accepted',
        body: `Congratulations! ${ownerName} accepted your offer for "${propertyTitle}"`
    }),

    offerRejected: (ownerName, propertyTitle) => ({
        title: '❌ Offer Declined',
        body: `${ownerName} declined your offer for "${propertyTitle}"`
    }),

    counterOfferReceived: (ownerName, amount, propertyTitle) => ({
        title: '💰 Counter Offer',
        body: `${ownerName} sent counter offer of ₹${amount} for "${propertyTitle}"`
    }),

    visitReminder1Hour: (propertyTitle, address) => ({
        title: '⏰ Visit Reminder',
        body: `Visit in 1 hour: "${propertyTitle}" at ${address}`
    }),

    visitReminder1Day: (propertyTitle, date) => ({
        title: '📅 Visit Tomorrow',
        body: `Reminder: Visit "${propertyTitle}" tomorrow at ${date}`
    }),

    newPropertyInArea: (propertyTitle, price, area) => ({
        title: '🏠 New Property in Your Area',
        body: `${propertyTitle} - ₹${price}/month in ${area}`
    }),

    priceDrop: (propertyTitle, oldPrice, newPrice) => ({
        title: '💸 Price Drop Alert',
        body: `"${propertyTitle}" is now ₹${newPrice} (was ₹${oldPrice})`
    }),

    ownerNewProperty: (ownerName, propertyTitle) => ({
        title: '🏠 New Property Posted',
        body: `${ownerName} posted "${propertyTitle}"`
    }),

    // Lead notifications
    newLead: (tenantName, propertyTitle, priority) => ({
        title: priority === 'hot' ? '🔥 Hot Lead!' : '📋 New Lead',
        body: `${tenantName} is interested in "${propertyTitle}"`
    }),

    leadAccepted: (ownerName, propertyTitle) => ({
        title: '✅ Interest Accepted',
        body: `${ownerName} is interested in your inquiry for "${propertyTitle}"`
    }),

    dealClosed: (propertyTitle) => ({
        title: '🎉 Deal Closed!',
        body: `Congratulations! Deal closed for "${propertyTitle}"`
    }),

    leadExpired: (propertyTitle) => ({
        title: '⏰ Lead Expired',
        body: `Your interest in "${propertyTitle}" has expired`
    }),

    contactUnlockRequest: (tenantName, propertyTitle, priority) => ({
        title: `${priority === 'hot' ? '🔥 ' : ''}Contact Request`,
        body: `${tenantName} wants to connect for "${propertyTitle}". Review their details!`
    }),
    
    contactUnlocked: (ownerName, propertyTitle) => ({
        title: '✅ Contact Shared!',
        body: `${ownerName} accepted your request for "${propertyTitle}". You can now call them!`
    })
};

module.exports = {
    createNotification,
    NotificationTemplates,
    getUserBadge,
    getPriority
};
