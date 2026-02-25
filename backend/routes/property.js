const express = require('express');
const router = express.Router();
const Property = require('../models/Property');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const { createNotification, NotificationTemplates } = require('../utils/notificationHelper');
const { checkDuplicateAddress, checkSimilarProperties } = require('../utils/duplicateDetection');
const { compressVideoAsync } = require('../utils/videoCompression');

// Multer Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit for videos
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp|mp4|mov|avi|wmv/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error("Error: File upload only supports images and videos"));
    }
});

const auth = require('../middleware/auth');

// Create Property
router.post('/create', [
    auth,
    upload.fields([
        { name: 'images', maxCount: 5 },
        { name: 'video', maxCount: 1 }
    ]),
    body('title').notEmpty().withMessage('Title is required'),
    body('price').isNumeric().withMessage('Price must be a number'),
    body('type').notEmpty().withMessage('Property type is required'),
    body('status').notEmpty().withMessage('Status (Rent/Sell) is required'),
    body('address').notEmpty().withMessage('Address is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const {
            title, type, price, status, address, description,
            latitude, longitude, bhkType, furnishingStatus, amenities,
            city, area, societyName, isStudentFriendly, roommateNeeded,
            nearbyColleges
        } = req.body;

        if (!req.files || !req.files['images'] || req.files['images'].length === 0) {
            return res.status(400).json({ msg: "At least one image is required" });
        }

        const imageUrls = req.files['images'].map(file => `/uploads/${file.filename}`);
        const videoUrl = req.files['video'] ? `/uploads/${req.files['video'][0].filename}` : null;

        // Compress video in background if uploaded
        if (videoUrl && req.files['video']) {
            const videoPath = path.join(__dirname, '..', 'uploads', req.files['video'][0].filename);
            console.log('🎬 Video uploaded, starting background compression...');
            compressVideoAsync(videoPath, (err, compressedPath) => {
                if (!err) {
                    console.log('✅ Video compression completed:', compressedPath);
                }
            });
        }

        // Check for duplicate address
        const duplicates = await checkDuplicateAddress(address, city, area);
        const similarProperties = await checkSimilarProperties(bhkType, Number(price), area, city);
        
        // Return warning if duplicates found
        if (duplicates.length > 0 || similarProperties.length > 0) {
            return res.status(409).json({ 
                msg: 'Potential duplicate detected',
                duplicates: duplicates.map(p => ({
                    id: p._id,
                    title: p.title,
                    address: p.address,
                    price: p.price,
                    owner: p.owner,
                    createdAt: p.createdAt
                })),
                similarProperties: similarProperties.map(p => ({
                    id: p._id,
                    title: p.title,
                    address: p.address,
                    price: p.price,
                    bhkType: p.bhkType,
                    owner: p.owner
                }))
            });
        }

        const newProperty = new Property({
            title,
            type,
            owner: req.user.id,
            images: imageUrls,
            videoUrl: videoUrl,
            isVerified: !!videoUrl, // Auto-verify if video is provided (simplified logic)
            price: Number(price),
            status,
            address,
            description,
            bhkType,
            furnishingStatus,
            amenities: typeof amenities === 'string' ? JSON.parse(amenities) : (amenities || []),
            city: city || 'Ahmedabad',
            area,
            societyName,
            nearbyColleges: typeof nearbyColleges === 'string' ? JSON.parse(nearbyColleges) : (nearbyColleges || []),
            isStudentFriendly: isStudentFriendly === 'true' || isStudentFriendly === true,
            roommateNeeded: roommateNeeded === 'true' || roommateNeeded === true,
            location: {
                type: 'Point',
                coordinates: [parseFloat(longitude || 0), parseFloat(latitude || 0)]
            }
        });

        await newProperty.save();
        res.status(201).json(newProperty);
    } catch (err) {
        console.error("Create Property Error:", err);
        res.status(500).json({ msg: err.message });
    }
});

// Create Property (Force - Skip duplicate check)
router.post('/create-force', [
    auth,
    upload.fields([
        { name: 'images', maxCount: 5 },
        { name: 'video', maxCount: 1 }
    ]),
    body('title').notEmpty().withMessage('Title is required'),
    body('price').isNumeric().withMessage('Price must be a number'),
    body('type').notEmpty().withMessage('Property type is required'),
    body('status').notEmpty().withMessage('Status (Rent/Sell) is required'),
    body('address').notEmpty().withMessage('Address is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const {
            title, type, price, status, address, description,
            latitude, longitude, bhkType, furnishingStatus, amenities,
            city, area, societyName, isStudentFriendly, roommateNeeded,
            nearbyColleges
        } = req.body;

        if (!req.files || !req.files['images'] || req.files['images'].length === 0) {
            return res.status(400).json({ msg: "At least one image is required" });
        }

        const imageUrls = req.files['images'].map(file => `/uploads/${file.filename}`);
        const videoUrl = req.files['video'] ? `/uploads/${req.files['video'][0].filename}` : null;

        // Compress video in background if uploaded (force-create)
        if (videoUrl && req.files['video']) {
            const videoPath = path.join(__dirname, '..', 'uploads', req.files['video'][0].filename);
            console.log('🎬 Video uploaded (force-create), starting background compression...');
            compressVideoAsync(videoPath, (err, compressedPath) => {
                if (!err) {
                    console.log('✅ Video compression completed:', compressedPath);
                }
            });
        }

        const newProperty = new Property({
            title,
            type,
            owner: req.user.id,
            images: imageUrls,
            videoUrl: videoUrl,
            isVerified: !!videoUrl,
            price: Number(price),
            status,
            address,
            description,
            bhkType,
            furnishingStatus,
            amenities: typeof amenities === 'string' ? JSON.parse(amenities) : (amenities || []),
            city: city || 'Ahmedabad',
            area,
            societyName,
            nearbyColleges: typeof nearbyColleges === 'string' ? JSON.parse(nearbyColleges) : (nearbyColleges || []),
            isStudentFriendly: isStudentFriendly === 'true' || isStudentFriendly === true,
            roommateNeeded: roommateNeeded === 'true' || roommateNeeded === true,
            location: {
                type: 'Point',
                coordinates: [parseFloat(longitude || 0), parseFloat(latitude || 0)]
            }
        });

        await newProperty.save();
        res.status(201).json(newProperty);
    } catch (err) {
        console.error("Create Property Force Error:", err);
        res.status(500).json({ msg: err.message });
    }
});

// Get All Properties (with advanced filters & pagination)
router.get('/', async (req, res) => {
    try {
        const {
            type, status, minPrice, maxPrice, bhkType, furnishingStatus,
            city, area, societyName, isStudentFriendly, roommateNeeded,
            latitude, longitude, search, page = 1, limit = 10, nearbyCollege,
            includeExpired = 'false'
        } = req.query;

        let query = {};

        // By default, exclude expired properties
        if (includeExpired !== 'true') {
            query.isExpired = false;
        }

        if (search) {
            query.$or = [
                { city: { $regex: search, $options: 'i' } },
                { area: { $regex: search, $options: 'i' } },
                { societyName: { $regex: search, $options: 'i' } },
                { title: { $regex: search, $options: 'i' } }
            ];
        }

        if (latitude && longitude && !search && !city) {
            query.location = {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [parseFloat(longitude), parseFloat(latitude)]
                    },
                    $maxDistance: 10000
                }
            };
        }
        if (type) query.type = type;
        if (status) query.status = status;
        if (bhkType) query.bhkType = bhkType;
        if (furnishingStatus) query.furnishingStatus = furnishingStatus;
        if (city) query.city = { $regex: city, $options: 'i' };
        if (area) query.area = { $regex: area, $options: 'i' };
        if (societyName) query.societyName = { $regex: societyName, $options: 'i' };
        if (isStudentFriendly === 'true') query.isStudentFriendly = true;
        if (roommateNeeded === 'true') query.roommateNeeded = true;
        if (nearbyCollege) query.nearbyColleges = { $regex: nearbyCollege, $options: 'i' };

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        const properties = await Property.find(query)
            .populate('owner', 'phoneNumber name profileImage avgResponseTime fastResponseCount totalResponses')
            .sort({ 
                isFeatured: -1, // Featured first
                featuredPriority: -1, // Higher priority first
                createdAt: -1 // Then newest
            })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Property.countDocuments(query);

        res.json({
            properties,
            totalPages: Math.ceil(total / limit),
            currentPage: Number(page),
            totalResults: total
        });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// Update Property
router.put('/update/:id', [
    auth,
    upload.fields([
        { name: 'images', maxCount: 5 },
        { name: 'video', maxCount: 1 }
    ]),
    body('price').optional().isNumeric().withMessage('Price must be a number')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const property = await Property.findById(req.params.id);
        if (!property) return res.status(404).json({ msg: 'Property not found' });

        if (property.owner.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized to update this property' });
        }

        const {
            title, type, price, status, address, description,
            latitude, longitude, bhkType, furnishingStatus, amenities,
            city, area, societyName, isStudentFriendly, roommateNeeded,
            nearbyColleges
        } = req.body;

        let updateData = {
            title: title || property.title,
            type: type || property.type,
            price: price ? Number(price) : property.price,
            status: status || property.status,
            address: address || property.address,
            description: description || property.description,
            bhkType: bhkType || property.bhkType,
            furnishingStatus: furnishingStatus || property.furnishingStatus,
            amenities: typeof amenities === 'string' ? JSON.parse(amenities) : (amenities || property.amenities),
            nearbyColleges: typeof nearbyColleges === 'string' ? JSON.parse(nearbyColleges) : (nearbyColleges || property.nearbyColleges),
            city: city || property.city,
            area: area || property.area,
            societyName: societyName || property.societyName,
            isStudentFriendly: isStudentFriendly === 'true' || isStudentFriendly === true,
            roommateNeeded: roommateNeeded === 'true' || roommateNeeded === true,
            location: (latitude && longitude) ? {
                type: 'Point',
                coordinates: [parseFloat(longitude), parseFloat(latitude)]
            } : property.location
        };

        // Handle Images Update
        if (req.files && req.files['images'] && req.files['images'].length > 0) {
            // Delete old images from disk
            if (property.images && property.images.length > 0) {
                property.images.forEach(img => {
                    const filePath = path.join(__dirname, '..', img.replace(/^\//, ''));
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                });
            }
            updateData.images = req.files['images'].map(file => `/uploads/${file.filename}`);
        }

        // Handle Video Update
        if (req.files && req.files['video'] && req.files['video'].length > 0) {
            // Delete old video from disk
            if (property.videoUrl) {
                const filePath = path.join(__dirname, '..', property.videoUrl.replace(/^\//, ''));
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }
            updateData.videoUrl = `/uploads/${req.files['video'][0].filename}`;
            updateData.isVerified = true;
        }

        const updatedProperty = await Property.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json(updatedProperty);
    } catch (err) {
        console.error("Update Property Error:", err);
        res.status(500).json({ msg: err.message });
    }
});

// Delete Property
router.delete('/:id', auth, async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        if (!property) return res.status(404).json({ msg: 'Property not found' });

        if (property.owner.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Unauthorized' });
        }

        // Delete images from disk
        property.images.forEach(img => {
            const filePath = path.join(__dirname, '..', img.replace(/^\//, ''));
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        });

        await Property.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Property deleted' });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// Like/Unlike Property
router.post('/like/:id', auth, async (req, res) => {
    try {
        const property = await Property.findById(req.params.id).populate('owner');
        if (!property) return res.status(404).json({ msg: 'Property not found' });

        const isLiking = !property.likes.includes(req.user.id);

        if (property.likes.includes(req.user.id)) {
            property.likes = property.likes.filter(id => id.toString() !== req.user.id);
        } else {
            property.likes.push(req.user.id);
            
            // Send notification to property owner
            if (property.owner._id.toString() !== req.user.id) {
                const User = require('../models/User');
                const liker = await User.findById(req.user.id);
                const template = NotificationTemplates.propertyLiked(liker.name, property.title);
                
                await createNotification({
                    recipientId: property.owner._id,
                    senderId: req.user.id,
                    type: 'property_liked',
                    title: template.title,
                    body: template.body,
                    data: {
                        propertyId: property._id,
                        imageUrl: property.images[0]
                    }
                });
            }
        }

        await property.save();
        res.json(property.likes);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// Add Review
router.post('/review/:id', auth, async (req, res) => {
    try {
        const { safetyRating, waterRating, trafficRating, comment } = req.body;
        const property = await Property.findById(req.params.id);
        if (!property) return res.status(404).json({ msg: 'Property not found' });

        const newReview = {
            user: req.user.id,
            safetyRating: Number(safetyRating),
            waterRating: Number(waterRating),
            trafficRating: Number(trafficRating),
            comment
        };

        property.reviews.push(newReview);
        await property.save();
        res.json(property.reviews);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// Renew Property (Extend expiry by 30 days)
router.post('/renew/:id', auth, async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        if (!property) return res.status(404).json({ msg: 'Property not found' });

        if (property.owner.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Unauthorized' });
        }

        // Extend expiry by 30 days
        property.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        property.isExpired = false;
        property.lastRenewed = new Date();
        
        await property.save();
        
        res.json({ 
            msg: 'Property renewed successfully',
            expiresAt: property.expiresAt
        });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// Check and mark expired properties (Cron job endpoint)
router.post('/check-expired', async (req, res) => {
    try {
        const now = new Date();
        
        const result = await Property.updateMany(
            { 
                expiresAt: { $lte: now },
                isExpired: false
            },
            { 
                $set: { isExpired: true }
            }
        );

        res.json({ 
            msg: 'Expired properties updated',
            count: result.modifiedCount
        });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// Get expiring soon properties (for owner dashboard)
router.get('/expiring-soon', auth, async (req, res) => {
    try {
        const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        
        const properties = await Property.find({
            owner: req.user.id,
            expiresAt: { $lte: sevenDaysFromNow },
            isExpired: false
        }).select('title images expiresAt price');

        res.json(properties);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// Track property view
router.post('/track-view/:id', auth, async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        if (!property) return res.status(404).json({ msg: 'Property not found' });

        // Increment view count
        property.viewCount += 1;
        property.lastViewed = new Date();

        // Add to unique viewers if not already viewed
        if (!property.uniqueViewers.includes(req.user.id)) {
            property.uniqueViewers.push(req.user.id);
        }

        await property.save();

        res.json({ 
            msg: 'View tracked',
            viewCount: property.viewCount,
            uniqueViewers: property.uniqueViewers.length
        });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// Make property featured
router.post('/make-featured/:id', auth, async (req, res) => {
    try {
        const { days = 7, priority = 1 } = req.body;

        const property = await Property.findById(req.params.id);
        if (!property) return res.status(404).json({ msg: 'Property not found' });

        if (property.owner.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Unauthorized' });
        }

        // TODO: Add payment logic here
        // For now, just make it featured

        property.isFeatured = true;
        property.featuredUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
        property.featuredPriority = priority;

        await property.save();

        res.json({
            msg: 'Property is now featured',
            featuredUntil: property.featuredUntil,
            priority: property.featuredPriority
        });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// Get featured properties
router.get('/featured', async (req, res) => {
    try {
        const { city, page = 1, limit = 10 } = req.query;

        let query = {
            isFeatured: true,
            featuredUntil: { $gte: new Date() },
            isExpired: false
        };

        if (city) {
            query.city = { $regex: city, $options: 'i' };
        }

        const properties = await Property.find(query)
            .populate('owner', 'name phoneNumber avgResponseTime')
            .sort({ featuredPriority: -1, createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Property.countDocuments(query);

        res.json({
            properties,
            totalPages: Math.ceil(total / limit),
            currentPage: Number(page),
            totalResults: total
        });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// Get Property by ID
router.get('/:id', async (req, res) => {
    try {
        const property = await Property.findById(req.params.id)
            .populate('owner', 'name phoneNumber profileImage avgResponseTime trustScore')
            .populate('likes', 'name phoneNumber');

        if (!property) {
            return res.status(404).json({ msg: 'Property not found' });
        }

        res.json(property);
    } catch (err) {
        console.error('Get Property Error:', err);
        res.status(500).json({ msg: err.message });
    }
});

// Update Property
router.put('/update/:id', auth, async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);

        if (!property) {
            return res.status(404).json({ msg: 'Property not found' });
        }

        // Check if user is the owner
        if (property.owner.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Not authorized to update this property' });
        }

        const { title, price, description, address } = req.body;

        if (title) property.title = title;
        if (price) property.price = Number(price);
        if (description) property.description = description;
        if (address) property.address = address;

        await property.save();

        res.json(property);
    } catch (err) {
        console.error('Update Property Error:', err);
        res.status(500).json({ msg: err.message });
    }
});

// Delete Property
router.delete('/delete/:id', auth, async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);

        if (!property) {
            return res.status(404).json({ msg: 'Property not found' });
        }

        // Check if user is the owner
        if (property.owner.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Not authorized to delete this property' });
        }

        await Property.findByIdAndDelete(req.params.id);

        res.json({ msg: 'Property deleted successfully' });
    } catch (err) {
        console.error('Delete Property Error:', err);
        res.status(500).json({ msg: err.message });
    }
});

module.exports = router;
