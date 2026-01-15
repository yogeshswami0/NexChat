// server/routes/authRoutes.js (Updated)
const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const User = require('../models/User');

router.post('/register', register);
router.post('/login', login);

// NEW: Update Avatar
router.post('/update-avatar', async (req, res) => {
    const { username, avatarUrl } = req.body;
    try {
        await User.findOneAndUpdate({ username }, { avatar: avatarUrl });
        res.json({ message: "Avatar updated" });
    } catch (err) {
        res.status(500).json({ error: "Update failed" });
    }
});

module.exports = router;