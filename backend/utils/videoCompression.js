/**
 * Video Compression Utility
 * Compresses uploaded videos using FFmpeg
 * Reduces file size while maintaining quality
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');

const execPromise = util.promisify(exec);

/**
 * Compress video using FFmpeg
 * @param {String} inputPath - Path to input video
 * @param {String} outputPath - Path to save compressed video (optional)
 * @returns {Promise<String>} Path to compressed video
 */
async function compressVideo(inputPath, outputPath = null) {
    try {
        // Check if FFmpeg is installed
        try {
            await execPromise('ffmpeg -version');
        } catch (error) {
            console.error('FFmpeg not installed. Skipping compression.');
            return inputPath; // Return original if FFmpeg not available
        }

        // Generate output path if not provided
        if (!outputPath) {
            const dir = path.dirname(inputPath);
            const ext = path.extname(inputPath);
            const basename = path.basename(inputPath, ext);
            outputPath = path.join(dir, `${basename}_compressed${ext}`);
        }

        // FFmpeg compression command
        // - 720p resolution (mobile-friendly)
        // - CRF 28 (good quality/size balance)
        // - Ultrafast preset (quick compression)
        // - 30fps (smooth playback)
        const command = `ffmpeg -i "${inputPath}" -vcodec libx264 -crf 28 -preset ultrafast -vf "scale=-2:720" -r 30 -acodec aac -strict experimental "${outputPath}" -y`;

        console.log('🎬 Starting video compression...');
        console.log(`Input: ${inputPath}`);
        console.log(`Output: ${outputPath}`);

        // Execute compression
        const { stdout, stderr } = await execPromise(command);

        // Check if output file exists
        if (!fs.existsSync(outputPath)) {
            throw new Error('Compression failed - output file not created');
        }

        // Get file sizes
        const inputSize = fs.statSync(inputPath).size;
        const outputSize = fs.statSync(outputPath).size;
        const compressionRatio = ((1 - outputSize / inputSize) * 100).toFixed(1);

        console.log('✅ Video compression successful!');
        console.log(`Original size: ${(inputSize / 1024 / 1024).toFixed(2)} MB`);
        console.log(`Compressed size: ${(outputSize / 1024 / 1024).toFixed(2)} MB`);
        console.log(`Compression: ${compressionRatio}% reduction`);

        // Delete original file
        try {
            fs.unlinkSync(inputPath);
            console.log('🗑️ Original video deleted');
        } catch (err) {
            console.error('Failed to delete original video:', err);
        }

        return outputPath;
    } catch (error) {
        console.error('Video compression error:', error);
        // Return original path if compression fails
        return inputPath;
    }
}

/**
 * Compress video in background (non-blocking)
 * @param {String} inputPath - Path to input video
 * @param {Function} callback - Callback function (optional)
 */
function compressVideoAsync(inputPath, callback = null) {
    compressVideo(inputPath)
        .then(outputPath => {
            console.log('Background compression completed:', outputPath);
            if (callback) callback(null, outputPath);
        })
        .catch(error => {
            console.error('Background compression failed:', error);
            if (callback) callback(error, null);
        });
}

/**
 * Get video duration using FFprobe
 * @param {String} videoPath - Path to video file
 * @returns {Promise<Number>} Duration in seconds
 */
async function getVideoDuration(videoPath) {
    try {
        const command = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${videoPath}"`;
        const { stdout } = await execPromise(command);
        return parseFloat(stdout.trim());
    } catch (error) {
        console.error('Failed to get video duration:', error);
        return 0;
    }
}

/**
 * Check if video is within acceptable limits
 * @param {String} videoPath - Path to video file
 * @returns {Promise<Object>} Validation result
 */
async function validateVideo(videoPath) {
    try {
        const stats = fs.statSync(videoPath);
        const sizeInMB = stats.size / 1024 / 1024;
        const duration = await getVideoDuration(videoPath);

        return {
            valid: sizeInMB <= 100 && duration <= 60, // Max 100MB, 60 seconds
            size: sizeInMB,
            duration: duration,
            message: sizeInMB > 100 
                ? 'Video size exceeds 100MB' 
                : duration > 60 
                ? 'Video duration exceeds 60 seconds' 
                : 'Video is valid'
        };
    } catch (error) {
        return {
            valid: false,
            message: 'Failed to validate video'
        };
    }
}

module.exports = {
    compressVideo,
    compressVideoAsync,
    getVideoDuration,
    validateVideo
};
