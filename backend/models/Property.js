const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: [
            'Apartment/Flat',
            'Independent House/Villa',
            'Penthouse',
            'PG/Hostel',
            'Office Space',
            'Shop/Showroom',
            'Plot/Land',
            'Warehouse/Godown',
            'Farm House',
            'Industrial Plot'
        ],
        required: true
    },
    isDirectOwner: {
        type: Boolean,
        default: true
    },
    brokerageAmount: {
        type: Number,
        default: 0
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    images: [{
        type: String, // URLs to images
        required: true
    }],
    price: {
        type: Number,
        required: true,
        min: 0
    },
    bhkType: {
        type: String,
        enum: ['1BHK', '2BHK', '3BHK', '4BHK+', 'Studio', 'Room'],
        default: '1BHK'
    },
    furnishingStatus: {
        type: String,
        enum: ['Furnished', 'Semi-Furnished', 'Unfurnished'],
        default: 'Unfurnished'
    },
    amenities: [String],
    city: {
        type: String,
        default: 'Ahmedabad'
    },
    area: String,
    societyName: String,
    nearbyColleges: [String],
    pgRating: {
        type: Number,
        default: 0
    },
    videoUrl: String,
    isVerified: {
        type: Boolean,
        default: false
    },
    areaAverageRent: {
        type: Number,
        default: 0
    },
    negotiationEnabled: {
        type: Boolean,
        default: true
    },
    genderPreference: {
        type: String,
        enum: ['Male', 'Female', 'Any'],
        default: 'Any'
    },
    professionPreference: String,
    reviews: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        safetyRating: Number,
        waterRating: Number,
        trafficRating: Number,
        comment: String,
        createdAt: { type: Date, default: Date.now }
    }],
    status: {
        type: String,
        enum: ['Rent', 'Sell'],
        required: true
    },
    address: {
        type: String,
        required: true
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            default: [0, 0]
        }
    },
    description: String,
    features: [String],
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    isAvailable: {
        type: Boolean,
        default: true
    },
    isStudentFriendly: {
        type: Boolean,
        default: false
    },
    roommateNeeded: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        default: function() {
            return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
        }
    },
    isExpired: {
        type: Boolean,
        default: false
    },
    lastRenewed: {
        type: Date,
        default: Date.now
    },
    // View tracking
    viewCount: {
        type: Number,
        default: 0
    },
    uniqueViewers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    lastViewed: {
        type: Date
    },
    // Featured listing
    isFeatured: {
        type: Boolean,
        default: false
    },
    featuredUntil: {
        type: Date
    },
    featuredPriority: {
        type: Number,
        default: 0 // Higher number = higher priority
    }
});

propertySchema.index({ location: '2dsphere' });
propertySchema.index({ expiresAt: 1 });
propertySchema.index({ isFeatured: -1, featuredPriority: -1 });

module.exports = mongoose.model('Property', propertySchema);
