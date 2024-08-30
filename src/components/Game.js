// src/components/Game.js
import React, { useEffect, useRef, useState } from 'react';
import { FaHeart } from 'react-icons/fa';
import socket from '../socket';
import Chat from './widgets/Chat';
import Settings from './widgets/Settings';
import GameRules from './widgets/GameRules';
import { useParams } from 'react-router-dom';


const lifeAudio = new Audio('/assets/lost-life.mp3');
const turnAudio = new Audio('/assets/turn.mp3');
const startAudio = new Audio('/assets/game-started.mp3');

const Game = () => {
  const { gameCode } = useParams();
  const [myUser, setMyUser] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [gamePlayers, setGamePlayers] = useState([]);
  const [turn, setTurn] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [timer, setTimer] = useState(60);
  const [startTimer, setStartTimer] = useState(15);
  const [inputValue, setInputValue] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [winner, setWinner] = useState('');

  const prevGamePlayersRef = useRef([]); // Store previous gamePlayers state
  const prevTurnRef = useRef(0);

  useEffect(() => {
    const username = sessionStorage.getItem('username');
    setMyUser(username);
    socket.emit('joinLobby', { gameCode, data: { username } });
    console.log('Logged in');
    // Listen for game updates
    socket.on('gameUpdate', (data) => {
      setGamePlayers(data.gamePlayers);
      setTurn(data.turn);
      setPrompt(data.prompt);
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
      socket.emit('leaveLobby', { gameCode, data: { username } });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      socket.off('gameUpdate');
      socket.off('startTimerUpdate');
      socket.off('timerUpdate');
      socket.off('startGame');
      socket.off('endGame');
    };
  }, []);

  useEffect(() => {
    if(gamePlayers.length > 0 && gameStarted) {
      startAudio.play().catch(error => {
        console.error('Error playing audio:', error);
      });
    }
    else if(!gameStarted && winner) {
      lifeAudio.play().catch(error => {
        console.error('Error playing audio:', error);
      });
    }
  }, [gameStarted]);

  useEffect(() => {
    let playedLostLife = false;
    const prevGamePlayers = prevGamePlayersRef.current;
    const prevTurn = prevTurnRef.current;
    gamePlayers.forEach((player, index) => {
      const prevPlayer = prevGamePlayers[index];
      if (prevPlayer && player.lives < prevPlayer.lives) {
        // Play sound effect when a player loses a life
        lifeAudio.play().catch(error => {
          console.error('Error playing audio:', error);
        });
        playedLostLife = true;
      }
    });
    if(!playedLostLife && prevTurn !== turn && gameStarted) {
      turnAudio.play().catch(error => {
        console.error('Error playing audio:', error);
      });
    } 
    setInputValue((''));
    // Update previous gamePlayers state
    prevTurnRef.current = turn;
    prevGamePlayersRef.current = gamePlayers;
  }, [gamePlayers, turn]);

  const handleJoinGame = () => {
    const username = sessionStorage.getItem('username');
    if (username && !gamePlayers.find((player) => player.name === username)) {
      const player = { name: username };
      setGamePlayers((prevPlayers) => [...prevPlayers, player]);
      
      // Emit event to the server to inform other players
      socket.emit('joinGame', { gameCode, data: { username } });
    }
  };
  const handleLeaveGame = () => {
    setGamePlayers((prevPlayers) => prevPlayers.filter((p) => p.name !== myUser));
    socket.emit('leaveGame', { gameCode, data: { username: myUser } });
  }

  const handleWordSubmit = (newWord) => {
    // Emit event to server with the new word
    socket.emit('submitWord', { gameCode, data: { word: newWord } });
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
    socket.emit('typeChar', { gameCode, data: { name: myUser, inputVal } });
  };
  const handleToggleSettings = (e) => {
    setSettingsOpen(!settingsOpen);
  };

  const focusInput = () => {
    document.getElementById('entry')?.focus();
  };

  return (
    <>
      <div className={`w-4/5 mt-12 ${settingsOpen ? 'ml-[418px] w-[calc(80vw-334px)]' : ''} absolute flex flex-col items-center justify-center`}>
        <button className="relative px-4 py-3 text-accent font-semibold rounded-full border border-accent" onClick={handleToggleSettings}>{settingsOpen ? 'Close Settings' : 'Open Settings'}</button>
        <GameRules />
      </div>
      <div className="h-[calc(100vh-56px)] flex justify-center items-center bg-background" onClick={focusInput}> 
        {settingsOpen && (
          <Settings />
        )}
        <div className="h-[calc(100vh-56px)] w-4/5 flex flex-col justify-center items-center bg-background" onClick={focusInput}>
          {!gameStarted && (
            <>
              <h2 className="m-6">Waiting for players...</h2>
              {winner && (
                <h3>{winner} won the last round!</h3>
              )}
              {gamePlayers.length > 1 && (<div className="my-4 text-secondary font-bold text-2xl">{startTimer}</div>)}
              <ul>
                {gamePlayers.map((player, index) => (
                    <li className={`my-2 p-2 flex flex-col items-center border-2 border-primary rounded-md text-primary ${turn === index ? 'bg-secondary' : ''} ${!player.alive ? 'bg-background border border-darkest text-darkest' : ''}`} key={index}>
                      <p>{player.name}</p>
                      <div className="flex">
                        {Array.from({ length: player.lives }).map((_, index) => (
                          <FaHeart index={index} className="mx-1 text-red-500" />
                        ))}
                      </div>
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
                  <li className={`min-w-[280px] my-2 p-2 flex flex-col items-center border-2 border-primary rounded-md text-primary ${turn === index ? 'bg-secondary' : ''} ${!player.alive ? 'bg-background border border-darkest text-darkest' : ''}`} key={index}>
                    <p className="font-bold text-lg">{player.name}</p>
                    <div className="flex">
                      {Array.from({ length: player.lives }).map((_, index) => (
                        <FaHeart index={index} className="ml-2 text-red-500" />
                      ))}
                    </div>
                    <p className="">{player.inputVal}</p>
                  </li>
                ))}
              </ul>
              {gamePlayers[turn]?.name === myUser && (
                <>
                  <input
                    className="w-[320px] p-4 border rounded-md text-lg"
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
    </>
  );
};

export default Game;
