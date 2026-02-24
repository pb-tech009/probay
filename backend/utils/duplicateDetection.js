const Property = require('../models/Property');

// Check for duplicate address
const checkDuplicateAddress = async (address, city, area, excludePropertyId = null) => {
    try {
        // Normalize address for comparison
        const normalizedAddress = address.toLowerCase().trim().replace(/\s+/g, ' ');
        
        const query = {
            $or: [
                { address: { $regex: normalizedAddress, $options: 'i' } }
            ]
        };

        if (city) {
            query.city = { $regex: city, $options: 'i' };
        }
        if (area) {
            query.area = { $regex: area, $options: 'i' };
        }

        if (excludePropertyId) {
            query._id = { $ne: excludePropertyId };
        }

        const duplicates = await Property.find(query)
            .populate('owner', 'name phoneNumber')
            .select('title address price owner createdAt');

        return duplicates;
    } catch (error) {
        console.error('Duplicate address check error:', error);
        return [];
    }
};

// Check for similar properties (same area, similar price, same BHK)
const checkSimilarProperties = async (bhkType, price, area, city, excludePropertyId = null) => {
    try {
        const priceRange = price * 0.1; // 10% price range

        const query = {
            bhkType,
            price: {
                $gte: price - priceRange,
                $lte: price + priceRange
            },
            area: { $regex: area, $options: 'i' },
            city: { $regex: city, $options: 'i' }
        };

        if (excludePropertyId) {
            query._id = { $ne: excludePropertyId };
        }

        const similar = await Property.find(query)
            .populate('owner', 'name phoneNumber')
            .select('title address price bhkType owner')
            .limit(5);

        return similar;
    } catch (error) {
        console.error('Similar properties check error:', error);
        return [];
    }
};

// Generate property fingerprint for duplicate detection
const generatePropertyFingerprint = (property) => {
    const { address, city, area, bhkType, price } = property;
    
    const normalized = {
        address: address.toLowerCase().trim().replace(/\s+/g, ''),
        city: city.toLowerCase().trim(),
        area: area ? area.toLowerCase().trim() : '',
        bhkType: bhkType.toLowerCase(),
        priceRange: Math.floor(price / 1000) * 1000 // Round to nearest 1000
    };

    return `${normalized.city}_${normalized.area}_${normalized.bhkType}_${normalized.priceRange}`;
};

module.exports = {
    checkDuplicateAddress,
    checkSimilarProperties,
    generatePropertyFingerprint
};
