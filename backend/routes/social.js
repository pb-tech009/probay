const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Follow a user/owner
router.post('/follow/:id', auth, async (req, res) => {
    try {
        const targetUser = await User.findById(req.params.id);
        const currentUser = await User.findById(req.user.id);

        if (!targetUser) return res.status(404).json({ msg: 'User not found' });
        if (targetUser._id.toString() === currentUser._id.toString()) return res.status(400).json({ msg: 'You cannot follow yourself' });

        if (!currentUser.following.includes(req.params.id)) {
            currentUser.following.push(req.params.id);
            targetUser.followers.push(req.user.id);
            await currentUser.save();
            await targetUser.save();
            res.json({ msg: 'Followed successfully' });
        } else {
            // Unfollow
            currentUser.following = currentUser.following.filter(id => id.toString() !== req.params.id);
            targetUser.followers = targetUser.followers.filter(id => id.toString() !== req.user.id);
            await currentUser.save();
            await targetUser.save();
            res.json({ msg: 'Unfollowed successfully' });
        }
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// Get Following/Followers
router.get('/social-stats', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate('followers', 'name profileImage phoneNumber')
            .populate('following', 'name profileImage phoneNumber');
        res.json({
            followers: user.followers,
            following: user.following
        });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

module.exports = router;
