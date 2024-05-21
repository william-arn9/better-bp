// src/components/Home.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import socket from '../socket';

const Home = () => {
  const navigate = useNavigate();

  const handleJoinGame = () => {
    const username = sessionStorage.getItem('username');
    if (username && username.trim()) {
      // Navigate to the lobby
      navigate('/game');
    }
  };

  return (
    <div className="mt-8 flex flex-col items-center">
      <h2 className="text-lg font-bold text-primary">Welcome to BombParty!</h2>
      <div className="h-[500px] w-4/5 mt-24 p-4 flex gap-4 bg-secondary rounded-lg">
        <div className="w-1/2 p-4 flex flex-col justify-center bg-accent rounded-lg">
          <h3 className="mb-4 text-lg font-semibold">Create a new lobby</h3>
          <input type="text" className="w-64 p-2 rounded-md border border-primary" placeholder="Lobby Name"></input>
          <div className="my-4 gap-2 flex">
            <label><input type="radio"></input>Public</label>
            <label><input type="radio"></input>Private</label>
          </div>
          <div className="w-full flex justify-center">
            <button className="w-36 my-2 p-2 border border-primary text-primary rounded-md">Create Lobby</button>
          </div>
        </div>
        <div className="flex w-1/2 justify-center items-center">
          <button className="w-36 p-2 text-primary bg-accent rounded-md" onClick={handleJoinGame}>Join Game</button>
        </div>
      </div>
    </div>
  );
};

export default Home;
