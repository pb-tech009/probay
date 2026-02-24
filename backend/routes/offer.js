const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Offer = require('../models/Offer');

// Create Offer
router.post('/create', auth, async (req, res) => {
    try {
        const { property, owner, originalRent, offeredRent, message } = req.body;
        const newOffer = new Offer({
            property,
            offerer: req.user.id,
            owner,
            originalRent,
            offeredRent,
            message
        });
        await newOffer.save();
        res.status(201).json(newOffer);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// Get My Sent Offers
router.get('/sent', auth, async (req, res) => {
    try {
        const offers = await Offer.find({ offerer: req.user.id })
            .populate('property')
            .populate('owner', 'name phoneNumber profileImage');
        res.json(offers);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// Get Received Offers (for owners)
router.get('/received', auth, async (req, res) => {
    try {
        const offers = await Offer.find({ owner: req.user.id })
            .populate('property')
            .populate('offerer', 'name phoneNumber profileImage');
        res.json(offers);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// Update Offer Status
router.put('/:id', auth, async (req, res) => {
    try {
        const { status } = req.body;
        const offer = await Offer.findById(req.params.id);
        if (!offer) return res.status(404).json({ msg: 'Offer not found' });

        // Basic check: owner or offerer
        if (offer.owner.toString() !== req.user.id && offer.offerer.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Unauthorized' });
        }

        offer.status = status;
        await offer.save();
        res.json(offer);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

module.exports = router;
