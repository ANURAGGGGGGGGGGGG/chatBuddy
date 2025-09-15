const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local', override: true });

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;
const socketPort = process.env.SOCKET_IO_PORT || 3001;

// Initialize Next.js
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// MongoDB connection
const connectDB = async () => {
  try {
    if (mongoose.connections[0].readyState) {
      return;
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for Socket.IO server');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};

// Socket.IO authentication middleware
const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET);
    socket.userId = decoded.sub;
    socket.userEmail = decoded.email;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
};

app.prepare().then(() => {
  // Create HTTP server
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Create Socket.IO server
  const io = new Server(server, {
    cors: {
      origin: process.env.NEXTAUTH_URL || `http://localhost:${port}`,
      methods: ['GET', 'POST'],
      credentials: true
    },
    path: '/socket.io/'
  });

  // Use authentication middleware
  io.use(authenticateSocket);

  // Store active users
  const activeUsers = new Map();
  const userRooms = new Map();

  io.on('connection', async (socket) => {
    console.log(`User ${socket.userEmail} connected`);
    
    await connectDB();
    
    // Store user connection
    activeUsers.set(socket.userId, {
      socketId: socket.id,
      email: socket.userEmail,
      lastSeen: new Date()
    });

    // Handle joining rooms
    socket.on('join-room', (roomId) => {
      socket.join(roomId);
      
      // Track user rooms
      if (!userRooms.has(socket.userId)) {
        userRooms.set(socket.userId, new Set());
      }
      userRooms.get(socket.userId).add(roomId);
      
      console.log(`User ${socket.userEmail} joined room ${roomId}`);
      
      // Notify others in the room that user is online
      socket.to(roomId).emit('user-online', {
        userId: socket.userId,
        email: socket.userEmail
      });
    });

    // Handle leaving rooms
    socket.on('leave-room', (roomId) => {
      socket.leave(roomId);
      
      if (userRooms.has(socket.userId)) {
        userRooms.get(socket.userId).delete(roomId);
      }
      
      console.log(`User ${socket.userEmail} left room ${roomId}`);
      
      // Notify others in the room that user left
      socket.to(roomId).emit('user-offline', {
        userId: socket.userId,
        email: socket.userEmail
      });
    });

    // Handle new messages
    socket.on('send-message', (data) => {
      const { roomId, message } = data;
      
      // Broadcast message to all users in the room except sender
      socket.to(roomId).emit('new-message', {
        ...message,
        timestamp: new Date()
      });
      
      console.log(`Message sent in room ${roomId} by ${socket.userEmail}`);
    });

    // Handle typing indicators
    socket.on('typing-start', (data) => {
      const { roomId } = data;
      socket.to(roomId).emit('user-typing', {
        userId: socket.userId,
        email: socket.userEmail,
        isTyping: true
      });
    });

    socket.on('typing-stop', (data) => {
      const { roomId } = data;
      socket.to(roomId).emit('user-typing', {
        userId: socket.userId,
        email: socket.userEmail,
        isTyping: false
      });
    });

    // Handle message reactions
    socket.on('message-reaction', (data) => {
      const { roomId, messageId, reaction, action } = data;
      socket.to(roomId).emit('message-reaction-update', {
        messageId,
        reaction,
        action, // 'add' or 'remove'
        userId: socket.userId
      });
    });

    // Handle message read receipts
    socket.on('message-read', (data) => {
      const { roomId, messageIds } = data;
      socket.to(roomId).emit('messages-read', {
        messageIds,
        userId: socket.userId,
        readAt: new Date()
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User ${socket.userEmail} disconnected`);
      
      // Remove user from active users
      activeUsers.delete(socket.userId);
      
      // Notify all rooms that user is offline
      if (userRooms.has(socket.userId)) {
        userRooms.get(socket.userId).forEach(roomId => {
          socket.to(roomId).emit('user-offline', {
            userId: socket.userId,
            email: socket.userEmail,
            lastSeen: new Date()
          });
        });
        userRooms.delete(socket.userId);
      }
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  // Start server
  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> Socket.IO server running on port ${port}`);
  });
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});