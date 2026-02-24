require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const morgan = require('morgan');
const fs = require('fs');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const helmet = require('helmet');

// Env Validation
const requiredEnv = ['MONGODB_URI', 'JWT_SECRET'];
requiredEnv.forEach(env => {
    if (!process.env[env]) {
        console.error(`FATAL ERROR: ${env} is not defined in .env file.`);
        process.exit(1);
    }
});

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow images to be loaded cross-origin
    contentSecurityPolicy: false, // Disable CSP for now as it's a mobile app API
}));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(mongoSanitize());
app.use(xss());
app.use('/uploads', express.static(uploadsDir));

// DB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => {
        console.error('MongoDB Connection Error:', err);
        process.exit(1);
    });

// Initialize Firebase
const { initializeFirebase } = require('./utils/firebase');
initializeFirebase();

// Socket.io for Real-time Chat
io.on('connection', (socket) => {
    socket.on('join_chat', (data) => {
        if (data.chatId) socket.join(data.chatId);
    });

    socket.on('send_message', async (data, callback) => {
        const { chatId, senderId, receiverId, text } = data;

        try {
            const Chat = require('./models/Chat');
            const updatedChat = await Chat.findByIdAndUpdate(chatId, {
                $push: { messages: { sender: senderId, receiver: receiverId, text } },
                lastMessage: { text, sender: senderId, createdAt: new Date() }
            }, { new: true });

            if (!updatedChat) {
                if (callback) callback({ status: 'error', msg: 'Chat not found' });
                return;
            }

            io.to(chatId).emit('receive_message', data);
            if (callback) callback({ status: 'ok' });
        } catch (err) {
            console.error("Socket Error:", err);
            if (callback) callback({ status: 'error', msg: err.message });
        }
    });

    socket.on('disconnect', () => { });
});

// Routes Placeholder
app.get('/', (req, res) => {
    res.send('Property Booking API is running...');
});

// Import Routes
const authRoutes = require('./routes/auth');
const propertyRoutes = require('./routes/property');
const chatRoutes = require('./routes/chat');
const socialRoutes = require('./routes/social');
const offerRoutes = require('./routes/offer');
const visitRoutes = require('./routes/visit');
const notificationRoutes = require('./routes/notification');
const leadRoutes = require('./routes/lead');
const brokerRoutes = require('./routes/broker');
const reminderRoutes = require('./routes/reminder');
const savedSearchRoutes = require('./routes/savedSearch');
const verificationRoutes = require('./routes/verification');
const marketDataRoutes = require('./routes/marketData');

app.use('/api/auth', authRoutes);
app.use('/api/property', propertyRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/broker', brokerRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/saved-searches', savedSearchRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/market-data', marketDataRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ msg: err.message || 'Something went wrong on the server' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
