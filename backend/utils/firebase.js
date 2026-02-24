const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// Note: You need to add your Firebase service account key
// Download from: Firebase Console > Project Settings > Service Accounts
let firebaseInitialized = false;

const initializeFirebase = () => {
    if (firebaseInitialized) return;
    
    try {
        // Use service account key file
        const serviceAccount = require('../config/firebase-service-account.json');
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: 'propbay-609cf'
        });
        
        firebaseInitialized = true;
        console.log('✅ Firebase Admin SDK initialized successfully');
    } catch (error) {
        console.error('❌ Firebase initialization error:', error.message);
    }
};

// Send notification to single device
const sendNotification = async (fcmToken, notification) => {
    if (!firebaseInitialized) {
        console.log('Firebase not initialized. Notification not sent.');
        return { success: false, message: 'Firebase not configured' };
    }

    try {
        const message = {
            token: fcmToken,
            notification: {
                title: notification.title,
                body: notification.body,
                imageUrl: notification.imageUrl || undefined
            },
            data: {
                type: notification.type,
                priority: notification.priority,
                badge: notification.badge || '',
                ...notification.data
            },
            android: {
                priority: notification.priority === 'high' ? 'high' : 'normal',
                notification: {
                    sound: notification.priority === 'high' ? 'crystal_high' : 
                           notification.priority === 'medium' ? 'crystal_medium' : 'default',
                    channelId: notification.priority === 'high' ? 'high_priority' : 
                              notification.priority === 'medium' ? 'medium_priority' : 'low_priority',
                    priority: notification.priority === 'high' ? 'max' : 'default',
                    vibrationPattern: notification.priority === 'high' ? [0, 250, 250, 250] : [0, 200],
                    lightSettings: {
                        color: '#D4AF37', // Gold color
                        lightOnDuration: 300,
                        lightOffDuration: 1000
                    }
                }
            },
            apns: {
                payload: {
                    aps: {
                        sound: notification.priority === 'high' ? 'crystal_high.caf' : 
                               notification.priority === 'medium' ? 'crystal_medium.caf' : 'default',
                        badge: 1,
                        contentAvailable: true
                    }
                }
            }
        };

        const response = await admin.messaging().send(message);
        return { success: true, messageId: response };
    } catch (error) {
        console.error('Error sending notification:', error);
        return { success: false, error: error.message };
    }
};

// Send notification to multiple devices
const sendMulticastNotification = async (fcmTokens, notification) => {
    if (!firebaseInitialized || !fcmTokens || fcmTokens.length === 0) {
        return { success: false, message: 'Firebase not configured or no tokens' };
    }

    try {
        const message = {
            tokens: fcmTokens,
            notification: {
                title: notification.title,
                body: notification.body
            },
            data: {
                type: notification.type,
                priority: notification.priority,
                badge: notification.badge || '',
                ...notification.data
            },
            android: {
                priority: notification.priority === 'high' ? 'high' : 'normal',
                notification: {
                    sound: notification.priority === 'high' ? 'crystal_high' : 
                           notification.priority === 'medium' ? 'crystal_medium' : 'default',
                    channelId: notification.priority === 'high' ? 'high_priority' : 
                              notification.priority === 'medium' ? 'medium_priority' : 'low_priority'
                }
            }
        };

        const response = await admin.messaging().sendMulticast(message);
        return { 
            success: true, 
            successCount: response.successCount,
            failureCount: response.failureCount 
        };
    } catch (error) {
        console.error('Error sending multicast notification:', error);
        return { success: false, error: error.message };
    }
};

// Send notification to topic (for broadcast)
const sendTopicNotification = async (topic, notification) => {
    if (!firebaseInitialized) {
        return { success: false, message: 'Firebase not configured' };
    }

    try {
        const message = {
            topic: topic,
            notification: {
                title: notification.title,
                body: notification.body
            },
            data: {
                type: notification.type,
                priority: notification.priority,
                ...notification.data
            }
        };

        const response = await admin.messaging().send(message);
        return { success: true, messageId: response };
    } catch (error) {
        console.error('Error sending topic notification:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    initializeFirebase,
    sendNotification,
    sendMulticastNotification,
    sendTopicNotification
};
