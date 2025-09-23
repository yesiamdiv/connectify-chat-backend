import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';

// Load environment variables
dotenv.config();

// Connect to the database
connectDB();

const app = express();
const server = http.createServer(app);

// Setup CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
};
app.use(cors(corsOptions));

// Initialize Socket.IO
const io = new Server(server, {
  cors: corsOptions,
});

// Middleware
app.use(express.json());

// Basic route for testing
app.get('/', (req, res) => {
  res.send('Server is running...');
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });

  // We will add our custom events here in later phases
});


const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
