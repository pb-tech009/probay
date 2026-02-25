/**
 * Trust Score Calculation Utility
 * Calculates Pro Partner trust score based on multiple factors
 * Score Range: 0-100
 */

const Property = require('../models/Property');
const Lead = require('../models/Lead');

/**
 * Calculate Trust Score for a Pro Partner
 * @param {String} userId - Pro Partner user ID
 * @returns {Number} Trust Score (0-100)
 */
async function calculateTrustScore(userId) {
    try {
        // Get all properties
        const properties = await Property.find({ owner: userId });
        const totalProperties = properties.length;

        if (totalProperties === 0) {
            return 0; // No properties = 0 score
        }

        // Get all leads
        const leads = await Lead.find({ 
            property: { $in: properties.map(p => p._id) }
        });

        const totalLeads = leads.length;

        // Factor 1: Property Quality (0-25 points)
        const propertyScore = calculatePropertyScore(properties);

        // Factor 2: Response Performance (0-25 points)
        const responseScore = calculateResponseScore(leads);

        // Factor 3: Conversion Rate (0-30 points)
        const conversionScore = calculateConversionScore(leads);

        // Factor 4: Activity Level (0-20 points)
        const activityScore = calculateActivityScore(properties, leads);

        // Total Score
        const trustScore = Math.round(
            propertyScore + responseScore + conversionScore + activityScore
        );

        return Math.min(100, Math.max(0, trustScore)); // Clamp between 0-100
    } catch (error) {
        console.error('Trust Score Calculation Error:', error);
        return 0;
    }
}

/**
 * Factor 1: Property Quality Score (0-25 points)
 * - Complete details
 * - Good images
 * - Active properties
 */
function calculatePropertyScore(properties) {
    if (properties.length === 0) return 0;

    let totalScore = 0;

    properties.forEach(property => {
        let score = 0;

        // Has images (5 points)
        if (property.images && property.images.length > 0) {
            score += 5;
        }

        // Has description (3 points)
        if (property.description && property.description.length > 50) {
            score += 3;
        }

        // Has amenities (2 points)
        if (property.amenities && property.amenities.length > 0) {
            score += 2;
        }

        // Is active (5 points)
        if (property.status === 'active' && !property.isExpired) {
            score += 5;
        }

        totalScore += score;
    });

    // Average score per property, scaled to 25 points
    const avgScore = totalScore / properties.length;
    return (avgScore / 15) * 25; // Max 15 points per property → scale to 25
}

/**
 * Factor 2: Response Performance (0-25 points)
 * - Fast response to leads
 * - Response rate
 */
function calculateResponseScore(leads) {
    if (leads.length === 0) return 15; // Default score for new partners

    const respondedLeads = leads.filter(lead => 
        lead.status !== 'new' && lead.ownerResponse
    );

    // Response Rate (0-15 points)
    const responseRate = (respondedLeads.length / leads.length) * 15;

    // Fast Response Rate (0-10 points)
    const fastResponses = respondedLeads.filter(lead => {
        if (!lead.ownerResponseTime) return false;
        const responseTime = new Date(lead.ownerResponseTime) - new Date(lead.createdAt);
        const hoursToRespond = responseTime / (1000 * 60 * 60);
        return hoursToRespond <= 24; // Responded within 24 hours
    });

    const fastResponseRate = respondedLeads.length > 0 
        ? (fastResponses.length / respondedLeads.length) * 10 
        : 0;

    return responseRate + fastResponseRate;
}

/**
 * Factor 3: Conversion Rate (0-30 points)
 * - Leads converted to closed deals
 */
function calculateConversionScore(leads) {
    if (leads.length === 0) return 10; // Default score for new partners

    const closedLeads = leads.filter(lead => lead.status === 'closed');
    const conversionRate = (closedLeads.length / leads.length) * 100;

    // Scale conversion rate to 30 points
    // 0% = 0 points, 50% = 30 points (excellent conversion)
    return Math.min(30, (conversionRate / 50) * 30);
}

/**
 * Factor 4: Activity Level (0-20 points)
 * - Recent activity
 * - Consistent engagement
 */
function calculateActivityScore(properties, leads) {
    let score = 0;

    // Has active properties (10 points)
    const activeProperties = properties.filter(p => 
        p.status === 'active' && !p.isExpired
    );
    
    if (activeProperties.length > 0) {
        score += Math.min(10, activeProperties.length * 2); // 2 points per active property, max 10
    }

    // Recent leads (10 points)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentLeads = leads.filter(lead => 
        new Date(lead.createdAt) > thirtyDaysAgo
    );

    if (recentLeads.length > 0) {
        score += Math.min(10, recentLeads.length * 2); // 2 points per recent lead, max 10
    }

    return score;
}

/**
 * Update Trust Score for a user
 * @param {String} userId - User ID
 */
async function updateTrustScore(userId) {
    try {
        const User = require('../models/User');
        const trustScore = await calculateTrustScore(userId);
        
        await User.findByIdAndUpdate(userId, { trustScore });
        
        console.log(`Trust Score updated for user ${userId}: ${trustScore}`);
        return trustScore;
    } catch (error) {
        console.error('Update Trust Score Error:', error);
        return 0;
    }
}

module.exports = {
    calculateTrustScore,
    updateTrustScore
};
