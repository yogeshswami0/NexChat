const Message = require('../models/Message');
const User = require('../models/User');

let onlineUsers = {}; 

module.exports = (io) => {
    io.on('connection', (socket) => {
        
        // When a user logs in and registers their socket
        socket.on("register_user", async (username) => {
            onlineUsers[username] = socket.id;
            await User.findOneAndUpdate({ username }, { lastSeen: new Date() });
            
            const allUsers = await User.find({}, 'username avatar lastSeen');
            const userListWithStatus = allUsers.map(u => ({
                username: u.username,
                avatar: u.avatar,
                lastSeen: u.lastSeen,
                isOnline: !!onlineUsers[u.username]
            }));
            io.emit("get_user_list", userListWithStatus);
        });

        // Handling private messages
        socket.on("send_message", async (data) => {
            try {
                const newMessage = new Message(data);
                const savedMessage = await newMessage.save();

                // Send to receiver if online
                if (data.receiver && onlineUsers[data.receiver]) {
                    io.to(onlineUsers[data.receiver]).emit("receive_message", savedMessage);
                }
                // Send back to sender for UI confirmation
                socket.emit("receive_message", savedMessage);
            } catch (err) {
                console.error("Socket error:", err);
            }
        });

        // Handling emoji reactions
        socket.on("add_reaction", async ({ messageId, emoji, username }) => {
            try {
                const msg = await Message.findById(messageId);
                msg.reactions = msg.reactions.filter(r => r.user !== username);
                msg.reactions.push({ user: username, emoji });
                await msg.save();
                
                io.emit("reaction_updated", { messageId, reactions: msg.reactions });
            } catch (err) { console.error(err); }
        });

        // Edit a message
        socket.on('edit_message', async ({ messageId, text, username }) => {
            try {
                const msg = await Message.findById(messageId);
                if (!msg) return;
                // only sender can edit
                if (msg.sender !== username) return;
                msg.text = text;
                await msg.save();
                io.emit('message_edited', { messageId, text });
            } catch (err) { console.error('edit_message error', err); }
        });

        // Delete a message
        socket.on('delete_message', async ({ messageId, username }) => {
            try {
                const msg = await Message.findById(messageId);
                if (!msg) return;
                // only sender can delete
                if (msg.sender !== username) return;
                await Message.deleteOne({ _id: messageId });
                io.emit('message_deleted', { messageId });
            } catch (err) { console.error('delete_message error', err); }
        });

        // User Disconnect
        socket.on('disconnect', () => {
            for (let user in onlineUsers) {
                if (onlineUsers[user] === socket.id) {
                    delete onlineUsers[user];
                    break;
                }
            }
            // Notify others that a user went offline
            io.emit("user_offline", { onlineUsers });
        });
    });
};