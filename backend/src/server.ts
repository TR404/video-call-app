import express, { Request, Response } from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import cors from "cors";

const app = express();
app.use(cors({ origin: ["http://localhost:3000", "https://video-call-app-n4my.vercel.app"], credentials: true }));
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:3000", "https://video-call-app-n4my.vercel.app"],
        methods: ["GET", "POST"],
        credentials: true
    },
    transports: ["websocket", "polling"]
});

const rooms: Record<string, string[]> = {}; 

app.post("/create-room", (req: Request, res: Response) => {
    const roomId = uuidv4();
    rooms[roomId] = []; 
    res.json({ roomId });
});

io.on("connection", (socket: Socket) => {
    console.log(`A user connected: ${socket.id}`);

    socket.on("joinCall", (roomId: string) => {
        if (!roomId) return;

        if (!rooms[roomId]) {
            rooms[roomId] = [];
        }

        if (!rooms[roomId].includes(socket.id)) {
            rooms[roomId].push(socket.id);
            socket.join(roomId);
        }

        socket.to(roomId).emit("user-joined", socket.id);
        io.to(socket.id).emit("existing-users", rooms[roomId].filter(id => id !== socket.id));
    });

    socket.on("offer", ({ offer, roomId, receiver, sender }) => {
        console.log(`Offer from ${sender} to ${receiver} in ${roomId}`);
        io.to(receiver).emit("offer", { offer, sender });
    });

    socket.on("answer", ({ answer, sender, receiver }) => {
        console.log(`Answer from ${sender} to ${receiver}`);
        io.to(receiver).emit("answer", { answer });
    });

    socket.on("ice-candidate", ({ candidate, roomId, sender }) => {
        console.log(`ICE Candidate from ${sender} in ${roomId}`);
        socket.to(roomId).emit("ice-candidate", { candidate, sender });
    });

    socket.on("disconnect", () => {
        console.log(`User ${socket.id} disconnected`);
        for (const roomId in rooms) {
            rooms[roomId] = rooms[roomId].filter(id => id !== socket.id);
            socket.to(roomId).emit("user-left", socket.id);

            if (rooms[roomId].length === 0) {
                delete rooms[roomId];
                console.log(`Room ${roomId} deleted`);
            }
        }
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
