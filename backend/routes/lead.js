const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');
const Property = require('../models/Property');
const User = require('../models/User');
const MarketData = require('../models/MarketData');
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const { createNotification, NotificationTemplates } = require('../utils/notificationHelper');

// Update market data when deal closes
const updateMarketData = async (property, lead) => {
    try {
        const { city, area, bhkType } = property;
        const currentDate = new Date();
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();

        let marketData = await MarketData.findOne({ city, area, bhkType, month, year });

        if (!marketData) {
            marketData = new MarketData({ city, area, bhkType, month, year });
        }

        // Update stats
        const allClosedLeads = await Lead.find({
            status: 'closed',
            finalRent: { $exists: true }
        }).populate({
            path: 'property',
            match: { city, area, bhkType }
        });

        const validLeads = allClosedLeads.filter(l => l.property);

        if (validLeads.length > 0) {
            const rents = validLeads.map(l => l.finalRent);
            const deposits = validLeads.map(l => l.deposit || 0);
            const daysToRent = validLeads.map(l => l.daysToClose);

            marketData.avgRent = Math.round(rents.reduce((a, b) => a + b, 0) / rents.length);
            marketData.minRent = Math.min(...rents);
            marketData.maxRent = Math.max(...rents);
            marketData.avgDeposit = Math.round(deposits.reduce((a, b) => a + b, 0) / deposits.length);
            marketData.avgDaysToRent = Math.round(daysToRent.reduce((a, b) => a + b, 0) / daysToRent.length);
            marketData.fastestDaysToRent = Math.min(...daysToRent);
            marketData.rentedThisMonth = validLeads.filter(l => {
                const leadDate = new Date(l.updatedAt);
                return leadDate.getMonth() + 1 === month && leadDate.getFullYear() === year;
            }).length;
        }

        // Count listings
        marketData.totalListings = await Property.countDocuments({ city, area, bhkType });
        marketData.activeListings = await Property.countDocuments({ 
            city, area, bhkType, 
            isExpired: false, 
            isAvailable: true 
        });

        marketData.lastUpdated = new Date();
        await marketData.save();

        console.log('Market data updated:', { city, area, bhkType });
    } catch (error) {
        console.error('Market data update error:', error);
    }
};

// Create Lead (Tenant shows interest)
router.post('/create', [
    auth,
    body('propertyId').notEmpty().withMessage('Property ID is required'),
    body('budget').isNumeric().withMessage('Budget is required'),
    body('moveInDate').isISO8601().withMessage('Valid move-in date is required'),
    body('familyType').isIn(['bachelor', 'family', 'couple']).withMessage('Valid family type is required'),
    body('jobType').isIn(['student', 'working', 'business', 'other']).withMessage('Valid job type is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { propertyId, budget, moveInDate, familyType, jobType, tenantNotes } = req.body;

        // Check if property exists
        const property = await Property.findById(propertyId).populate('owner');
        if (!property) {
            return res.status(404).json({ msg: 'Property not found' });
        }

        // Check if lead already exists
        const existingLead = await Lead.findOne({
            property: propertyId,
            tenant: req.user.id,
            status: { $nin: ['closed', 'expired'] }
        });

        if (existingLead) {
            return res.status(400).json({ msg: 'You have already shown interest in this property' });
        }

        // Create new lead
        const newLead = new Lead({
            property: propertyId,
            tenant: req.user.id,
            owner: property.owner._id,
            budget: Number(budget),
            moveInDate: new Date(moveInDate),
            familyType,
            jobType,
            tenantNotes: tenantNotes || ''
        });

        await newLead.save();

        // Send notification to owner
        const tenant = await User.findById(req.user.id);
        const template = NotificationTemplates.newLead(tenant.name, property.title, newLead.priority);
        
        await createNotification({
            recipientId: property.owner._id,
            senderId: req.user.id,
            type: 'new_lead',
            title: template.title,
            body: template.body,
            data: {
                leadId: newLead._id,
                propertyId: property._id,
                priority: newLead.priority
            }
        });

        res.status(201).json(newLead);
    } catch (err) {
        console.error('Create Lead Error:', err);
        res.status(500).json({ msg: err.message });
    }
});

// Check Lead Status (for contact lock)
router.get('/check-status/:propertyId', auth, async (req, res) => {
    try {
        const lead = await Lead.findOne({
            property: req.params.propertyId,
            tenant: req.user.id,
            status: { $nin: ['expired'] }
        });

        if (!lead) {
            return res.json({ hasLead: false });
        }

        res.json({
            hasLead: true,
            lead: {
                _id: lead._id,
                status: lead.status,
                contactUnlocked: lead.contactUnlocked,
                priority: lead.priority,
                createdAt: lead.createdAt
            }
        });
    } catch (err) {
        console.error('Check Lead Status Error:', err);
        res.status(500).json({ msg: err.message });
    }
});

// Get Leads for Owner (Dashboard)
router.get('/owner/dashboard', auth, async (req, res) => {
    try {
        const { status, priority, page = 1, limit = 20 } = req.query;

        let query = { owner: req.user.id };
        
        if (status) query.status = status;
        if (priority) query.priority = priority;

        const leads = await Lead.find(query)
            .populate('property', 'title images price bhkType area')
            .populate('tenant', 'name phoneNumber profileImage')
            .sort({ priority: 1, createdAt: -1 }) // Hot leads first
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Lead.countDocuments(query);

        // Calculate stats
        const stats = await Lead.aggregate([
            { $match: { owner: req.user.id } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const priorityStats = await Lead.aggregate([
            { $match: { owner: req.user.id, status: { $nin: ['closed', 'expired'] } } },
            {
                $group: {
                    _id: '$priority',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            leads,
            totalPages: Math.ceil(total / limit),
            currentPage: Number(page),
            totalResults: total,
            stats: {
                byStatus: stats,
                byPriority: priorityStats
            }
        });
    } catch (err) {
        console.error('Get Owner Leads Error:', err);
        res.status(500).json({ msg: err.message });
    }
});

// Get Leads for Tenant (My Interests)
router.get('/tenant/my-interests', auth, async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;

        const leads = await Lead.find({ tenant: req.user.id })
            .populate('property', 'title images price bhkType area city')
            .populate('owner', 'name phoneNumber profileImage avgResponseTime')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Lead.countDocuments({ tenant: req.user.id });

        res.json({
            leads,
            totalPages: Math.ceil(total / limit),
            currentPage: Number(page),
            totalResults: total
        });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// Update Lead Status (Owner)
router.put('/update-status/:id', auth, async (req, res) => {
    try {
        const { status, ownerNotes, finalRent, deposit } = req.body;

        const lead = await Lead.findById(req.params.id);
        if (!lead) {
            return res.status(404).json({ msg: 'Lead not found' });
        }

        if (lead.owner.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Unauthorized' });
        }

        // Update response tracking
        if (!lead.ownerResponded) {
            const responseTime = Math.ceil((new Date() - lead.createdAt) / (1000 * 60)); // minutes
            lead.ownerResponded = true;
            lead.responseTime = responseTime;
            lead.respondedAt = new Date();

            // Update owner's response stats
            const owner = await User.findById(req.user.id);
            owner.totalResponses += 1;
            
            if (responseTime <= 10) {
                owner.fastResponseCount += 1;
            }
            
            owner.avgResponseTime = Math.round(
                ((owner.avgResponseTime * (owner.totalResponses - 1)) + responseTime) / owner.totalResponses
            );
            
            owner.lastResponseTime = new Date();
            await owner.save();
        }

        lead.status = status || lead.status;
        lead.ownerNotes = ownerNotes || lead.ownerNotes;

        // If deal closed, save deal info
        if (status === 'closed' && finalRent) {
            lead.finalRent = Number(finalRent);
            lead.deposit = deposit ? Number(deposit) : 0;
            lead.daysToClose = Math.ceil((new Date() - lead.createdAt) / (1000 * 60 * 60 * 24));

            // Update market data
            const property = await Property.findById(lead.property);
            if (property) {
                await updateMarketData(property, lead);
            }
        }

        await lead.save();

        // Send notification to tenant
        const property = await Property.findById(lead.property);
        const owner = await User.findById(req.user.id);
        
        let template;
        if (status === 'interested') {
            template = NotificationTemplates.leadAccepted(owner.name, property.title);
        } else if (status === 'closed') {
            template = NotificationTemplates.dealClosed(property.title);
        }

        if (template) {
            await createNotification({
                recipientId: lead.tenant,
                senderId: req.user.id,
                type: 'lead_update',
                title: template.title,
                body: template.body,
                data: {
                    leadId: lead._id,
                    propertyId: property._id,
                    status: status
                }
            });
        }

        res.json(lead);
    } catch (err) {
        console.error('Update Lead Status Error:', err);
        res.status(500).json({ msg: err.message });
    }
});

// Request Contact Unlock (Tenant submits lead quality form)
router.post('/request-unlock/:id', [
    auth,
    body('budget').isNumeric().withMessage('Budget is required'),
    body('moveInDate').isISO8601().withMessage('Valid move-in date is required'),
    body('familyType').isIn(['bachelor', 'family', 'couple']).withMessage('Valid family type is required'),
    body('jobType').isIn(['student', 'working', 'business', 'other']).withMessage('Valid job type is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const lead = await Lead.findById(req.params.id).populate('property');
        
        if (!lead) {
            return res.status(404).json({ msg: 'Lead not found' });
        }

        if (lead.tenant.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Unauthorized' });
        }

        const { budget, moveInDate, familyType, jobType, tenantNotes } = req.body;

        // Update lead with quality information
        lead.budget = Number(budget);
        lead.moveInDate = new Date(moveInDate);
        lead.familyType = familyType;
        lead.jobType = jobType;
        lead.tenantNotes = tenantNotes || '';
        lead.status = 'new'; // Reset to new for owner review

        await lead.save();

        // Send notification to owner about unlock request
        const tenant = await User.findById(req.user.id);
        const template = NotificationTemplates.contactUnlockRequest(
            tenant.name, 
            lead.property.title, 
            lead.priority
        );
        
        await createNotification({
            recipientId: lead.owner,
            senderId: req.user.id,
            type: 'unlock_request',
            title: template.title,
            body: template.body,
            data: {
                leadId: lead._id,
                propertyId: lead.property._id,
                priority: lead.priority
            }
        });

        res.json({ 
            msg: 'Contact unlock request sent to owner',
            lead
        });
    } catch (err) {
        console.error('Request Unlock Error:', err);
        res.status(500).json({ msg: err.message });
    }
});

// Owner accepts unlock request and shares contact
router.post('/accept-unlock/:id', auth, async (req, res) => {
    try {
        const lead = await Lead.findById(req.params.id)
            .populate('tenant', 'name phoneNumber')
            .populate('property', 'title');
        
        if (!lead) {
            return res.status(404).json({ msg: 'Lead not found' });
        }

        if (lead.owner.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Unauthorized' });
        }

        if (lead.contactUnlocked) {
            return res.json({ 
                msg: 'Contact already unlocked',
                tenantContact: {
                    phoneNumber: lead.tenant.phoneNumber,
                    name: lead.tenant.name
                }
            });
        }

        // Unlock contact
        lead.contactUnlocked = true;
        lead.unlockedAt = new Date();
        lead.status = 'contacted';
        
        // Track response time
        if (!lead.ownerResponded) {
            const responseTime = Math.ceil((new Date() - lead.createdAt) / (1000 * 60));
            lead.ownerResponded = true;
            lead.responseTime = responseTime;
            lead.respondedAt = new Date();

            // Update owner stats
            const owner = await User.findById(req.user.id);
            owner.totalResponses += 1;
            if (responseTime <= 10) owner.fastResponseCount += 1;
            owner.avgResponseTime = Math.round(
                ((owner.avgResponseTime * (owner.totalResponses - 1)) + responseTime) / owner.totalResponses
            );
            owner.lastResponseTime = new Date();
            await owner.save();
        }

        await lead.save();

        // Send notification to tenant
        const owner = await User.findById(req.user.id);
        const template = NotificationTemplates.contactUnlocked(owner.name, lead.property.title);
        
        await createNotification({
            recipientId: lead.tenant._id,
            senderId: req.user.id,
            type: 'contact_unlocked',
            title: template.title,
            body: template.body,
            data: {
                leadId: lead._id,
                propertyId: lead.property._id,
                ownerPhone: owner.phoneNumber
            }
        });

        res.json({
            msg: 'Contact unlocked successfully',
            tenantContact: {
                phoneNumber: lead.tenant.phoneNumber,
                name: lead.tenant.name
            }
        });
    } catch (err) {
        console.error('Accept Unlock Error:', err);
        res.status(500).json({ msg: err.message });
    }
});

// Get Lead Analytics (Owner)
router.get('/analytics', auth, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        let dateFilter = { owner: req.user.id };
        if (startDate && endDate) {
            dateFilter.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        // Total leads
        const totalLeads = await Lead.countDocuments(dateFilter);

        // Conversion rate
        const closedLeads = await Lead.countDocuments({ ...dateFilter, status: 'closed' });
        const conversionRate = totalLeads > 0 ? ((closedLeads / totalLeads) * 100).toFixed(2) : 0;

        // Average deal value
        const dealStats = await Lead.aggregate([
            { $match: { ...dateFilter, status: 'closed', finalRent: { $exists: true } } },
            {
                $group: {
                    _id: null,
                    avgRent: { $avg: '$finalRent' },
                    avgDeposit: { $avg: '$deposit' },
                    avgDaysToClose: { $avg: '$daysToClose' }
                }
            }
        ]);

        // Lead quality distribution
        const qualityDist = await Lead.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: '$priority',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            totalLeads,
            closedLeads,
            conversionRate: Number(conversionRate),
            dealStats: dealStats[0] || {},
            qualityDistribution: qualityDist
        });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

module.exports = router;
