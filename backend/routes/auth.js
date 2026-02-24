const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Otp = require('../models/Otp');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const { sendSMS } = require('../utils/sms');

const rateLimit = require('express-rate-limit');

// Rate limiting for OTP requests to prevent SMS bombing
const otpLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 20, // Limit each IP to 20 OTP requests per window (increased for testing)
    message: { msg: 'Too many OTP requests from this IP, please try again after 5 minutes' }
});

// Request OTP
router.post('/request-otp', otpLimiter, async (req, res) => {
    try {
        let { phoneNumber } = req.body;
        
        // Trim whitespace
        phoneNumber = phoneNumber ? phoneNumber.trim() : '';
        
        console.log('OTP Request received:', { body: req.body, phoneNumber });

        if (!phoneNumber) {
            console.log('Error: Phone number missing');
            return res.status(400).json({ msg: 'Phone number is required' });
        }

        // Indian phone number regex
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(phoneNumber)) {
            console.log('Error: Invalid phone format:', phoneNumber);
            return res.status(400).json({ msg: 'Please provide a valid 10-digit Indian phone number' });
        }

        // Fixed OTP for Testing Numbers
        let otp = Math.floor(1000 + Math.random() * 9000).toString();
        const testNumbers = ['9054187387', '7435956074', '9876543210', '8888888888', '9999999999', '7777777777', '6666666666'];

        if (testNumbers.includes(phoneNumber)) {
            otp = '1111';
        }

        // Save OTP to DB
        await Otp.findOneAndUpdate(
            { phoneNumber },
            { otp, createdAt: new Date() },
            { upsert: true, new: true }
        );

        // Send actual SMS if not a test number
        if (!testNumbers.includes(phoneNumber)) {
            const message = `Your PropBay verification code is: ${otp}. Do not share it with anyone.`;
            console.log(`📱 Sending SMS to ${phoneNumber} with OTP: ${otp}`);
            try {
                const smsResponse = await sendSMS(phoneNumber, message);
                console.log('✅ SMS sent successfully:', smsResponse);
            } catch (smsError) {
                console.error('❌ SMS sending failed:', smsError);
                // Continue anyway - OTP is saved in DB
            }
        } else {
            console.log(`🧪 Test number ${phoneNumber} - OTP: ${otp} (SMS not sent)`);
        }

        res.json({ msg: 'OTP sent successfully', isTest: testNumbers.includes(phoneNumber) });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// Verify OTP & Login
router.post('/verify-otp', async (req, res) => {
    try {
        let { phoneNumber, otp } = req.body;
        
        // Trim whitespace
        phoneNumber = phoneNumber ? phoneNumber.trim() : '';
        otp = otp ? otp.trim() : '';

        if (!phoneNumber || !otp) {
            return res.status(400).json({ msg: 'Phone number and OTP are required' });
        }

        const otpRecord = await Otp.findOne({ phoneNumber, otp });

        if (!otpRecord) {
            return res.status(400).json({ msg: 'Invalid or expired OTP' });
        }

        // OTP is valid, delete it
        await Otp.deleteOne({ _id: otpRecord._id });

        // Find or create user
        let user = await User.findOne({ phoneNumber });
        if (!user) {
            user = new User({ phoneNumber, role: 'none' });
            await user.save();
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '90d' });
        res.json({ token, user });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// Old Login (Keep for backward compatibility during transition if needed, but we'll use OTP)
router.post('/login', async (req, res) => {
    // Transitioning to verify-otp
    res.status(401).json({ msg: 'Please use /request-otp and /verify-otp' });
});

// Update Role
router.post('/select-role', async (req, res) => {
    try {
        const { userId, role } = req.body;

        if (!['owner', 'tenant', 'none'].includes(role)) {
            return res.status(400).json({ msg: 'Invalid role selection' });
        }

        const user = await User.findByIdAndUpdate(userId, { role }, { new: true });
        res.json(user);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// Get Profile
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('savedProperties');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
    }
});

// Update Profile
router.put('/profile', auth, async (req, res) => {
    try {
        const { name, profileImage } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: { name, profileImage } },
            { new: true }
        );
        res.json(user);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// Save/Unsave Property
router.post('/save-property/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const propertyId = req.params.id;

        if (user.savedProperties.includes(propertyId)) {
            user.savedProperties = user.savedProperties.filter(id => id.toString() !== propertyId);
        } else {
            user.savedProperties.push(propertyId);
        }

        await user.save();
        res.json(user.savedProperties);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

module.exports = router;

// Update FCM Token
router.post('/update-fcm-token', auth, async (req, res) => {
    try {
        const { fcmToken } = req.body;

        if (!fcmToken) {
            return res.status(400).json({ msg: 'FCM token is required' });
        }

        await User.findByIdAndUpdate(req.user.id, { fcmToken });
        
        console.log(`✅ FCM token updated for user: ${req.user.id}`);
        res.json({ msg: 'FCM token updated successfully' });
    } catch (err) {
        console.error('Update FCM token error:', err);
        res.status(500).json({ msg: err.message });
    }
});
