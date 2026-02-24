const express = require('express');
const router = express.Router();
const SavedSearch = require('../models/SavedSearch');
const Property = require('../models/Property');
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Create saved search
router.post('/create', [
    auth,
    body('name').notEmpty().withMessage('Search name is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { name, filters, alertEnabled, alertFrequency } = req.body;

        const savedSearch = new SavedSearch({
            user: req.user.id,
            name,
            filters: filters || {},
            alertEnabled: alertEnabled !== undefined ? alertEnabled : true,
            alertFrequency: alertFrequency || 'instant'
        });

        await savedSearch.save();
        res.status(201).json(savedSearch);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// Get all saved searches
router.get('/', auth, async (req, res) => {
    try {
        const searches = await SavedSearch.find({ user: req.user.id })
            .sort({ createdAt: -1 });

        res.json(searches);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// Get matching properties for a saved search
router.get('/:id/matches', auth, async (req, res) => {
    try {
        const savedSearch = await SavedSearch.findById(req.params.id);
        
        if (!savedSearch) {
            return res.status(404).json({ msg: 'Saved search not found' });
        }

        if (savedSearch.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Unauthorized' });
        }

        const { filters } = savedSearch;
        let query = { isExpired: false };

        // Apply filters
        if (filters.type) query.type = filters.type;
        if (filters.status) query.status = filters.status;
        if (filters.bhkType) query.bhkType = filters.bhkType;
        if (filters.furnishingStatus) query.furnishingStatus = filters.furnishingStatus;
        if (filters.city) query.city = { $regex: filters.city, $options: 'i' };
        if (filters.area) query.area = { $regex: filters.area, $options: 'i' };
        if (filters.isStudentFriendly) query.isStudentFriendly = true;
        if (filters.roommateNeeded) query.roommateNeeded = true;

        if (filters.minPrice || filters.maxPrice) {
            query.price = {};
            if (filters.minPrice) query.price.$gte = Number(filters.minPrice);
            if (filters.maxPrice) query.price.$lte = Number(filters.maxPrice);
        }

        const properties = await Property.find(query)
            .populate('owner', 'name phoneNumber avgResponseTime')
            .sort({ createdAt: -1 })
            .limit(20);

        // Update match count
        savedSearch.matchCount = properties.length;
        if (properties.length > 0) {
            savedSearch.lastMatchDate = new Date();
        }
        await savedSearch.save();

        res.json(properties);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// Update saved search
router.put('/:id', auth, async (req, res) => {
    try {
        const savedSearch = await SavedSearch.findById(req.params.id);
        
        if (!savedSearch) {
            return res.status(404).json({ msg: 'Saved search not found' });
        }

        if (savedSearch.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Unauthorized' });
        }

        const { name, filters, alertEnabled, alertFrequency } = req.body;

        if (name) savedSearch.name = name;
        if (filters) savedSearch.filters = filters;
        if (alertEnabled !== undefined) savedSearch.alertEnabled = alertEnabled;
        if (alertFrequency) savedSearch.alertFrequency = alertFrequency;

        await savedSearch.save();
        res.json(savedSearch);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// Delete saved search
router.delete('/:id', auth, async (req, res) => {
    try {
        const savedSearch = await SavedSearch.findById(req.params.id);
        
        if (!savedSearch) {
            return res.status(404).json({ msg: 'Saved search not found' });
        }

        if (savedSearch.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Unauthorized' });
        }

        await SavedSearch.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Saved search deleted' });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

module.exports = router;
