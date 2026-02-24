const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const auth = require('../middleware/auth');

// Get all chats for a user
router.get('/my-chats', auth, async (req, res) => {
    try {
        const chats = await Chat.find({
            participants: { $in: [req.user.id] }
        }).populate('participants', 'name profileImage phoneNumber role');
        res.json(chats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get or Create a chat between two users
router.post('/start-chat', auth, async (req, res) => {
    try {
        const { receiverId } = req.body;

        let chat = await Chat.findOne({
            participants: { $all: [req.user.id, receiverId] }
        });

        if (!chat) {
            chat = new Chat({
                participants: [req.user.id, receiverId],
                messages: []
            });
            await chat.save();
        }

        res.json(chat);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get message history for a chat
router.get('/messages/:chatId', auth, async (req, res) => {
    try {
        const chat = await Chat.findById(req.params.chatId)
            .populate('messages.sender', 'name profileImage')
            .populate('messages.receiver', 'name profileImage');

        if (!chat) return res.status(404).json({ msg: 'Chat not found' });

        res.json(chat.messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Send a message
router.post('/send-message/:chatId', auth, async (req, res) => {
    try {
        const { content } = req.body;
        const chatId = req.params.chatId;

        const chat = await Chat.findById(chatId);
        if (!chat) return res.status(404).json({ msg: 'Chat not found' });

        // Check if user is participant
        if (!chat.participants.includes(req.user.id)) {
            return res.status(401).json({ msg: 'Unauthorized' });
        }

        // Find receiver (other participant)
        const receiverId = chat.participants.find(p => p.toString() !== req.user.id);

        const newMessage = {
            sender: req.user.id,
            receiver: receiverId,
            content: content,
            timestamp: new Date(),
            isRead: false
        };

        chat.messages.push(newMessage);
        chat.lastMessage = content;
        chat.lastMessageTime = new Date();
        
        await chat.save();

        // Populate sender info for response
        await chat.populate('messages.sender', 'name profileImage role');
        
        const savedMessage = chat.messages[chat.messages.length - 1];

        res.json(savedMessage);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Mark messages as read
router.put('/mark-read/:chatId', auth, async (req, res) => {
    try {
        const chat = await Chat.findById(req.params.chatId);
        if (!chat) return res.status(404).json({ msg: 'Chat not found' });

        // Mark all messages where current user is receiver as read
        chat.messages.forEach(msg => {
            if (msg.receiver && msg.receiver.toString() === req.user.id) {
                msg.isRead = true;
            }
        });

        await chat.save();
        res.json({ msg: 'Messages marked as read' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
