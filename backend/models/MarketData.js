const mongoose = require('mongoose');

const marketDataSchema = new mongoose.Schema({
    // Location
    city: {
        type: String,
        required: true
    },
    area: {
        type: String,
        required: true
    },
    // Property type
    bhkType: {
        type: String,
        required: true
    },
    // Market stats
    avgRent: {
        type: Number,
        default: 0
    },
    minRent: {
        type: Number,
        default: 0
    },
    maxRent: {
        type: Number,
        default: 0
    },
    avgDeposit: {
        type: Number,
        default: 0
    },
    // Time to rent
    avgDaysToRent: {
        type: Number,
        default: 0
    },
    fastestDaysToRent: {
        type: Number,
        default: 0
    },
    // Supply & Demand
    totalListings: {
        type: Number,
        default: 0
    },
    activeListings: {
        type: Number,
        default: 0
    },
    rentedThisMonth: {
        type: Number,
        default: 0
    },
    // Trends
    priceChange: {
        type: Number,
        default: 0 // percentage
    },
    demandScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    // Period
    month: {
        type: Number,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

marketDataSchema.index({ city: 1, area: 1, bhkType: 1, year: -1, month: -1 });

module.exports = mongoose.model('MarketData', marketDataSchema);
