const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Visit = require('../models/Visit');

// Schedule Visit
router.post('/schedule', auth, async (req, res) => {
    try {
        const { property, owner, visitDate, visitTime, note } = req.body;
        const newVisit = new Visit({
            property,
            visitor: req.user.id,
            owner,
            visitDate,
            visitTime,
            note
        });
        await newVisit.save();
        res.status(201).json(newVisit);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// Get My Scheduled Visits
router.get('/my-visits', auth, async (req, res) => {
    try {
        const visits = await Visit.find({ visitor: req.user.id })
            .populate('property')
            .populate('owner', 'name phoneNumber profileImage');
        res.json(visits);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// Get Received Visit Requests (for owners)
router.get('/requests', auth, async (req, res) => {
    try {
        const visits = await Visit.find({ owner: req.user.id })
            .populate('property')
            .populate('visitor', 'name phoneNumber profileImage');
        res.json(visits);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// Update Visit Status
router.put('/:id', auth, async (req, res) => {
    try {
        const { status } = req.body;
        const visit = await Visit.findById(req.params.id);
        if (!visit) return res.status(404).json({ msg: 'Visit not found' });

        if (visit.owner.toString() !== req.user.id && visit.visitor.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Unauthorized' });
        }

        visit.status = status;
        await visit.save();
        res.json(visit);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

module.exports = router;
