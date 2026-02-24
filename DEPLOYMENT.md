# PropBay - AWS EC2 Deployment Guide

## 🚀 CI/CD Setup with GitHub Actions

This guide will help you setup automatic deployment to AWS EC2 using GitHub Actions.

---

## 📋 Prerequisites

1. **AWS EC2 Instance**
   - Ubuntu 22.04 LTS
   - Minimum: t2.medium (2 vCPU, 4GB RAM)
   - Security Group: Allow ports 22, 80, 443, 5000

2. **GitHub Repository**
   - Repository: https://github.com/pb-tech009/probay

3. **Required Secrets**
   - EC2 SSH Key
   - EC2 Host IP
   - Environment Variables

---

## 🔧 Step 1: Setup EC2 Instance

### 1.1 Connect to EC2
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

### 1.2 Run Setup Script
```bash
# Download and run setup script
curl -o setup.sh https://raw.githubusercontent.com/pb-tech009/probay/main/scripts/ec2-setup.sh
chmod +x setup.sh
sudo ./setup.sh
```

### 1.3 Configure Environment Variables
```bash
# Edit backend .env file
nano /home/ubuntu/propbay/backend/.env
```

Add your actual values:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/property_booking
JWT_SECRET=your_actual_jwt_secret_here
NODE_ENV=production
SMS_API_KEY=8bf5f9fa-9d32-4762-a318-fdd1ba11080e
FIREBASE_PROJECT_ID=propbay-609cf
```

### 1.4 Add Firebase Service Account Key
```bash
# Create config directory
mkdir -p /home/ubuntu/propbay/backend/config

# Upload your firebase service account key
nano /home/ubuntu/propbay/backend/config/firebase-service-account.json
```

Paste your Firebase service account JSON content.

---

## 🔐 Step 2: Setup GitHub Secrets

Go to: https://github.com/pb-tech009/probay/settings/secrets/actions

Add these secrets:

### 2.1 EC2_HOST
```
Your EC2 public IP or domain
Example: 54.123.45.67
```

### 2.2 EC2_USER
```
ubuntu
```

### 2.3 EC2_SSH_KEY
```
Your EC2 private key content (.pem file)
Copy entire content including:
-----BEGIN RSA PRIVATE KEY-----
...
-----END RSA PRIVATE KEY-----
```

---

## 🔑 Step 3: Setup SSH Key for GitHub

### 3.1 Generate SSH Key on EC2
```bash
ssh-keygen -t ed25519 -C "github-deploy"
cat ~/.ssh/id_ed25519.pub
```

### 3.2 Add Deploy Key to GitHub
1. Go to: https://github.com/pb-tech009/probay/settings/keys
2. Click "Add deploy key"
3. Paste the public key
4. Check "Allow write access"
5. Save

### 3.3 Test Git Access
```bash
cd /home/ubuntu/propbay
git pull origin main
```

---

## 🚀 Step 4: Test Deployment

### 4.1 Manual Test
```bash
cd /home/ubuntu/propbay
git pull origin main
cd backend
npm install
pm2 restart propbay-backend
```

### 4.2 Check Status
```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs propbay-backend

# Check if backend is running
curl http://localhost:5000/api/health
```

---

## 🔄 Step 5: Trigger CI/CD

### 5.1 Automatic Deployment
Any push to `main` branch will trigger automatic deployment:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

### 5.2 Manual Deployment
Go to: https://github.com/pb-tech009/probay/actions
- Click "Deploy to AWS EC2"
- Click "Run workflow"
- Select branch: main
- Click "Run workflow"

---

## 📊 Monitoring & Logs

### Backend Logs
```bash
# View live logs
pm2 logs propbay-backend

# View last 100 lines
pm2 logs propbay-backend --lines 100

# Clear logs
pm2 flush
```

### System Monitoring
```bash
# PM2 monitoring
pm2 monit

# System resources
htop

# Disk usage
df -h

# MongoDB status
sudo systemctl status mongod
```

---

## 🔧 Troubleshooting

### Backend Not Starting
```bash
# Check logs
pm2 logs propbay-backend

# Restart
pm2 restart propbay-backend

# Delete and restart
pm2 delete propbay-backend
cd /home/ubuntu/propbay/backend
pm2 start index.js --name propbay-backend
```

### MongoDB Issues
```bash
# Check status
sudo systemctl status mongod

# Restart
sudo systemctl restart mongod

# View logs
sudo journalctl -u mongod -f
```

### Port Already in Use
```bash
# Find process using port 5000
sudo lsof -i :5000

# Kill process
sudo kill -9 <PID>

# Restart backend
pm2 restart propbay-backend
```

### Deployment Failed
```bash
# Check GitHub Actions logs
# Go to: https://github.com/pb-tech009/probay/actions

# SSH to EC2 and check
ssh -i your-key.pem ubuntu@your-ec2-ip
cd /home/ubuntu/propbay
git status
git pull origin main
```

---

## 🔒 Security Best Practices

1. **Never commit sensitive files:**
   - `.env` files
   - Firebase service account keys
   - SSH private keys

2. **Use GitHub Secrets for:**
   - API keys
   - Database credentials
   - SSH keys

3. **Enable Firewall:**
   ```bash
   sudo ufw status
   sudo ufw enable
   ```

4. **Setup SSL Certificate:**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

5. **Regular Updates:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

---

## 📱 Mobile App Configuration

Update API URL in mobile app:

**Frontend: `frontend/constants/api.ts`**
```typescript
export const API_BASE_URL = 'http://your-ec2-ip:5000/api';
// or with domain:
export const API_BASE_URL = 'https://api.your-domain.com/api';
```

---

## 🎯 Production Checklist

- [ ] EC2 instance setup complete
- [ ] MongoDB installed and running
- [ ] Backend running with PM2
- [ ] GitHub secrets configured
- [ ] SSH deploy key added
- [ ] Firewall configured
- [ ] Nginx configured (optional)
- [ ] SSL certificate installed (optional)
- [ ] Environment variables set
- [ ] Firebase service account key uploaded
- [ ] CI/CD pipeline tested
- [ ] Mobile app API URL updated

---

## 📞 Support

For issues or questions:
- GitHub Issues: https://github.com/pb-tech009/probay/issues
- Check logs: `pm2 logs propbay-backend`
- System status: `pm2 status`

---

## 🔄 Deployment Flow

```
Developer Push to GitHub
         ↓
GitHub Actions Triggered
         ↓
Build & Test Code
         ↓
SSH to EC2 Instance
         ↓
Pull Latest Code
         ↓
Install Dependencies
         ↓
Restart Backend (PM2)
         ↓
✅ Deployment Complete
```

---

**Last Updated:** 2026-02-24
**Version:** 1.0.0
