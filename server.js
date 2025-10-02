const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// In-memory storage (replace with database in production)
const users = new Map();
const rooms = new Map();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Routes
app.post('/api/signup', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }

        if (users.has(username.toLowerCase())) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        users.set(username.toLowerCase(), {
            username,
            password: hashedPassword,
            createdAt: Date.now()
        });

        const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, username });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }

        const user = users.get(username.toLowerCase());
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, username: user.username });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Socket.IO for real-time dice rolling
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-room', ({ roomId, username }) => {
        socket.join(roomId);
        socket.username = username;
        socket.currentRoom = roomId;

        if (!rooms.has(roomId)) {
            rooms.set(roomId, { users: new Set(), rolls: [] });
        }
        rooms.get(roomId).users.add(username);

        // Notify room
        io.to(roomId).emit('user-joined', {
            username,
            users: Array.from(rooms.get(roomId).users)
        });

        // Send recent rolls to new user
        socket.emit('roll-history', rooms.get(roomId).rolls.slice(-20));
    });

    socket.on('roll-dice', ({ roomId, diceType, result, username }) => {
        if (!rooms.has(roomId)) return;

        const rollData = {
            username,
            diceType,
            result,
            timestamp: Date.now()
        };

        rooms.get(roomId).rolls.push(rollData);

        // Keep only last 50 rolls
        if (rooms.get(roomId).rolls.length > 50) {
            rooms.get(roomId).rolls.shift();
        }

        io.to(roomId).emit('dice-rolled', rollData);
    });

    socket.on('disconnect', () => {
        if (socket.currentRoom && socket.username) {
            const room = rooms.get(socket.currentRoom);
            if (room) {
                room.users.delete(socket.username);
                io.to(socket.currentRoom).emit('user-left', {
                    username: socket.username,
                    users: Array.from(room.users)
                });

                // Clean up empty rooms
                if (room.users.size === 0) {
                    rooms.delete(socket.currentRoom);
                }
            }
        }
        console.log('User disconnected:', socket.id);
    });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
