const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect("mongodb://localhost:27017/chat-app");
        console.log("✅ MongoDB Connected");
    } catch (err) {
        console.error("❌ MongoDB Error:", err.message);
        console.warn('Continuing without DB connection — some features will be disabled. To run fully, start MongoDB or set correct connection.');
        // Do not exit process; allow server to run for UI/dev purposes.
    }
};

module.exports = connectDB;