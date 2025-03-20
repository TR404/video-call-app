# Video Call Application

This project is a simple video call application that allows two users to communicate via video in real-time. It consists of a backend server built with Node.js and Express, and a frontend application built with React.

## Project Structure

```
video-call-app
├── backend                # Backend server
│   ├── src
│   │   ├── server.ts     # Entry point for the backend application
│   │   └── controllers
│   │       └── videoController.ts # Handles video call events
│   ├── package.json      # Backend dependencies and scripts
│   ├── tsconfig.json     # TypeScript configuration for backend
│   └── README.md         # Backend documentation
├── frontend               # Frontend application
│   ├── src
│   │   ├── App.tsx       # Main entry point for the frontend application
│   │   ├── components
│   │   │   └── VideoCall.tsx # Video streaming UI component
│   │   └── styles
│   │       └── App.css   # CSS styles for the frontend
│   ├── package.json      # Frontend dependencies and scripts
│   ├── tsconfig.json     # TypeScript configuration for frontend
│   └── README.md         # Frontend documentation
├── README.md             # Project overview and setup instructions
└── .gitignore            # Files and directories to ignore by Git
```

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm (Node package manager)

### Installation

1. Clone the repository:

   ```
   git clone <repository-url>
   cd video-call-app
   ```

2. Install backend dependencies:

   ```
   cd backend
   npm install
   ```

3. Install frontend dependencies:

   ```
   cd frontend
   npm install
   ```

### Running the Application

1. Start the backend server:

   ```
   cd backend
   npm start
   ```

2. Start the frontend application:

   ```
   cd frontend
   npm start
   ```

3. Open your browser and navigate to `http://localhost:3000` to access the video call application.

## Usage

- Users can start a video call by clicking the "Start Call" button.
- To join an existing call, users need to enter the call ID provided by the host.
- The application uses WebSocket for real-time communication.

## Contributing

Feel free to submit issues or pull requests for improvements or bug fixes.

## License

This project is licensed under the MIT License.