import express, { Request, Response } from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import cors from "cors";
import VideoController from "./controllers/videoController";

const app = express();
app.use(
    cors({
        origin: [
            "http://localhost:3000",
            "https://video-call-app-n4my.vercel.app",
            "https://video-call-app-frontend.netlify.app"
        ],
        credentials: true
    })
);
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: [
            "http://localhost:3000",
            "https://video-call-app-n4my.vercel.app",
            "https://video-call-app-frontend.netlify.app"
        ],
        methods: ["GET", "POST"],
        credentials: true
    },
    transports: ["websocket", "polling"]
});

const videoController = new VideoController(io);

const rooms: Record<string, string[]> = {}; 

app.post("/create-room", (req: Request, res: Response) => {
    const roomId = uuidv4();
    rooms[roomId] = []; 
    res.json({ roomId });
});

io.on("connection", (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);
    videoController.handleConnection(socket);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
