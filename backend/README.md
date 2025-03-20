# Video Call App Backend

This is the backend part of the Video Call App project. It is built using Node.js and TypeScript, utilizing Express for the server and Socket.IO for real-time communication.

## Setup Instructions

1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd video-call-app/backend
   ```

2. **Install dependencies:**
   ```
   npm install
   ```

3. **Run the server:**
   ```
   npm start
   ```

## API Endpoints

- **WebSocket Connection:**
  - Establish a WebSocket connection for real-time video streaming.

- **Video Call Events:**
  - `startCall`: Initiates a video call.
  - `joinCall`: Allows a user to join an existing video call.
  - `endCall`: Ends the current video call.

## Technologies Used

- Node.js
- Express
- Socket.IO
- TypeScript

## Directory Structure

- `src/`: Contains the source code for the backend.
  - `server.ts`: Entry point for the application.
  - `controllers/`: Contains controllers for handling video call logic.
    - `videoController.ts`: Manages video call events and WebSocket connections.