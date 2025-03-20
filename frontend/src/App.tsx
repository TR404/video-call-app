import React, { useState } from 'react';
import VideoCall from './components/VideoCall';
import './styles/App.css';

const App: React.FC = () => {
    const [isCallActive, setIsCallActive] = useState(false);

    return (
        <div>
            {!isCallActive ? (
                <button onClick={() => setIsCallActive(true)}>Start Call</button>
            ) : (
                <VideoCall endCall={() => setIsCallActive(false)} />
            )}
        </div>
    );
};

export default App;
