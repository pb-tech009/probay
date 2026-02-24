// Setup test users for E2E testing
const mongoose = require('mongoose');
const User = require('./models/User');
const Otp = require('./models/Otp');
require('dotenv').config();

async function setupTestUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected...');

        // Create Pro Partner (Owner)
        const proPartner = await User.findOneAndUpdate(
            { phoneNumber: '9054187387' },
            {
                phoneNumber: '9054187387',
                role: 'owner',
                name: 'Test Pro Partner',
                profileImage: 'https://via.placeholder.com/150'
            },
            { upsert: true, new: true }
        );
        console.log('✓ Pro Partner created:', proPartner.phoneNumber);

        // Create Elite Member (Tenant)
        const eliteMember = await User.findOneAndUpdate(
            { phoneNumber: '7435956074' },
            {
                phoneNumber: '7435956074',
                role: 'tenant',
                name: 'Test Elite Member',
                profileImage: 'https://via.placeholder.com/150'
            },
            { upsert: true, new: true }
        );
        console.log('✓ Elite Member created:', eliteMember.phoneNumber);

        // Create OTPs for both
        await Otp.findOneAndUpdate(
            { phoneNumber: '9054187387' },
            { phoneNumber: '9054187387', otp: '1111', createdAt: new Date() },
            { upsert: true, new: true }
        );
        console.log('✓ OTP created for Pro Partner');

        await Otp.findOneAndUpdate(
            { phoneNumber: '7435956074' },
            { phoneNumber: '7435956074', otp: '1111', createdAt: new Date() },
            { upsert: true, new: true }
        );
        console.log('✓ OTP created for Elite Member');

        console.log('\n=== Test Users Ready ===');
        console.log('Pro Partner: 9054187387 (OTP: 1111)');
        console.log('Elite Member: 7435956074 (OTP: 1111)');

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

setupTestUsers();
