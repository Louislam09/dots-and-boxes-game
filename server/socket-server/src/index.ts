// server/socket-server/src/index.ts - Main entry point

import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { setupSocketHandlers } from './socket.js';
import { authMiddleware } from './middleware/auth.js';

const PORT = process.env.PORT || 3001;

// Allow all origins in development (ngrok URLs change)
const CORS_ORIGINS = process.env.CORS_ORIGINS?.split(',') || [
  'https://tick-dynamic-trout.ngrok-free.app',
  'http://localhost:8081',
  'http://localhost:19006',
  'http://localhost:8090',
];

// Create Express app
const app = express();
app.use(cors({ origin: CORS_ORIGINS }));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Create HTTP server
const httpServer = createServer(app);

// Create Socket.io server
const io = new Server(httpServer, {
  cors: {
    origin: CORS_ORIGINS,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Apply auth middleware
io.use(authMiddleware);

// Setup socket handlers
setupSocketHandlers(io);

// Start server
httpServer.listen(PORT, () => {
  console.log(`🚀 Socket.io server running on port ${PORT}`);
  console.log(`📡 CORS origins: ${CORS_ORIGINS.join(', ')}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down...');
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

