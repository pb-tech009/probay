// Create sample data for comprehensive testing
const mongoose = require('mongoose');
const User = require('./models/User');
const Property = require('./models/Property');
const Lead = require('./models/Lead');
const Notification = require('./models/Notification');
require('dotenv').config();

async function createSampleData() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected...');

        // Get test users
        const proPartner = await User.findOne({ phoneNumber: '9054187387' });
        const eliteMember = await User.findOne({ phoneNumber: '7435956074' });

        if (!proPartner || !eliteMember) {
            console.log('Test users not found. Run setup-test-users.js first.');
            process.exit(1);
        }

        console.log('\n=== Creating Sample Properties ===');

        // Sample properties for Pro Partner
        const properties = [
            {
                title: 'Luxury 3BHK Apartment in South Delhi',
                type: 'Apartment/Flat',
                owner: proPartner._id,
                images: ['https://via.placeholder.com/800x600/FFD700/000000?text=Luxury+Apartment'],
                price: 45000,
                bhkType: '3BHK',
                furnishingStatus: 'Furnished',
                amenities: ['Parking', 'Gym', 'Swimming Pool', 'Security', 'Power Backup'],
                city: 'Delhi',
                area: 'South Delhi',
                societyName: 'DLF Garden City',
                status: 'Rent',
                address: 'DLF Garden City, South Delhi, Delhi - 110020',
                description: 'Beautiful 3BHK apartment with modern amenities and great connectivity',
                location: {
                    type: 'Point',
                    coordinates: [77.2090, 28.5355]
                },
                isAvailable: true
            },
            {
                title: 'Commercial Shop in Rajkot Market',
                type: 'Shop/Showroom',
                owner: proPartner._id,
                images: ['https://via.placeholder.com/800x600/FFD700/000000?text=Commercial+Shop'],
                price: 25000,
                furnishingStatus: 'Unfurnished',
                amenities: ['Parking', 'Security'],
                city: 'Rajkot',
                area: 'Market Area',
                societyName: 'Rajkot Central Market',
                status: 'Rent',
                address: 'Central Market, Rajkot, Gujarat - 360001',
                description: 'Prime location shop in busy market area',
                location: {
                    type: 'Point',
                    coordinates: [70.8022, 22.3039]
                },
                isAvailable: true
            },
            {
                title: 'Residential Plot in Banaskantha',
                type: 'Plot/Land',
                owner: proPartner._id,
                images: ['https://via.placeholder.com/800x600/FFD700/000000?text=Residential+Plot'],
                price: 5000000,
                amenities: ['Water Supply', 'Electricity'],
                city: 'Banaskantha',
                area: 'Residential Zone',
                societyName: 'Green Valley Plots',
                status: 'Sell',
                address: 'Green Valley, Banaskantha, Gujarat - 385001',
                description: 'Prime residential plot with all amenities',
                location: {
                    type: 'Point',
                    coordinates: [72.4386, 24.1752]
                },
                isAvailable: true
            },
            {
                title: 'PG for Boys in Mumbai Andheri',
                type: 'PG/Hostel',
                owner: proPartner._id,
                images: ['https://via.placeholder.com/800x600/FFD700/000000?text=PG+Hostel'],
                price: 8000,
                bhkType: 'Room',
                furnishingStatus: 'Furnished',
                amenities: ['WiFi', 'Food', 'Laundry', 'Security'],
                city: 'Mumbai',
                area: 'Andheri West',
                societyName: 'Student PG',
                status: 'Rent',
                address: 'Andheri West, Mumbai, Maharashtra - 400053',
                description: 'Comfortable PG with all facilities for students and working professionals',
                location: {
                    type: 'Point',
                    coordinates: [72.8347, 19.1136]
                },
                isAvailable: true,
                genderPreference: 'Male',
                isStudentFriendly: true
            },
            {
                title: 'Luxury Villa in Goa',
                type: 'Independent House/Villa',
                owner: proPartner._id,
                images: ['https://via.placeholder.com/800x600/FFD700/000000?text=Luxury+Villa'],
                price: 15000000,
                bhkType: '4BHK+',
                furnishingStatus: 'Furnished',
                amenities: ['Swimming Pool', 'Garden', 'Parking', 'Security', 'Power Backup'],
                city: 'Goa',
                area: 'North Goa',
                societyName: 'Beach View Villas',
                status: 'Sell',
                address: 'Beach View Villas, North Goa, Goa - 403001',
                description: 'Stunning villa with sea view and modern amenities',
                location: {
                    type: 'Point',
                    coordinates: [73.8278, 15.4909]
                },
                isAvailable: true
            },
            {
                title: '2BHK Flat in Ahmedabad',
                type: 'Apartment/Flat',
                owner: proPartner._id,
                images: ['https://via.placeholder.com/800x600/FFD700/000000?text=2BHK+Flat'],
                price: 18000,
                bhkType: '2BHK',
                furnishingStatus: 'Semi-Furnished',
                amenities: ['Parking', 'Lift', 'Security'],
                city: 'Ahmedabad',
                area: 'Satellite',
                societyName: 'Shanti Residency',
                status: 'Rent',
                address: 'Shanti Residency, Satellite, Ahmedabad - 380015',
                description: 'Well-maintained 2BHK flat in prime location',
                location: {
                    type: 'Point',
                    coordinates: [72.5714, 23.0225]
                },
                isAvailable: true
            }
        ];

        // Clear existing properties for Pro Partner
        await Property.deleteMany({ owner: proPartner._id });
        console.log('Cleared existing properties');

        // Create properties
        const createdProperties = await Property.insertMany(properties);
        console.log(`✓ Created ${createdProperties.length} properties`);

        console.log('\n=== Creating Sample Leads ===');

        // Clear existing leads
        await Lead.deleteMany({ owner: proPartner._id });

        // Create leads for some properties
        const leads = [
            {
                property: createdProperties[0]._id,
                tenant: eliteMember._id,
                owner: proPartner._id,
                budget: 50000,
                moveInDate: new Date('2024-04-01'),
                familyType: 'family',
                jobType: 'working',
                tenantNotes: 'Very interested in this property. Please share contact details.',
                status: 'new',
                priority: 'hot'
            },
            {
                property: createdProperties[1]._id,
                tenant: eliteMember._id,
                owner: proPartner._id,
                budget: 30000,
                moveInDate: new Date('2024-03-15'),
                familyType: 'bachelor',
                jobType: 'business',
                tenantNotes: 'Looking for a shop in this area. Please contact.',
                status: 'new',
                priority: 'warm'
            },
            {
                property: createdProperties[3]._id,
                tenant: eliteMember._id,
                owner: proPartner._id,
                budget: 10000,
                moveInDate: new Date('2024-03-01'),
                familyType: 'bachelor',
                jobType: 'student',
                tenantNotes: 'Need PG accommodation urgently.',
                status: 'contacted',
                priority: 'hot',
                contactUnlocked: true,
                ownerResponded: true,
                respondedAt: new Date()
            }
        ];

        const createdLeads = await Lead.insertMany(leads);
        console.log(`✓ Created ${createdLeads.length} leads`);

        console.log('\n=== Creating Sample Notifications ===');

        // Clear existing notifications
        await Notification.deleteMany({ recipient: { $in: [proPartner._id, eliteMember._id] } });

        // Create notifications
        const notifications = [
            {
                recipient: proPartner._id,
                sender: eliteMember._id,
                type: 'property_liked',
                priority: 'medium',
                title: 'Property Liked',
                body: 'Someone liked your property listing',
                data: {
                    propertyId: createdProperties[0]._id
                },
                isRead: false
            },
            {
                recipient: eliteMember._id,
                sender: proPartner._id,
                type: 'owner_replied',
                priority: 'high',
                title: 'Owner Responded',
                body: 'The property owner has responded to your inquiry',
                data: {
                    propertyId: createdProperties[3]._id,
                    leadId: createdLeads[2]._id
                },
                isRead: false
            }
        ];

        const createdNotifications = await Notification.insertMany(notifications);
        console.log(`✓ Created ${createdNotifications.length} notifications`);

        console.log('\n=== Sample Data Created Successfully ===');
        console.log(`Properties: ${createdProperties.length}`);
        console.log(`Leads: ${createdLeads.length}`);
        console.log(`Notifications: ${createdNotifications.length}`);
        console.log('\nYou can now run the E2E tests with real data!');

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

createSampleData();
