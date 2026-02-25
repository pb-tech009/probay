/**
 * Cron Jobs for Automated Tasks
 * - Check expired properties daily
 * - Clean up old files
 */

const cron = require('node-cron');
const Property = require('../models/Property');
const path = require('path');
const fs = require('fs');

/**
 * Check and mark expired properties
 * Runs daily at 12:00 AM
 */
function startExpiryCheckJob() {
    // Run every day at midnight (00:00)
    cron.schedule('0 0 * * *', async () => {
        try {
            console.log('🕐 Running daily expiry check...');
            
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

            console.log(`✅ Expired properties updated: ${result.modifiedCount}`);
        } catch (error) {
            console.error('❌ Expiry check error:', error);
        }
    });

    console.log('✅ Expiry check cron job started (runs daily at 12:00 AM)');
}

/**
 * Optional: Delete expired property files
 * Runs weekly on Sunday at 2:00 AM
 */
function startFileCleanupJob() {
    // Run every Sunday at 2:00 AM
    cron.schedule('0 2 * * 0', async () => {
        try {
            console.log('🗑️ Running weekly file cleanup...');
            
            // Find properties expired for more than 7 days
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            
            const expiredProperties = await Property.find({
                isExpired: true,
                expiresAt: { $lte: sevenDaysAgo }
            });

            let deletedFiles = 0;

            expiredProperties.forEach(property => {
                // Delete video file
                if (property.videoUrl) {
                    const videoPath = path.join(__dirname, '..', property.videoUrl.replace(/^\//, ''));
                    if (fs.existsSync(videoPath)) {
                        fs.unlinkSync(videoPath);
                        deletedFiles++;
                        console.log(`🗑️ Deleted video: ${property.videoUrl}`);
                    }
                }

                // Delete image files
                property.images.forEach(img => {
                    const imgPath = path.join(__dirname, '..', img.replace(/^\//, ''));
                    if (fs.existsSync(imgPath)) {
                        fs.unlinkSync(imgPath);
                        deletedFiles++;
                    }
                });
            });

            console.log(`✅ File cleanup complete: ${deletedFiles} files deleted`);
        } catch (error) {
            console.error('❌ File cleanup error:', error);
        }
    });

    console.log('✅ File cleanup cron job started (runs weekly on Sunday at 2:00 AM)');
}

/**
 * Start all cron jobs
 */
function startAllCronJobs() {
    startExpiryCheckJob();
    // startFileCleanupJob(); // Uncomment to enable file cleanup
}

module.exports = {
    startAllCronJobs,
    startExpiryCheckJob,
    startFileCleanupJob
};
