/**
 * Optimized Avinci Backend Server
 * Features: Fast startup, efficient middleware, optimized routes, caching
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const http = require('http');
const socketIO = require('socket.io');
const compression = require('compression');
const helmet = require('helmet');
const { createTables, redis } = require('./models/database');
const { auth, cors: corsMiddleware, errorHandler, requestLogger, rateLimit } = require('./middleware/auth');
require('dotenv').config();

// Environment configuration
const PORT = process.env.PORT || 9001;
const NODE_ENV = process.env.NODE_ENV || 'development';
const isProduction = NODE_ENV === 'production';

// Disable SSL verification for ElevenLabs API compatibility
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const app = express();
const server = http.createServer(app);

// Socket.IO configuration with optimized settings
const io = socketIO(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:9000',
        methods: ['GET', 'POST']
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000
});

// Security middleware
if (isProduction) {
    app.use(helmet({
        contentSecurityPolicy: false, // Disable for development
        crossOriginEmbedderPolicy: false
    }));
}

// Compression middleware for better performance
app.use(compression());

// CORS middleware
app.use(corsMiddleware);

// Request logging (only in development)
if (!isProduction) {
    app.use(requestLogger);
}

// Rate limiting
app.use(rateLimit);

// Body parsing middleware with size limits
app.use(express.json({ 
    limit: '10mb',
    verify: (req, res, buf) => {
        // Store raw body for webhook verification if needed
        req.rawBody = buf;
    }
}));
app.use(express.urlencoded({ 
    extended: true, 
    limit: '10mb' 
}));

// Create upload directories efficiently
const uploadDirs = ['uploads', 'uploads/ui', 'uploads/audio', 'uploads/audio/sessions'];
uploadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Optimized multer configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/ui/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 10 // Max 10 files per request
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|pdf|mp3|wav|m4a/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files (PNG, JPG, JPEG), PDF files, and audio files (MP3, WAV, M4A) are allowed'));
        }
    }
});

// Serve static files with caching
app.use('/uploads', express.static('uploads', {
    maxAge: isProduction ? '1d' : 0,
    etag: true,
    lastModified: true
}));

// Health check endpoint (no middleware)
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage()
    });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    socket.on('join-call', (data) => {
        const callId = typeof data === 'string' ? data : data.callId;
        const roomName = typeof data === 'object' && data.roomName ? data.roomName : `call-${callId}`;
        
        socket.join(roomName);
        console.log(`🔌 Socket ${socket.id} joined room: ${roomName}`);
        socket.to(roomName).emit('user-joined', { socketId: socket.id });
    });

    socket.on('agent-response', (data) => {
        const { callId, audioUrl, responseText, agentName, delay = 0 } = data;
        const roomName = `call-${callId}`;
        
        setTimeout(() => {
            socket.to(roomName).emit('agent-audio-response', {
                audioUrl,
                responseText,
                agentName,
                timestamp: new Date().toISOString()
            });
        }, delay);
    });

    socket.on('disconnect', () => {
        console.log(`🔌 Client disconnected: ${socket.id}`);
    });
});

// API Routes - Organized by functionality
// Core routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/personas', require('./routes/personas'));
app.use('/api/personas/v2', require('./routes/personas_v2'));
app.use('/api/agents', require('./routes/agents'));
app.use('/api/agents/v5', require('./routes/agents_v5'));

// AI and Chat routes
app.use('/api/ai', require('./routes/aiChat'));
app.use('/api/ai', require('./routes/parallelChat'));
app.use('/api/enhanced-chat', require('./routes/enhancedChat'));
app.use('/api/chat', require('./routes/chat'));

// Utility routes
app.use('/api/upload', upload.single('file'), require('./routes/upload'));
app.use('/api/transcript-upload', require('./routes/transcriptUpload'));
app.use('/api/generate', require('./routes/generate'));
app.use('/api/debug', require('./routes/debug'));

// Research and Analytics
app.use('/api/research-agents', require('./routes/agentsForResearch'));
app.use('/api/sessions', require('./routes/sessions'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/design-feedback', require('./routes/designFeedback'));

// Product Management
app.use('/api/products', require('./routes/products'));
app.use('/api/prds', require('./routes/prds'));

// Voice calls
app.use('/api/call', require('./routes/calls'));

// Test routes (development only)
if (!isProduction) {
    app.use('/api/simple-test', require('./routes/simpleTest'));
    app.use('/api/test-persona', require('./routes/testPersona'));
}

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ 
        error: 'Route not found',
        path: req.originalUrl,
        method: req.method
    });
});

// Global error handler
app.use(errorHandler);

// Graceful shutdown handling
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('✅ Process terminated');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('🛑 SIGINT received, shutting down gracefully');
    server.close(() => {
        console.log('✅ Process terminated');
        process.exit(0);
    });
});

// Start server
async function startServer() {
    try {
        console.log('🚀 Starting Avinci Backend Server...');
        
        // Initialize database
        await createTables();
        console.log('✅ Database tables initialized');

        // Connect to Redis
        if (!redis.isOpen) {
            await redis.connect();
            console.log('⚡ Redis connected');
        }

        // Start HTTP server
        server.listen(PORT, () => {
            console.log(`🎉 Avinci Backend is running!`);
            console.log(`   Environment: ${NODE_ENV}`);
            console.log(`   Port: ${PORT}`);
            console.log(`   Health: http://localhost:${PORT}/api/health`);
            console.log(`   Socket.IO: Real-time features enabled`);
            console.log(`   Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

startServer();

module.exports = { app, server, io };



