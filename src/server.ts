import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db'; 
import { routes } from "./routes/routes"; 

class ChatServer {
    private app: express.Application;
    private server: http.Server;
    private io: Server;

    constructor() {
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = new Server(this.server, { /* options */ });
        
        // Load environment variables
        dotenv.config();

        // Connect to the database
        connectDB();
    }

    private middlewares() {
        // Middleware
        this.app.use(express.json());
        // Setup CORS
        const corsOptions = {
            origin: process.env.CORS_ORIGIN || "http://localhost:5173",
            methods: ["GET", "POST", "PUT", "DELETE"],
        };
        this.app.use(cors(corsOptions));
    }
    
    private routes() {
        // Routes for controllers 
        this.app.use('/api', routes);
    }

    private sockets() {
        // Socket.IO connection handling
        this.io.on('connection', (socket) => {
            console.log('A user connected:', socket.id);

            socket.on('disconnect', () => {
                console.log('User disconnected:', socket.id);
            });
            
            // We will add our custom events here in later phases
        });
    }
    
    public listen() {
        const port = process.env.PORT || 5000;
        this.server.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    }

    public run() {
      this.middlewares();
      this.routes();
      this.sockets();
      this.listen();
    }
}

// Create a new instance of ChatServer and start it
const server: ChatServer = new ChatServer();
server.run();


