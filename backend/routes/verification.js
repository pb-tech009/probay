const express = require('express');
const router = express.Router();
const OwnerVerification = require('../models/OwnerVerification');
const Property = require('../models/Property');
const auth = require('../middleware/auth');
const { sendSMS } = require('../utils/sms');

// Request owner verification OTP
router.post('/request-otp/:propertyId', auth, async (req, res) => {
    try {
        const property = await Property.findById(req.params.propertyId);
        
        if (!property) {
            return res.status(404).json({ msg: 'Property not found' });
        }

        if (property.owner.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Unauthorized' });
        }

        // Generate 4-digit OTP
        const otp = Math.floor(1000 + Math.random() * 9000).toString();

        // Delete any existing verification for this property
        await OwnerVerification.deleteMany({ property: req.params.propertyId });

        // Create new verification
        const verification = new OwnerVerification({
            property: req.params.propertyId,
            owner: req.user.id,
            verificationOtp: otp
        });

        await verification.save();

        // Send OTP via SMS
        const User = require('../models/User');
        const user = await User.findById(req.user.id);
        
        if (user.phoneNumber) {
            const message = `Your PropBay property verification OTP is: ${otp}. Valid for 10 minutes.`;
            await sendSMS(user.phoneNumber, message);
        }

        res.json({ 
            msg: 'OTP sent successfully',
            expiresAt: verification.expiresAt
        });
    } catch (err) {
        console.error('Verification OTP Error:', err);
        res.status(500).json({ msg: err.message });
    }
});

// Verify OTP
router.post('/verify-otp/:propertyId', auth, async (req, res) => {
    try {
        const { otp } = req.body;

        if (!otp) {
            return res.status(400).json({ msg: 'OTP is required' });
        }

        const verification = await OwnerVerification.findOne({
            property: req.params.propertyId,
            owner: req.user.id,
            verificationOtp: otp,
            isVerified: false
        });

        if (!verification) {
            // Increment attempts
            await OwnerVerification.updateOne(
                { property: req.params.propertyId, owner: req.user.id },
                { $inc: { attempts: 1 } }
            );
            return res.status(400).json({ msg: 'Invalid OTP' });
        }

        // Check if expired
        if (new Date() > verification.expiresAt) {
            return res.status(400).json({ msg: 'OTP expired. Please request a new one.' });
        }

        // Mark as verified
        verification.isVerified = true;
        verification.verifiedAt = new Date();
        await verification.save();

        // Update property verification status
        const property = await Property.findById(req.params.propertyId);
        property.isVerified = true;
        await property.save();

        res.json({ 
            msg: 'Property verified successfully',
            property
        });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// Check verification status
router.get('/status/:propertyId', auth, async (req, res) => {
    try {
        const property = await Property.findById(req.params.propertyId);
        
        if (!property) {
            return res.status(404).json({ msg: 'Property not found' });
        }

        const verification = await OwnerVerification.findOne({
            property: req.params.propertyId,
            owner: req.user.id
        }).sort({ createdAt: -1 });

        res.json({
            isVerified: property.isVerified,
            verification: verification ? {
                attempts: verification.attempts,
                expiresAt: verification.expiresAt,
                isExpired: new Date() > verification.expiresAt
            } : null
        });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

module.exports = router;
