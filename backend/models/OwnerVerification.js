const mongoose = require('mongoose');

const ownerVerificationSchema = new mongoose.Schema({
    property: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    verificationOtp: {
        type: String,
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verifiedAt: {
        type: Date
    },
    attempts: {
        type: Number,
        default: 0
    },
    expiresAt: {
        type: Date,
        default: function() {
            return new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

ownerVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('OwnerVerification', ownerVerificationSchema);
