// src/components/Lobby.js
import React, { useEffect, useState } from 'react';
import socket from '../socket';
import { useNavigate } from 'react-router-dom';

const Lobby = () => {
  const [lobbyList, setLobbyList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for game updates
    socket.on('lobbyListUpdate', (data) => {
      setLobbyList(data);
    });

    socket.emit('getLobbies');

    // Clean up the event listener on component unmount
    return () => {
      socket.off('lobbyListUpdate');
    };
  }, []);

  const handleStartGame = (e, gameCode) => {
    e.preventDefault();
    navigate(`/en-US/game/${gameCode}`);
  };

  return (
    <div className="flex flex-col items-center">
      <h1 className='m-6 text-center text-lg font-semibold text-primary'>Lobby List</h1>
      <div className='w-[900px] flex justify-center gap-2'>
        {lobbyList.length < 1 && (
          <h3>We're sorry. There's no public lobbies to display right now.</h3>
        )}
        {lobbyList.length > 0 && (
          <>
            {lobbyList.map((lobby, index) => (
              <button className="w-full lg:w-[280px] p-2 bg-secondary border border-2 border-primary rounded-md" onClick={(e) => handleStartGame(e, lobby.gameCode)}>
                <div className='flex justify-between'>
                  <h3 className="text-primary font-semibold text-start">{lobby.name}</h3>
                  <p className="text-primary font-semibold">{lobby.players} players</p>
                </div>
                <div className='flex justify-between'>
                  <p className='text-accent font-bold'>{lobby.gameCode}</p>
                  <p className='text-primary'>Difficulty: min {lobby.difficulty}</p>
                </div>
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default Lobby;
