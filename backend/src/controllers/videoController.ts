import { Server, Socket } from "socket.io";

class VideoController {
    private io: Server;
    private activeCalls: Record<string, string[]>; 

    constructor(io: Server) {
        this.io = io;
        this.activeCalls = {};
    }

    startCall(socket: Socket, roomId: string): void {
        socket.join(roomId);
        if (!this.activeCalls[roomId]) {
            this.activeCalls[roomId] = [];
        }
        this.activeCalls[roomId].push(socket.id);
        this.io.to(roomId).emit("callStarted", { roomId, participants: this.activeCalls[roomId] });
    }

    joinCall(socket: Socket, roomId: string): void {
        socket.join(roomId);
        if (!this.activeCalls[roomId]) {
            this.activeCalls[roomId] = [];
        }
        if (!this.activeCalls[roomId].includes(socket.id)) {
            this.activeCalls[roomId].push(socket.id);
        }
        this.io.to(roomId).emit("userJoined", { userId: socket.id, participants: this.activeCalls[roomId] });
    }

    leaveCall(socket: Socket, roomId: string): void {
        socket.leave(roomId);
        if (this.activeCalls[roomId]) {
            this.activeCalls[roomId] = this.activeCalls[roomId].filter(id => id !== socket.id);
            this.io.to(roomId).emit("userLeft", { userId: socket.id, participants: this.activeCalls[roomId] });

            if (this.activeCalls[roomId].length === 0) {
                delete this.activeCalls[roomId]; // Cleanup empty rooms
            }
        }
    }

    handleConnection(socket: Socket): void {
        socket.on("startCall", (roomId: string) => this.startCall(socket, roomId));
        socket.on("joinCall", (roomId: string) => this.joinCall(socket, roomId));
        socket.on("leaveCall", (roomId: string) => this.leaveCall(socket, roomId));
        socket.on("disconnect", () => this.handleDisconnect(socket));

        // WebRTC Signaling
        socket.on("offer", ({ roomId, offer }) => {
            socket.to(roomId).emit("offer", { sender: socket.id, offer });
        });

        socket.on("answer", ({ roomId, answer }) => {
            socket.to(roomId).emit("answer", { sender: socket.id, answer });
        });

        socket.on("ice-candidate", ({ roomId, candidate }) => {
            socket.to(roomId).emit("ice-candidate", { sender: socket.id, candidate });
        });

        // Stream handling
        socket.on("startStream", ({ roomId }) => {
            socket.to(roomId).emit("streamStarted", { sender: socket.id });
        });

        socket.on("stopStream", ({ roomId }) => {
            socket.to(roomId).emit("streamStopped", { sender: socket.id });
        });
    }

    handleDisconnect(socket: Socket): void {
        for (const roomId in this.activeCalls) {
            if (this.activeCalls[roomId].includes(socket.id)) {
                this.leaveCall(socket, roomId);
            }
        }
        console.log(`User ${socket.id} disconnected`);
    }
}

export default VideoController;
