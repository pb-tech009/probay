const express = require('express');
const router = express.Router();
const MarketData = require('../models/MarketData');
const Property = require('../models/Property');
const auth = require('../middleware/auth');

// Get market data by area
router.get('/area/:areaName', auth, async (req, res) => {
    try {
        const { areaName } = req.params;
        const currentDate = new Date();
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();

        // Get market data for this area (all BHK types)
        const marketData = await MarketData.find({
            area: { $regex: areaName, $options: 'i' },
            year,
            month
        });

        if (marketData.length === 0) {
            // If no market data, calculate from properties
            const properties = await Property.find({
                area: { $regex: areaName, $options: 'i' },
                isExpired: false
            });

            if (properties.length === 0) {
                return res.status(404).json({ msg: 'No data available for this area' });
            }

            const avgRent = Math.round(
                properties.reduce((sum, p) => sum + p.price, 0) / properties.length
            );

            return res.json({
                area: areaName,
                avgRent,
                avgDeposit: avgRent * 2,
                avgDaysToRent: 15,
                totalDeals: 0,
                totalProperties: properties.length,
                activeListings: properties.length,
                bhkBreakdown: {}
            });
        }

        // Aggregate data across all BHK types
        const totalRent = marketData.reduce((sum, d) => sum + (d.avgRent || 0), 0);
        const totalDeposit = marketData.reduce((sum, d) => sum + (d.avgDeposit || 0), 0);
        const totalDays = marketData.reduce((sum, d) => sum + (d.avgDaysToRent || 0), 0);
        const totalDeals = marketData.reduce((sum, d) => sum + (d.rentedThisMonth || 0), 0);
        const totalListings = marketData.reduce((sum, d) => sum + (d.totalListings || 0), 0);
        const activeListings = marketData.reduce((sum, d) => sum + (d.activeListings || 0), 0);

        const avgRent = Math.round(totalRent / marketData.length);
        const avgDeposit = Math.round(totalDeposit / marketData.length);
        const avgDaysToRent = Math.round(totalDays / marketData.length);

        // BHK-wise breakdown
        const bhkBreakdown = {};
        marketData.forEach(data => {
            bhkBreakdown[data.bhkType] = {
                avgRent: data.avgRent,
                minRent: data.minRent,
                maxRent: data.maxRent,
                totalListings: data.totalListings,
                activeListings: data.activeListings
            };
        });

        res.json({
            area: areaName,
            avgRent,
            avgDeposit,
            avgDaysToRent,
            totalDeals,
            totalProperties: totalListings,
            activeListings,
            bhkBreakdown
        });
    } catch (err) {
        console.error('Market Data Error:', err);
        res.status(500).json({ msg: err.message });
    }
});

// Get market trends (last 6 months)
router.get('/trends/:city', auth, async (req, res) => {
    try {
        const { city } = req.params;
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const trends = await MarketData.aggregate([
            {
                $match: {
                    city: { $regex: city, $options: 'i' },
                    lastUpdated: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: { year: '$year', month: '$month' },
                    avgRent: { $avg: '$avgRent' },
                    totalDeals: { $sum: '$rentedThisMonth' },
                    avgDaysToRent: { $avg: '$avgDaysToRent' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        res.json(trends);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// Get top performing areas
router.get('/top-areas/:city', auth, async (req, res) => {
    try {
        const { city } = req.params;
        const currentDate = new Date();
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();

        const topAreas = await MarketData.aggregate([
            {
                $match: {
                    city: { $regex: city, $options: 'i' },
                    year,
                    month
                }
            },
            {
                $group: {
                    _id: '$area',
                    avgRent: { $avg: '$avgRent' },
                    totalDeals: { $sum: '$rentedThisMonth' },
                    avgDaysToRent: { $avg: '$avgDaysToRent' },
                    totalListings: { $sum: '$totalListings' }
                }
            },
            { $sort: { totalDeals: -1 } },
            { $limit: 10 }
        ]);

        res.json(topAreas);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

module.exports = router;
