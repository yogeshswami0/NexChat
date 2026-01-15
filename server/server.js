const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');
const socketHandler = require('./socket/socketHandler');
const path = require('path');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
    cors: { origin: "*" }
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(__dirname + '/public/uploads'));
// Serve client static files for convenience (open http://localhost:3001)
app.use('/', express.static(path.join(__dirname, '..', 'client')));

// Database Connection
connectDB();

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));

// Socket.io Modular Handler
socketHandler(io);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`🚀 NexChat Server running on port ${PORT}`));