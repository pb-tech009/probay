const mongoose = require('mongoose');

const savedSearchSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    // Search criteria
    filters: {
        type: {
            type: String
        },
        status: {
            type: String
        },
        minPrice: Number,
        maxPrice: Number,
        bhkType: String,
        furnishingStatus: String,
        city: String,
        area: String,
        isStudentFriendly: Boolean,
        roommateNeeded: Boolean
    },
    // Alert settings
    alertEnabled: {
        type: Boolean,
        default: true
    },
    alertFrequency: {
        type: String,
        enum: ['instant', 'daily', 'weekly'],
        default: 'instant'
    },
    lastAlertSent: {
        type: Date
    },
    // Stats
    matchCount: {
        type: Number,
        default: 0
    },
    lastMatchDate: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

savedSearchSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('SavedSearch', savedSearchSchema);
