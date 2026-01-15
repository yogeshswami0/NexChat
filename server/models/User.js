const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String, default: "https://via.placeholder.com/50" },
    lastSeen: { type: Date, default: Date.now } // NEW: For "Last seen at..."
});

module.exports = mongoose.model('User', UserSchema);