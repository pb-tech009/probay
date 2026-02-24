const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
    property: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: true
    },
    offerer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    originalRent: Number,
    offeredRent: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Rejected', 'Countered'],
        default: 'Pending'
    },
    message: String,
}, { timestamps: true });

module.exports = mongoose.model('Offer', offerSchema);
