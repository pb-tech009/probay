#!/bin/bash

# PropBay EC2 Setup Script
# Run this script on your EC2 instance to setup the environment

echo "🚀 Starting PropBay EC2 Setup..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install MongoDB
echo "📦 Installing MongoDB..."
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Install PM2 globally
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Install Git
echo "📦 Installing Git..."
sudo apt install -y git

# Create application directory
echo "📁 Creating application directory..."
mkdir -p /home/ubuntu/propbay
cd /home/ubuntu/propbay

# Clone repository (you'll need to setup SSH key or use HTTPS with token)
echo "📥 Cloning repository..."
git clone https://github.com/pb-tech009/probay.git .

# Setup Backend
echo "🔧 Setting up Backend..."
cd backend
npm install

# Create .env file (you need to add your actual values)
cat > .env << 'EOL'
PORT=5000
MONGODB_URI=mongodb://localhost:27017/property_booking
JWT_SECRET=your_jwt_secret_here
NODE_ENV=production
SMS_API_KEY=your_sms_api_key_here
FIREBASE_PROJECT_ID=propbay-609cf
EOL

echo "⚠️  IMPORTANT: Edit /home/ubuntu/propbay/backend/.env with your actual values!"

# Start Backend with PM2
pm2 start index.js --name propbay-backend
pm2 save
pm2 startup

# Setup Frontend
echo "🔧 Setting up Frontend..."
cd ../frontend
npm install

# Setup Nginx (optional - for serving frontend)
echo "📦 Installing Nginx..."
sudo apt install -y nginx

# Configure Nginx
sudo tee /etc/nginx/sites-available/propbay << 'EOL'
server {
    listen 80;
    server_name your_domain.com;

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Frontend (if serving web version)
    location / {
        root /home/ubuntu/propbay/frontend/dist;
        try_files $uri $uri/ /index.html;
    }
}
EOL

sudo ln -s /etc/nginx/sites-available/propbay /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Setup Firewall
echo "🔒 Configuring firewall..."
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 5000
sudo ufw --force enable

echo "✅ PropBay EC2 Setup Complete!"
echo ""
echo "📝 Next Steps:"
echo "1. Edit /home/ubuntu/propbay/backend/.env with your actual values"
echo "2. Add GitHub SSH key for automatic deployments"
echo "3. Configure your domain in Nginx config"
echo "4. Setup SSL certificate (Let's Encrypt)"
echo ""
echo "🔍 Check Backend Status: pm2 status"
echo "📊 View Backend Logs: pm2 logs propbay-backend"
echo "🔄 Restart Backend: pm2 restart propbay-backend"
