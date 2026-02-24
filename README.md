# PropBay - Premium Property Booking Platform

A full-stack property booking application with React Native mobile app and Node.js backend.

## 🚀 Features

### For Pro Partners (Property Owners)
- ✅ Post unlimited luxury properties
- ✅ Lead management dashboard
- ✅ Real-time notifications
- ✅ Property analytics
- ✅ Direct tenant communication
- ✅ Property expiry & repost system

### For Elite Members (Tenants)
- ✅ Browse premium properties
- ✅ Advanced search & filters
- ✅ Save favorite properties
- ✅ Request contact information
- ✅ Property reviews & ratings
- ✅ WhatsApp notifications

### Authentication & Security
- ✅ WhatsApp OTP verification
- ✅ Role-based access control
- ✅ JWT token authentication (90-day expiry)
- ✅ Secure API endpoints

### Notifications
- ✅ In-app notifications
- ✅ WhatsApp OTP messages
- ✅ Push notifications (Firebase)
- ✅ Real-time updates

---

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js 20.x
- **Framework:** Express.js
- **Database:** MongoDB
- **Authentication:** JWT
- **File Upload:** Multer
- **Process Manager:** PM2
- **Notifications:** Firebase Admin SDK
- **WhatsApp API:** Shree Balaji Message

### Frontend
- **Framework:** React Native (Expo)
- **Language:** TypeScript
- **State Management:** React Query
- **Navigation:** Expo Router
- **UI Components:** Custom components
- **Styling:** StyleSheet API
- **Icons:** Lucide React Native

### DevOps
- **CI/CD:** GitHub Actions
- **Hosting:** AWS EC2
- **Web Server:** Nginx (optional)
- **SSL:** Let's Encrypt (optional)

---

## 📁 Project Structure

```
propertybooking/
├── backend/
│   ├── config/              # Configuration files
│   ├── middleware/          # Auth & validation middleware
│   ├── models/              # MongoDB models
│   ├── routes/              # API routes
│   ├── utils/               # Helper functions
│   ├── uploads/             # Uploaded files
│   ├── index.js             # Entry point
│   └── .env                 # Environment variables
│
├── frontend/
│   ├── app/                 # Expo Router pages
│   │   ├── tabs/           # Tab navigation
│   │   ├── login.tsx       # Login screen
│   │   ├── role-selection.tsx
│   │   └── ...
│   ├── components/          # Reusable components
│   ├── constants/           # Constants & config
│   ├── hooks/               # Custom hooks
│   ├── providers/           # Context providers
│   ├── services/            # API services
│   └── types/               # TypeScript types
│
├── scripts/
│   └── ec2-setup.sh        # EC2 setup script
│
├── .github/
│   └── workflows/
│       └── deploy.yml      # CI/CD workflow
│
├── DEPLOYMENT.md           # Deployment guide
└── README.md              # This file
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20.x
- MongoDB
- Expo CLI
- Git

### Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOL
PORT=5000
MONGODB_URI=mongodb://localhost:27017/property_booking
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development
SMS_API_KEY=your_sms_api_key_here
FIREBASE_PROJECT_ID=propbay-609cf
EOL

# Start MongoDB
mongod

# Start backend
npm start
```

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Update API URL in constants/api.ts
# Change to your backend URL

# Start Expo
npx expo start
```

---

## 🔐 Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/property_booking
JWT_SECRET=your_jwt_secret_here
NODE_ENV=production
SMS_API_KEY=your_whatsapp_api_key
FIREBASE_PROJECT_ID=propbay-609cf
```

### Frontend (constants/api.ts)
```typescript
export const API_BASE_URL = 'http://your-server-ip:5000/api';
```

---

## 📱 Test Accounts

### Test Numbers (OTP: 1111)
- 9054187387 (Pro Partner)
- 7435956074 (Elite Member)
- 8888888888
- 9999999999
- 7777777777
- 6666666666

### Real Numbers
- Any other number will receive WhatsApp OTP
- Random 4-digit OTP generated

---

## 🚀 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy to EC2

```bash
# 1. Setup EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip
curl -o setup.sh https://raw.githubusercontent.com/pb-tech009/probay/main/scripts/ec2-setup.sh
chmod +x setup.sh
sudo ./setup.sh

# 2. Configure GitHub Secrets
# - EC2_HOST
# - EC2_USER
# - EC2_SSH_KEY

# 3. Push to main branch
git push origin main
```

---

## 📊 API Endpoints

### Authentication
- `POST /api/auth/request-otp` - Request OTP
- `POST /api/auth/verify-otp` - Verify OTP & Login
- `POST /api/auth/select-role` - Select user role
- `GET /api/auth/profile` - Get user profile

### Properties
- `GET /api/property` - Get all properties
- `GET /api/property/featured` - Get featured properties
- `POST /api/property/create` - Create property
- `PUT /api/property/update/:id` - Update property
- `DELETE /api/property/delete/:id` - Delete property

### Leads
- `POST /api/leads/create` - Create lead
- `GET /api/leads/broker/my-leads` - Get broker leads
- `PUT /api/leads/accept/:id` - Accept lead
- `PUT /api/leads/reject/:id` - Reject lead

### Notifications
- `GET /api/notifications` - Get notifications
- `GET /api/notifications/unread-count` - Get unread count
- `PUT /api/notifications/read/:id` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read

---

## 🔧 Development

### Backend Development
```bash
cd backend
npm run dev  # with nodemon
```

### Frontend Development
```bash
cd frontend
npx expo start --clear
```

### Database Management
```bash
# Connect to MongoDB
mongosh

# Use database
use property_booking

# View collections
show collections

# Query users
db.users.find()
```

---

## 🐛 Troubleshooting

### Backend Issues
```bash
# Check logs
pm2 logs propbay-backend

# Restart
pm2 restart propbay-backend

# Check MongoDB
sudo systemctl status mongod
```

### Frontend Issues
```bash
# Clear cache
npx expo start --clear

# Reset Metro bundler
npx expo start -c

# Reinstall dependencies
rm -rf node_modules
npm install
```

---

## 📄 License

Private - All rights reserved

---

## 👥 Team

- **Developer:** PropBay Team
- **Repository:** https://github.com/pb-tech009/probay

---

## 📞 Support

For issues or questions:
- GitHub Issues: https://github.com/pb-tech009/probay/issues
- Email: support@propbay.com

---

**Version:** 1.0.0  
**Last Updated:** 2026-02-24
