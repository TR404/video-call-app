import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const baseUrl = "https://video-call-app-n4my.vercel.app";

const socket = io(baseUrl);

interface VideoCallProps {
    endCall: () => void;
}

const VideoCall: React.FC<VideoCallProps> = ({ endCall }) => {
    const [roomId, setRoomId] = useState<string | null>(null);
    const [inputRoomId, setInputRoomId] = useState<string>("");
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const peerConnection = useRef<RTCPeerConnection | null>(null);

    // Set up socket listeners
    useEffect(() => {
        socket.on("offer", async ({ offer, sender }) => {
            console.log(`Received offer from ${sender}`);

            if (!peerConnection.current) return;

            if (!peerConnection.current.remoteDescription) {
                await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
                const answer = await peerConnection.current.createAnswer();
                await peerConnection.current.setLocalDescription(answer);

                socket.emit("answer", { answer, sender, receiver: socket.id });
            }
        });

        socket.on("answer", async ({ answer }) => {
            console.log("Received answer");
            if (peerConnection.current && !peerConnection.current.remoteDescription) {
                await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
            }
        });

        socket.on("ice-candidate", async ({ candidate }) => {
            if (!peerConnection.current) return;
            try {
                await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (error) {
                console.error("Error adding ICE candidate", error);
            }
        });

        // Listen for existing users in the room
        socket.on("existing-users", async (users: string[]) => {
            console.log("Existing users in room:", users);
            await startCall();

            users.forEach(async (userId) => {
                if (!peerConnection.current) return;
                const offer = await peerConnection.current.createOffer();
                await peerConnection.current.setLocalDescription(offer);
                socket.emit("offer", { offer, receiver: userId, sender: socket.id });
            });
        });

        return () => {
            socket.off("offer");
            socket.off("answer");
            socket.off("ice-candidate");
            socket.off("existing-users");
            socket.disconnect();
        };
    }, []);

    // Attach local stream to video element
    useEffect(() => {
        if (localStream && localVideoRef.current) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    // Attach remote stream to video element
    useEffect(() => {
        if (remoteStream && remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    // Create a new room
    const createRoom = async () => {
        const response = await fetch(`${baseUrl}/create-room`, { method: "POST" });
        const data = await response.json();
        setRoomId(data.roomId);
        socket.emit("joinCall", data.roomId);
        await startCall();
    };

    // Join an existing room
    const joinRoom = async () => {
        if (inputRoomId.trim() === "") {
            alert("Please enter a valid Room ID.");
            return;
        }

        console.log("Joining room with ID:", inputRoomId);
        setRoomId(inputRoomId);
        socket.emit("joinCall", inputRoomId);
    };

    // Start a video call
    const startCall = async () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert("Your browser does not support video calls.");
            return;
        }

        try {
            peerConnection.current = new RTCPeerConnection({
                iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
            });

            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setLocalStream(stream);
            if (localVideoRef.current) localVideoRef.current.srcObject = stream;

            stream.getTracks().forEach((track) => {
                peerConnection.current?.addTrack(track, stream);
            });

            peerConnection.current.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.emit("ice-candidate", { candidate: event.candidate, roomId });
                }
            };

            peerConnection.current.ontrack = (event) => {
                if (event.streams && event.streams[0]) {
                    setRemoteStream(event.streams[0]);
                }
            };

            if (!roomId) return;

            const offer = await peerConnection.current.createOffer();
            await peerConnection.current.setLocalDescription(offer);
            socket.emit("offer", { offer, roomId });

        } catch (error) {
            console.error("Error accessing media devices:", error);
            alert("Failed to access camera/microphone. Please check browser permissions.");
        }
    };

    // End the call
    const handleEndCall = () => {
        if (peerConnection.current) {
            peerConnection.current.onicecandidate = null;
            peerConnection.current.ontrack = null;
            peerConnection.current.close();
            peerConnection.current = null;
        }

        localStream?.getTracks().forEach((track) => track.stop());
        remoteStream?.getTracks().forEach((track) => track.stop());

        setLocalStream(null);
        setRemoteStream(null);
        setRoomId(null);
        endCall();
    };

    return (
        <div>
            <h2>Video Call</h2>

            {!roomId ? (
                <div>
                    <button onClick={createRoom}>Create Room</button>
                    <input
                        type="text"
                        placeholder="Enter Room ID"
                        value={inputRoomId}
                        onChange={(e) => setInputRoomId(e.target.value)}
                    />
                    <button onClick={joinRoom}>Join Room</button>
                </div>
            ) : (
                <div>
                    <p>Room ID: <strong>{roomId}</strong></p>
                    <button onClick={startCall}>Start Call</button>
                    <button onClick={handleEndCall}>End Call</button>
                </div>
            )}

            <div className="video-container">
                <video ref={localVideoRef} autoPlay playsInline muted />
                <video ref={remoteVideoRef} autoPlay playsInline />
            </div>
        </div>
    );
};

export default VideoCall;
