// src/components/Game.js
import React, { useEffect, useState } from 'react';
import { FaHeart } from 'react-icons/fa';
import socket from '../socket';
import Chat from './widgets/Chat';
import Settings from './widgets/Settings';

const Game = () => {
  const [myUser, setMyUser] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [lobbyPlayers, setLobbyPlayers] = useState([]);
  const [gamePlayers, setGamePlayers] = useState([]);
  const [turn, setTurn] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [word, setWord] = useState('');
  const [timer, setTimer] = useState(60);
  const [startTimer, setStartTimer] = useState(15);
  const [inputValue, setInputValue] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [winner, setWinner] = useState('');

  const LIVES = 3;

  useEffect(() => {
    const username = sessionStorage.getItem('username');
    setMyUser(username);
    socket.emit('joinLobby', { username });
    console.log('Logged in');
    // Listen for game updates
    socket.on('gameUpdate', (data) => {
      setLobbyPlayers(data.lobbyPlayers);
      setGamePlayers(data.gamePlayers);
      setTurn(data.turn);
      setPrompt(data.prompt);
      setWord(data.word);
      setTimer(data.timer);
      setWinner(data.winner);
    });

    socket.on('startTimerUpdate', (data) => {
      setStartTimer(data.startTimer);
    });
    socket.on('timerUpdate', (data) => {
      setTimer(data.timer);
    });
    socket.on('startGame', () => {
      setGameStarted(true);
    });
    socket.on('endGame', () => {
      setGameStarted(false);
    });
    // Clean up the event listener on component unmount
    const handleBeforeUnload = () => {
      socket.emit('leaveLobby', { username });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      socket.off('gameUpdate');
    };
  }, []);

  const handleJoinGame = () => {
    console.log('jonegame running')
    const username = sessionStorage.getItem('username');
    if (username && !gamePlayers.find((player) => player.name === username)) {
      const player = { name: username, lives: LIVES };
      setGamePlayers((prevPlayers) => [...prevPlayers, player]);
      
      // Emit event to the server to inform other players
      socket.emit('joinGame', { username });
    }
  };
  const handleLeaveGame = () => {
    setGamePlayers((prevPlayers) => prevPlayers.filter((p) => p.name !== myUser));
    socket.emit('leaveGame', { username: myUser });
  }

  const handleWordSubmit = (newWord) => {
    // Emit event to server with the new word
    socket.emit('submitWord', { word: newWord });
  };
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleWordSubmit(e.target.value);
      setInputValue(''); // Clear the input field after submission
    }
  };
  const handleInputChange = (e) => {
    const inputVal = e.target.value.toUpperCase();
    setInputValue(inputVal);
    socket.emit('typeChar', { name: myUser, inputVal });
  };
  const handleToggleSettings = (e) => {
    setSettingsOpen(!settingsOpen);
  };

  const focusInput = () => {
    document.getElementById('entry')?.focus();
  };

  return (
    <div className="h-[calc(100vh-56px)] flex justify-center items-center bg-background" onClick={focusInput}> 
      {settingsOpen && (
        <Settings />
      )}
      <div className="h-[calc(100vh-56px)] w-4/5 flex flex-col justify-center items-center bg-background" onClick={focusInput}>
        <button className="relative top-[-28vh] px-4 py-3 text-accent font-semibold rounded-full border border-accent" onClick={handleToggleSettings}>{settingsOpen ? 'Close Settings' : 'Open Settings'}</button>
        {!gameStarted && (
          <>
            <h2 className="m-6">Waiting for players...</h2>
            {winner && (
              <h3>{winner} won the last round!</h3>
            )}
            {gamePlayers.length > 1 && (<div className="my-4 text-secondary font-bold text-2xl">{startTimer}</div>)}
            <ul>
              {gamePlayers.map((player, index) => (
                  <li className={`my-2 p-2 flex items-center border-2 border-primary rounded-md text-primary ${turn === index ? 'bg-secondary' : ''} ${!player.alive ? 'bg-background border border-darkest text-darkest' : ''}`} key={index}>{player.name}
                    {Array.from({ length: player.lives }).map((_, index) => (
                      <FaHeart index={index} className="ml-2 text-red-500" />
                    ))}
                  </li>
                ))}
            </ul>
            {!gamePlayers.find((p) => p.name === myUser) && (<button className="mt-4 p-2 text-primary bg-accent rounded-md" onClick={handleJoinGame}>Join Game</button>)}
          </>
        )}
        {gameStarted && (
          <>
            <div className="my-4 text-primary uppercase font-semibold text-lg">{prompt}</div>
            <div className="my-4 text-secondary font-bold text-2xl">{timer}</div>
            <ul className="my-4">
              {gamePlayers.map((player, index) => (
                <li className={`my-2 p-2 flex items-center border-2 border-primary rounded-md text-primary ${turn === index ? 'bg-secondary' : ''} ${!player.alive ? 'bg-background border border-darkest text-darkest' : ''}`} key={index}>{player.name}
                  {Array.from({ length: player.lives }).map((_, index) => (
                    <FaHeart index={index} className="ml-2 text-red-500" />
                  ))}
                  <p>{player.inputVal}</p>
                </li>
              ))}
            </ul>
            {gamePlayers[turn]?.name === myUser && (
              <>
                <input
                  type="text"
                  id="entry"
                  value={inputValue}
                  onKeyDown={handleKeyDown}
                  onChange={handleInputChange}
                />
              </>
            )}
          </>
        )}
        {(gamePlayers.find((p) => p.name === myUser) && !gameStarted) && (<button className="mt-12 p-2 text-primary bg-accent rounded-md" onClick={handleLeaveGame}>Leave Game</button>)}
      </div>
      <Chat />
    </div>
  );
};

export default Game;
