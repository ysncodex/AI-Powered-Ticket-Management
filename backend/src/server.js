import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import { createServer } from 'http';
import { Server } from 'socket.io';

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';
import userRoutes from './routes/userRoutes.js';
import Ticket from './models/Ticket.js';
import { requestLogger } from './middlewares/loggerMiddleware.js';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// ✅ Create ONE HTTP server wrapping Express
const httpServer = createServer(app);

// ✅ Setup Socket.IO on that exact server
const io = new Server(httpServer, {
  cors: {
    origin: 'https://ai-powered-ticket.netlify.app',
    credentials: true,
  },
});

// 🔐 WebSocket Authentication Middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error('No authentication token provided'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    next();
  } catch (error) {
    next(new Error('Invalid token'));
  }
});

// 🔒 WebSocket Connection Handler with Authorization
io.on('connection', (socket) => {
  console.log(`Authenticated user ${socket.userId} connected via WebSocket`);

  socket.on('join_ticket', async (ticketId) => {
    try {
      const ticket = await Ticket.findById(ticketId);
      if (!ticket) {
        socket.emit('error', 'Ticket not found');
        return;
      }

      // Get user from database to check role
      const User = (await import('./../models/User.js')).default;
      const user = await User.findById(socket.userId);

      // Authorization:
      // - Customers can only access their own tickets
      // - Agents and Admins can access all tickets
      const isCustomer = ticket.customerId.toString() === socket.userId.toString();
      const isAuthorized = user?.role === 'Agent' || user?.role === 'Admin' || isCustomer;

      if (!isAuthorized) {
        socket.emit('error', 'Unauthorized to access this ticket');
        return;
      }

      socket.join(ticketId);
      console.log(`User ${socket.userId} (${user?.role}) joined ticket room: ${ticketId}`);
    } catch (error) {
      console.error('Error joining ticket room:', error);
      socket.emit('error', 'Failed to join ticket room');
    }
  });

  socket.on('disconnect', () => {
    console.log(`User ${socket.userId} disconnected`);
  });
});

// --- Middlewares ---
app.use(helmet());
app.use(
  cors({
    origin: 'https://ai-powered-ticket.netlify.app',
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// ✅ Add request logging middleware
app.use(requestLogger);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ✅ Inject io into req object BEFORE routes are called
app.use((req, res, next) => {
  req.io = io;
  next();
});

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.send('AI-POWERED Ticket Management API is running...');
});

// ✅ Listen on the httpServer (which includes both Express and Socket.IO)
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
