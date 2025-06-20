const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Store active users and rooms
const users = {};
const rooms = {};

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Handle user joining
    socket.on('join', (data) => {
        const { username, room } = data;
        
        // Store user info
        users[socket.id] = { username, room };
        
        // Join the room
        socket.join(room);
        
        // Initialize room if it doesn't exist
        if (!rooms[room]) {
            rooms[room] = new Set();
        }
        rooms[room].add(socket.id);
        
        // Notify room about new user
        socket.to(room).emit('user joined', {
            username,
            message: `${username} joined the room`,
            timestamp: new Date().toLocaleTimeString()
        });
        
        // Send welcome message to user
        socket.emit('message', {
            username: 'System',
            message: `Welcome to ${room} room!`,
            timestamp: new Date().toLocaleTimeString()
        });
        
        // Update room users count
        io.to(room).emit('room users', rooms[room].size);
    });

    // Handle chat messages
    socket.on('chat message', (data) => {
        const user = users[socket.id];
        if (user) {
            const messageData = {
                username: user.username,
                message: data.message,
                timestamp: new Date().toLocaleTimeString()
            };
            
            // Send message to all users in the room
            io.to(user.room).emit('message', messageData);
        }
    });

    // Handle room switching
    socket.on('switch room', (newRoom) => {
        const user = users[socket.id];
        if (user) {
            const oldRoom = user.room;
            
            // Leave old room
            socket.leave(oldRoom);
            if (rooms[oldRoom]) {
                rooms[oldRoom].delete(socket.id);
                socket.to(oldRoom).emit('user left', {
                    username: user.username,
                    message: `${user.username} left the room`,
                    timestamp: new Date().toLocaleTimeString()
                });
                io.to(oldRoom).emit('room users', rooms[oldRoom].size);
            }
            
            // Join new room
            socket.join(newRoom);
            user.room = newRoom;
            
            if (!rooms[newRoom]) {
                rooms[newRoom] = new Set();
            }
            rooms[newRoom].add(socket.id);
            
            // Notify new room
            socket.to(newRoom).emit('user joined', {
                username: user.username,
                message: `${user.username} joined the room`,
                timestamp: new Date().toLocaleTimeString()
            });
            
            // Send confirmation to user
            socket.emit('message', {
                username: 'System',
                message: `You switched to ${newRoom} room`,
                timestamp: new Date().toLocaleTimeString()
            });
            
            // Update users count
            io.to(newRoom).emit('room users', rooms[newRoom].size);
        }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        const user = users[socket.id];
        if (user) {
            // Remove from room
            if (rooms[user.room]) {
                rooms[user.room].delete(socket.id);
                
                // Notify room about user leaving
                socket.to(user.room).emit('user left', {
                    username: user.username,
                    message: `${user.username} left the room`,
                    timestamp: new Date().toLocaleTimeString()
                });
                
                // Update users count
                io.to(user.room).emit('room users', rooms[user.room].size);
            }
            
            // Remove user
            delete users[socket.id];
        }
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} in your browser`);
});