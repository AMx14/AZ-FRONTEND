import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { UserContext } from './UserContext';

const socket = io('http://localhost:8080');

const JoinLobby = () => {
  const { lobbyId } = useParams();
  const [lobbyCode, setLobbyCode] = useState(lobbyId || '');
  const navigate = useNavigate();
  const { email } = useContext(UserContext);

  useEffect(() => {
    socket.on('joinResponse', ({ accepted, lobbyId }) => {
      if (accepted) {
        console.log('Lobby joined');
        navigate(`/lobby/${lobbyId}`);
      } else {
        alert('Join request declined');
      }
    });

    return () => {
      socket.off('joinResponse');
    };
  }, [navigate]);

  const handleJoinLobby = async () => {
    try {
      const response = await fetch('http://localhost:8080/lobbies/requestJoinLobby', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lid: lobbyCode, participant: email }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.message === 'Join request sent to lobby owner') {
        socket.emit('joinLobby', { lid: lobbyCode, userEmail: email });
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Failed to join lobby:', error.message);
    }
  };

  return (
    <div className="join-lobby">
      <h1>Join Lobby</h1>
      <input
        type="text"
        placeholder="Enter Lobby Code"
        value={lobbyCode}
        onChange={(e) => setLobbyCode(e.target.value)}
      />
      <p>User Email: {email}</p>
      <button onClick={handleJoinLobby}>Join</button>
    </div>
  );
};

export default JoinLobby;
