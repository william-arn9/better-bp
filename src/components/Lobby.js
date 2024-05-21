// src/components/Lobby.js
import React, { useEffect, useState } from 'react';
import socket from '../socket';
import { useNavigate } from 'react-router-dom';

const Lobby = () => {
  const [players, setPlayers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for game updates
    socket.on('gameUpdate', (data) => {
      setPlayers(data.players);
    });

    // Clean up the event listener on component unmount
    return () => {
      socket.off('gameUpdate');
    };
  }, []);

  const handleStartGame = () => {
    // Emit an event to start the game
    socket.emit('startGame');
    navigate('/game');
  };

  return (
    <div>
      <h1>Lobby</h1>
      <h2>Waiting for players...</h2>
      <ul>
        {players.map((player, index) => (
          <li key={index}>{player}</li>
        ))}
      </ul>
      {players.length > 1 && <button onClick={handleStartGame}>Start Game</button>}
    </div>
  );
};

export default Lobby;
