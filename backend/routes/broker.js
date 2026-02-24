const express = require('express');
const router = express.Router();
const Property = require('../models/Property');
const Lead = require('../models/Lead');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Broker Dashboard Stats
router.get('/dashboard/stats', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (user.role !== 'owner') {
            return res.status(403).json({ msg: 'Only owners/brokers can access this' });
        }

        // Total properties
        const totalProperties = await Property.countDocuments({ owner: req.user.id });
        const activeProperties = await Property.countDocuments({ 
            owner: req.user.id, 
            isExpired: false,
            isAvailable: true
        });
        const expiredProperties = await Property.countDocuments({ 
            owner: req.user.id, 
            isExpired: true
        });

        // Properties expiring soon (within 7 days)
        const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const expiringSoon = await Property.countDocuments({
            owner: req.user.id,
            expiresAt: { $lte: sevenDaysFromNow },
            isExpired: false
        });

        // Lead stats
        const totalLeads = await Lead.countDocuments({ owner: req.user.id });
        const hotLeads = await Lead.countDocuments({ 
            owner: req.user.id, 
            priority: 'hot',
            status: { $nin: ['closed', 'expired'] }
        });
        const newLeads = await Lead.countDocuments({ 
            owner: req.user.id, 
            status: 'new'
        });
        const closedDeals = await Lead.countDocuments({ 
            owner: req.user.id, 
            status: 'closed'
        });

        // Conversion rate
        const conversionRate = totalLeads > 0 
            ? ((closedDeals / totalLeads) * 100).toFixed(2) 
            : 0;

        // Response stats
        const responseStats = {
            avgResponseTime: user.avgResponseTime || 0,
            totalResponses: user.totalResponses || 0,
            fastResponseCount: user.fastResponseCount || 0,
            fastResponseRate: user.totalResponses > 0 
                ? ((user.fastResponseCount / user.totalResponses) * 100).toFixed(2)
                : 0
        };

        // Recent activity
        const recentLeads = await Lead.find({ owner: req.user.id })
            .populate('tenant', 'name phoneNumber')
            .populate('property', 'title images')
            .sort({ createdAt: -1 })
            .limit(5);

        // Monthly performance
        const thisMonth = new Date();
        thisMonth.setDate(1);
        thisMonth.setHours(0, 0, 0, 0);

        const monthlyLeads = await Lead.countDocuments({
            owner: req.user.id,
            createdAt: { $gte: thisMonth }
        });

        const monthlyDeals = await Lead.countDocuments({
            owner: req.user.id,
            status: 'closed',
            updatedAt: { $gte: thisMonth }
        });

        // Revenue potential (if deals closed)
        const revenueData = await Lead.aggregate([
            { 
                $match: { 
                    owner: req.user.id,
                    status: 'closed',
                    finalRent: { $exists: true }
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$finalRent' },
                    avgDealValue: { $avg: '$finalRent' },
                    totalDeals: { $sum: 1 }
                }
            }
        ]);

        res.json({
            properties: {
                total: totalProperties,
                active: activeProperties,
                expired: expiredProperties,
                expiringSoon
            },
            leads: {
                total: totalLeads,
                hot: hotLeads,
                new: newLeads,
                closed: closedDeals,
                conversionRate: Number(conversionRate)
            },
            response: responseStats,
            monthly: {
                leads: monthlyLeads,
                deals: monthlyDeals
            },
            revenue: revenueData[0] || { totalRevenue: 0, avgDealValue: 0, totalDeals: 0 },
            recentActivity: recentLeads,
            trustScore: user.trustScore || 0
        });
    } catch (err) {
        console.error('Broker Dashboard Error:', err);
        res.status(500).json({ msg: err.message });
    }
});

// Get performance trends (last 6 months)
router.get('/dashboard/trends', auth, async (req, res) => {
    try {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const trends = await Lead.aggregate([
            {
                $match: {
                    owner: req.user.id,
                    createdAt: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    totalLeads: { $sum: 1 },
                    closedDeals: {
                        $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] }
                    },
                    avgResponseTime: { $avg: '$responseTime' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        res.json(trends);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// Get missed leads (leads not responded to)
router.get('/dashboard/missed-leads', auth, async (req, res) => {
    try {
        const missedLeads = await Lead.find({
            owner: req.user.id,
            ownerResponded: false,
            status: 'new',
            createdAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Older than 24 hours
        })
        .populate('tenant', 'name phoneNumber')
        .populate('property', 'title images price')
        .sort({ priority: 1, createdAt: 1 });

        res.json(missedLeads);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// Update broker profile (response time, etc.)
router.put('/profile/update', auth, async (req, res) => {
    try {
        const { name, profileImage } = req.body;
        
        const user = await User.findById(req.user.id);
        
        if (name) user.name = name;
        if (profileImage) user.profileImage = profileImage;
        
        await user.save();
        
        res.json(user);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// Get all broker properties
router.get('/properties', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (user.role !== 'owner') {
            return res.status(403).json({ msg: 'Only owners/brokers can access this' });
        }

        const properties = await Property.find({ owner: req.user.id })
            .sort({ createdAt: -1 })
            .populate('likes', 'name phoneNumber');

        res.json(properties);
    } catch (err) {
        console.error('Get Broker Properties Error:', err);
        res.status(500).json({ msg: err.message });
    }
});

// Get all broker leads
router.get('/leads', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (user.role !== 'owner') {
            return res.status(403).json({ msg: 'Only owners/brokers can access this' });
        }

        const { status, priority } = req.query;
        
        let query = { owner: req.user.id };
        
        if (status) {
            query.status = status;
        }
        
        if (priority) {
            query.priority = priority;
        }

        const leads = await Lead.find(query)
            .populate('tenant', 'name phoneNumber profileImage')
            .populate('property', 'title images price type city area')
            .sort({ createdAt: -1 });

        res.json(leads);
    } catch (err) {
        console.error('Get Broker Leads Error:', err);
        res.status(500).json({ msg: err.message });
    }
});

module.exports = router;

// Get all broker properties
router.get('/properties', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user.role !== 'owner') {
            return res.status(403).json({ msg: 'Only owners/brokers can access this' });
        }

        const properties = await Property.find({ owner: req.user.id })
            .sort({ createdAt: -1 })
            .populate('likes', 'name phoneNumber');

        res.json(properties);
    } catch (err) {
        console.error('Get Broker Properties Error:', err);
        res.status(500).json({ msg: err.message });
    }
});

// Get all broker leads
router.get('/leads', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user.role !== 'owner') {
            return res.status(403).json({ msg: 'Only owners/brokers can access this' });
        }

        const { status, priority } = req.query;

        let query = { owner: req.user.id };

        if (status) {
            query.status = status;
        }

        if (priority) {
            query.priority = priority;
        }

        const leads = await Lead.find(query)
            .populate('tenant', 'name phoneNumber profileImage')
            .populate('property', 'title images price type city area')
            .sort({ createdAt: -1 });

        res.json(leads);
    } catch (err) {
        console.error('Get Broker Leads Error:', err);
        res.status(500).json({ msg: err.message });
    }
});

