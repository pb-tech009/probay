#!/bin/bash

# EC2 FFmpeg Installation Script
# Run this on your EC2 instance to enable video compression

echo "🎬 Installing FFmpeg on EC2..."

# Update package list
sudo apt update

# Install FFmpeg
sudo apt install -y ffmpeg

# Verify installation
if command -v ffmpeg &> /dev/null; then
    echo "✅ FFmpeg installed successfully!"
    ffmpeg -version | head -n 1
else
    echo "❌ FFmpeg installation failed"
    exit 1
fi

# Test compression with a sample command
echo ""
echo "📝 FFmpeg is ready for video compression!"
echo "Sample compression command:"
echo "ffmpeg -i input.mp4 -vcodec libx264 -crf 28 -preset ultrafast -vf \"scale=-2:720\" -r 30 -acodec aac output.mp4"

echo ""
echo "✅ Setup complete! Backend will now automatically compress uploaded videos."
