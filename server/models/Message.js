const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    text: String,
    imageUrl: String,
    audioUrl: String,
    fileUrl: String,    // NEW: For PDFs/Docs
    fileName: String,   // NEW: To show the name of the file
    sender: { type: String, required: true },
    receiver: String,
    room: String,
    seen: { type: Boolean, default: false },
    reactions: [        // NEW: Array for emojis
        {
            user: String,
            emoji: String
        }
    ],
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', MessageSchema);