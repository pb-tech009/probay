const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
    property: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: true
    },
    tenant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Lead Quality Information
    budget: {
        type: Number,
        required: true
    },
    moveInDate: {
        type: Date,
        required: true
    },
    familyType: {
        type: String,
        enum: ['bachelor', 'family', 'couple'],
        required: true
    },
    jobType: {
        type: String,
        enum: ['student', 'working', 'business', 'other'],
        required: true
    },
    // Lead Priority (Auto-calculated)
    priority: {
        type: String,
        enum: ['hot', 'warm', 'casual'],
        default: 'casual'
    },
    // Lead Status
    status: {
        type: String,
        enum: ['new', 'contacted', 'interested', 'not_interested', 'closed', 'expired'],
        default: 'new'
    },
    // Contact Details
    contactUnlocked: {
        type: Boolean,
        default: false
    },
    unlockedAt: {
        type: Date
    },
    // Response Tracking
    ownerResponded: {
        type: Boolean,
        default: false
    },
    responseTime: {
        type: Number // in minutes
    },
    respondedAt: {
        type: Date
    },
    // Notes
    ownerNotes: {
        type: String,
        default: ''
    },
    tenantNotes: {
        type: String,
        default: ''
    },
    // Deal Information (if closed)
    finalRent: {
        type: Number
    },
    deposit: {
        type: Number
    },
    daysToClose: {
        type: Number
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Auto-calculate priority based on move-in date
leadSchema.pre('save', async function() {
    if (this.moveInDate) {
        const daysUntilMoveIn = Math.ceil((this.moveInDate - new Date()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilMoveIn <= 7) {
            this.priority = 'hot';
        } else if (daysUntilMoveIn <= 30) {
            this.priority = 'warm';
        } else {
            this.priority = 'casual';
        }
    }
    
    this.updatedAt = new Date();
});

// Indexes
leadSchema.index({ property: 1, tenant: 1 });
leadSchema.index({ owner: 1, status: 1 });
leadSchema.index({ priority: 1, createdAt: -1 });

module.exports = mongoose.model('Lead', leadSchema);
