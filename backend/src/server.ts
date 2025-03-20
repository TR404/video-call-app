import express, { Request, Response } from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
    transports: ["websocket", "polling"],
});

const rooms: Record<string, string[]> = {}; 

app.post("/create-room", (req: Request, res: Response) => {
    console.log("Creating a new room...");
    const roomId = uuidv4();
    rooms[roomId] = []; 
    res.json({ roomId });
});

io.on("connection", (socket: Socket) => {
    console.log(`A user connected: ${socket.id}`);
    console.log(`creaated room ids: ${rooms}`);

    socket.on("joinCall", (roomId: string) => {
        console.log(`Received join request for room: ${roomId} from user: ${socket.id}`);
    
        if (!roomId) {
            console.error("joinCall event received without a roomId");
            return;
        }
    
        if (!rooms[roomId]) {
            console.warn(`Room ${roomId} does not exist, creating it.`);
            rooms[roomId] = [];
        }
    
        rooms[roomId].push(socket.id);
        socket.join(roomId);
    
        console.log(`User ${socket.id} joined room: ${roomId}`);
        console.log(`Current users in ${roomId}:`, rooms[roomId]);
    
        // Notify all users in the room about the new user
        socket.to(roomId).emit("user-joined", socket.id);
    
        // Send the list of existing users to the newly joined user
        io.to(socket.id).emit("existing-users", rooms[roomId].filter(id => id !== socket.id));
    });
    

    socket.on("offer", ({ offer, roomId, sender }) => {
        console.log(`Received offer from ${sender} in room ${roomId}`);
        socket.to(roomId).emit("offer", { offer, sender });
    });

    socket.on("answer", ({ answer, sender }) => {
        console.log(`Received answer from ${sender}`);
        io.to(sender).emit("answer", { answer });
    });

    socket.on("ice-candidate", ({ candidate, sender }) => {
        console.log(`Received ICE candidate from ${sender}`);
        socket.broadcast.emit("ice-candidate", { candidate, sender });
    });

    socket.on("disconnect", () => {
        console.log(`User ${socket.id} disconnected`);

        for (const roomId in rooms) {
            rooms[roomId] = rooms[roomId].filter(id => id !== socket.id);

            socket.to(roomId).emit("user-left", socket.id);
        }
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
