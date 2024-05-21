// server/server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');  // Import the cors package
const { v4: uuidv4 } = require('uuid');
const { getRandomPrompt } = require('./services/generators');
const { verifyRealWord } = require('./services/words.service');
const { incrementTurn } = require('./services/turn.service');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",  // Replace with your client's URL
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true
  }
});

// Use cors middleware
app.use(cors({
  origin: "http://localhost:3000",  // Replace with your client's URL
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
  credentials: true
}));

// Auth Variables
let roles = {};

// Lobby Variables
let lobbyPlayers = [];
let messageLog = [];

// Settings Variables
let visibility = 'public';
let timerDuration = 5;
let startingLives = 2;
let maxLives = 3;
let difficulty = 500;

// Start Timer Variables
let startTimer = 15;

// Game Variables
let gamePlayers = [];
let turn = 0;
let prompt = '';
let word = '';
let timer = timerDuration;
let interval;

const startTurnTimer = () => {
  clearInterval(interval);
  timer = timerDuration;
  interval = setInterval(() => {
    timer -= 1;
    io.emit('timerUpdate', { timer, turn });
    if (timer === 0) {
      timer = timerDuration;
      gamePlayers[turn].lives--;
      if(gamePlayers[turn].lives === 0) {
        gamePlayers[turn].alive = false;
        if(gamePlayers.filter((player) => player.alive).length < 2) {
          const winner = gamePlayers.filter((player) => player.alive)[0].name;
          gamePlayers = [];
          io.emit('endGame');
          io.emit('gameUpdate', { lobbyPlayers, gamePlayers: [], turn: 0, prompt, timer, winner });
          clearInterval(interval);
          return;
        }
      }
      turn = incrementTurn(gamePlayers, turn);
      io.emit('gameUpdate', { lobbyPlayers, gamePlayers, turn, prompt, timer });
    }
  }, 1000);
};

const startStartTimer = () => {
  interval = setInterval(() => {
    startTimer--;
    io.emit('startTimerUpdate', { startTimer });
    if(startTimer === 0) {
      prompt = getRandomPrompt();
      clearInterval(interval);
      io.emit('startGame');
      io.emit('gameUpdate', { lobbyPlayers, gamePlayers, turn, prompt, timer });
      startTimer = 15;
      startTurnTimer();
      return;
    }
  }, 1000);
};

io.on('connection', (socket) => {
  console.log('New client connected');

  // Send initial game state to the new client
  socket.emit('gameUpdate', { lobbyPlayers, gamePlayers, turn, prompt, timer });

  // Handle player joining
  socket.on('joinGame', (data) => {
    gamePlayers.push({ name: data.username, lives: startingLives, alive: true });
    if(gamePlayers.length > 1) {
      startStartTimer();
    }
    io.emit('gameUpdate', { lobbyPlayers, gamePlayers, turn, prompt, timer });
  });

  // Handle player joining
  socket.on('leaveGame', (data) => {
    gamePlayers = gamePlayers.filter((p) => p.name !== data.username);
    io.emit('gameUpdate', { lobbyPlayers, gamePlayers, turn, prompt, timer });
  });

  socket.on('typeChar', (data) => {
    for(let p of gamePlayers) {
      if(data.name === p.name) {
        p.inputVal = data.inputVal;
      }
    }
    io.emit('gameUpdate', { lobbyPlayers, gamePlayers, turn, prompt, timer });
  });

  // Handle word submission
  socket.on('submitWord', (data) => {
    word = data.word;
    if(verifyRealWord(word) && word.includes(prompt)) {
      turn = incrementTurn(gamePlayers, turn);
      prompt = getRandomPrompt();
      timer = timerDuration;
    }
    io.emit('gameUpdate', { lobbyPlayers, gamePlayers, turn, prompt, timer });
  });

  // Handle settings update
  socket.on('updateSettings', (data) => {
    console.log(data);
    visibility = data.visibility;
    timerDuration = data.timer;
    startingLives = data.lives;
    maxLives = data.maxLives;
    difficulty = data.difficulty;
    console.log(`=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=`);
    console.log(`Visibility: ${visibility}\nTimer: ${timerDuration}\nStarting Lives: ${startingLives}\nMax Lives: ${maxLives}\nDifficulty: ${difficulty}`);
    io.emit('settingsUpdate', { visibility, timer: timerDuration, lives: startingLives, maxLives, difficulty });
  });

  // Handle Settings tab init
  socket.on('getSettings', () => {
    io.emit('settingsUpdate', { visibility, timer: timerDuration, lives: startingLives, maxLives, difficulty });
  });

  // Handle player joining lobby
  socket.on('joinLobby', (data) => {
    if(!lobbyPlayers.find((p) => p.name === data.username)) {
      const userToken = uuidv4();
      const userRole = lobbyPlayers.length === 0 ? 'leader' : 'player';
      lobbyPlayers.push({ name: data.username, token: userToken, role: userRole });
      roles[userToken] = userRole;
      messageLog.push({ user: '$system', message: `${data.username} has joined the lobby.` });
      io.emit('lobbyUpdate', { lobbyPlayers, messageLog });
    }
  });

  // Handle player joining lobby
  socket.on('leaveLobby', (data) => {
    console.log(`Leaving lobby: ${data.username}`);
    const player = lobbyPlayers.find((p) => p.name === data.username);
    lobbyPlayers = lobbyPlayers.filter((p) => p.name !== data.username);
    if (player) roles[player.token] = undefined;
    messageLog.push({ user: '$system', message: `${data.username} has left the lobby.` });
    io.emit('lobbyUpdate', { lobbyPlayers, messageLog });
  });

  // Handle chat message
  socket.on('sendMessage', (data) => {
    messageLog.push(data);
    io.emit('lobbyUpdate', { lobbyPlayers, messageLog });
  })

  // Handle client disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected');
    lobbyPlayers = lobbyPlayers.filter(player => player.token !== socket.id);
    io.emit('gameUpdate', { lobbyPlayers, gamePlayers, turn, prompt, timer });
  });
});

server.listen(4000, () => console.log('Server running on port 4000'));
