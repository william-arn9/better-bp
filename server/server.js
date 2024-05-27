// server/server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');  // Import the cors package
const { v4: uuidv4 } = require('uuid');
const { getRandomPrompt, generateGameCode } = require('./services/generators');
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

let games = {
  XXXX: {
    game: {
      gamePlayers: [],
      prompt: '',
      word: '',
      timer: 60,
      turn: 0,
      interval: null,
      startTimer: 15
    },
    lobby: {
      lobbyPlayers: [],
      messageLog: [],
      lobbyName: 'Ranked BP'
    },
    settings: {
      visibility: 'public',
      timerDuration: 5,
      startingLives: 2,
      maxLives: 3,
      difficulty: 100,
    },
    roles: {}
  },
  ABCD: {
    game: {
      gamePlayers: [],
      prompt: '',
      word: '',
      timer: 60,
      turn: 0,
      interval: null,
      startTimer: 15
    },
    lobby: {
      lobbyPlayers: [],
      messageLog: [],
      lobbyName: 'Ranked BP Easy'
    },
    settings: {
      visibility: 'public',
      timerDuration: 5,
      startingLives: 2,
      maxLives: 3,
      difficulty: 500,
    },
    roles: {}
  }
};

const startTurnTimer = (gameCode) => {
  const game = games[gameCode].game;
  const settings = games[gameCode].settings;
  const lobby = games[gameCode].lobby;
  clearInterval(game.interval);
  game.timer = settings.timerDuration;
  game.interval = setInterval(() => {
    game.timer -= 1;
    io.to(gameCode).emit('timerUpdate', { timer: game.timer, turn: game.turn });
    if (game.timer === 0) {
      game.timer = game.timerDuration;
      game.gamePlayers[game.turn].lives--;
      if(game.gamePlayers[game.turn].lives === 0) {
        game.gamePlayers[game.turn].alive = false;
        if(game.gamePlayers.filter((player) => player.alive).length < 2) {
          game.winner = game.gamePlayers.filter((player) => player.alive)[0].name;
          game.gamePlayers = [];
          io.to(gameCode).emit('endGame');
          io.to(gameCode).emit('gameUpdate', {
            lobbyPlayers: lobby.lobbyPlayers,
            gamePlayers: [],
            turn: 0,
            prompt: game.prompt,
            timer: game.timer,
            winner: game.winner
          });
          clearInterval(game.interval);
          return;
        }
      }
      game.turn = incrementTurn(game.gamePlayers, game.turn);
      io.to(gameCode).emit('gameUpdate', {
        lobbyPlayers: lobby.lobbyPlayers,
        gamePlayers: game.gamePlayers,
        turn: game.turn,
        prompt: game.prompt,
        timer: game.timer
      });
    }
  }, 1000);
};

const startStartTimer = (gameCode) => {
  const game = games[gameCode].game;
  const lobby = games[gameCode].lobby;
  game.interval = setInterval(() => {
    game.startTimer--;
    io.to(gameCode).emit('startTimerUpdate', { startTimer: game.startTimer });
    if(game.startTimer === 0) {
      game.prompt = getRandomPrompt();
      clearInterval(game.interval);
      io.to(gameCode).emit('startGame');
      io.to(gameCode).emit('gameUpdate', {
        lobbyPlayers: lobby.lobbyPlayers,
        gamePlayers: game.gamePlayers,
        turn: game.turn,
        prompt: game.prompt,
        timer: game.timer
      });
      game.startTimer = 15;
      startTurnTimer(gameCode);
      return;
    }
  }, 1000);
};

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('createGame', ({visibility, lobbyName}, callback) => {
    const gameCode = generateGameCode();
    games[gameCode] = {
      game: {
        gamePlayers: [],
        prompt: '',
        word: '',
        timer: 60,
        turn: 0,
        interval: null,
        startTimer: 15
      },
      lobby: {
        lobbyPlayers: [],
        messageLog: [],
        lobbyName
      },
      settings: {
        visibility: visibility,
        timerDuration: 5,
        startingLives: 2,
        maxLives: 3,
        difficulty: 500,
      },
      roles: {}
    };
    socket.join(gameCode);
    callback(gameCode);
  });

  socket.on('getLobbies', () => {
    const retArray = [];
    for(let gameCode in games) {
      const game = games[gameCode];
      if(game.settings.visibility === 'public') {
        retArray.push({
          gameCode,
          difficulty: game.settings.difficulty,
          name: game.lobby.lobbyName,
          players: game.lobby.lobbyPlayers.length
        });
      }
    }
    io.emit('lobbyListUpdate', retArray);
  });

  // Handle player joining
  socket.on('joinGame', ({gameCode, data}) => {
    if(games[gameCode]) {
      const game = games[gameCode].game;
      const lobby = games[gameCode].lobby;
      const settings = games[gameCode].settings;
      game.gamePlayers.push({ name: data.username, lives: settings.startingLives, alive: true });
      if(game.gamePlayers.length > 1) {
        startStartTimer(gameCode);
      }
      io.emit('gameUpdate', {
        lobbyPlayers: lobby.lobbyPlayers,
        gamePlayers: game.gamePlayers,
        turn: game.turn,
        prompt: game.prompt,
        timer: game.timer
      });
    }
    else {
      console.error(`Game not found: ${gameCode}`);
      socket.emit('error', `Game not found: ${gameCode}`);
    }
  });

  // Handle player joining
  socket.on('leaveGame', ({gameCode, data}) => {
    if(games[gameCode]) {
      const game = games[gameCode].game;
      const lobby = games[gameCode].lobby;
      game.gamePlayers = game.gamePlayers.filter((p) => p.name !== data.username);
      io.emit('gameUpdate', {
        lobbyPlayers: lobby.lobbyPlayers,
        gamePlayers: game.gamePlayers,
        turn: game.turn,
        prompt: game.prompt,
        timer: game.turn
      });
    }
    else {
      console.error(`Game not found: ${gameCode}`);
      socket.emit('error', `Game not found: ${gameCode}`);
    }
  });

  socket.on('typeChar', ({gameCode, data}) => {
    if(games[gameCode]) {
      const game = games[gameCode].game;
      const lobby = games[gameCode].lobby;
      for(let p of game.gamePlayers) {
        if(data.name === p.name) {
          p.inputVal = data.inputVal;
        }
      }
      io.to(gameCode).emit('gameUpdate', {
        lobbyPlayers: lobby.lobbyPlayers,
        gamePlayers: game.gamePlayers,
        turn: game.turn,
        prompt: game.prompt,
        timer: game.timer
      });
    }
    else {
      console.error(`Game not found: ${gameCode}`);
      socket.emit('error', `Game not found: ${gameCode}`);
    }
  });

  // Handle word submission
  socket.on('submitWord', ({gameCode, data}) => {
    if(games[gameCode]) {
      const game = games[gameCode].game;
      const lobby = games[gameCode].lobby;
      const settings = games[gameCode].settings;
      game.word = data.word;
      if(game.word === '/BOOM') {
        game.timer = settings.timerDuration;
        game.gamePlayers[game.turn].lives--;
        if(game.gamePlayers[game.turn].lives === 0) {
          game.gamePlayers[game.turn].alive = false;
          if(game.gamePlayers.filter((player) => player.alive).length < 2) {
            game.winner = game.gamePlayers.filter((player) => player.alive)[0].name;
            game.gamePlayers = [];
            io.to(gameCode).emit('endGame');
            io.to(gameCode).emit('gameUpdate', {
              lobbyPlayers: lobby.lobbyPlayers,
              gamePlayers: [],
              turn: 0,
              prompt: game.prompt,
              timer: game.timer,
              winner: game.winner
            });
            clearInterval(game.interval);
            return;
          }
        }
        game.turn = incrementTurn(game.gamePlayers, game.turn);
        game.prompt = getRandomPrompt();
      }
      else if(verifyRealWord(game.word) && game.word.includes(game.prompt)) {
        game.turn = incrementTurn(game.gamePlayers, game.turn);
        game.prompt = getRandomPrompt();
        game.timer = settings.timerDuration;
      }
      io.to(gameCode).emit('gameUpdate', {
        lobbyPlayers: lobby.lobbyPlayers,
        gamePlayers: game.gamePlayers,
        turn: game.turn,
        prompt: game.prompt,
        timer: game.timer
      });
    }
    else {
      console.error(`Game not found: ${gameCode}`);
      socket.emit('error', `Game not found: ${gameCode}`);
    }
  });

  // Handle settings update
  socket.on('updateSettings', ({gameCode, data}) => {
    console.log(data);
    if(games[gameCode]) {
      const settings = games[gameCode].settings;
      settings.visibility = data.visibility;
      settings.timerDuration = data.timer;
      settings.startingLives = data.lives;
      settings.maxLives = data.maxLives;
      settings.difficulty = data.difficulty;
      console.log(`=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=`);
      console.log(`Visibility: ${settings.visibility}\nTimer: ${settings.timerDuration}\nStarting Lives: ${settings.startingLives}\nMax Lives: ${settings.maxLives}\nDifficulty: ${settings.difficulty}`);
      io.to(gameCode).emit('settingsUpdate', {
        visibility: settings.visibility,
        timer: settings.timerDuration,
        lives: settings.startingLives,
        maxLives: settings.maxLives,
        difficulty: settings.difficulty
      });
    }
    else {
      console.error(`Game not found: ${gameCode}`);
      socket.emit('error', `Game not found: ${gameCode}`);
    }
  });

  // Handle Settings tab init
  socket.on('getSettings', ({gameCode}) => {
    if(games[gameCode]) {
      const settings = games[gameCode].settings;
      io.to(gameCode).emit('settingsUpdate', {
        visibility: settings.visibility,
        timer: settings.timerDuration,
        lives: settings.startingLives,
        maxLives: settings.maxLives,
        difficulty: settings.difficulty
      });
    }
    else {
      console.error(`Game not found: ${gameCode}`);
      socket.emit('error', `Game not found: ${gameCode}`);
    }
  });

  socket.on('authFetch', ({gameCode, data}) => {
    if(games[gameCode]) {
      const lobby = games[gameCode].lobby;
      const user = lobby.lobbyPlayers.find((p) => p.name === data.username);
      io.to(gameCode).emit('auth', user);
    }
    else {
      console.error(`Game not found: ${gameCode}`);
      socket.emit('error', `Game not found: ${gameCode}`);
    }
  });

  // Handle player joining lobby
  socket.on('joinLobby', ({gameCode, data}) => {
    if(games[gameCode]) {
      const lobby = games[gameCode].lobby;
      const roles = games[gameCode].roles;
      if(!lobby.lobbyPlayers.find((p) => p.name === data.username)) {
        const userToken = uuidv4();
        const userRole = lobby.lobbyPlayers.length === 0 ? 'leader' : 'player';
        lobby.lobbyPlayers.push({ name: data.username, token: userToken, role: userRole });
        roles[userToken] = userRole;
        socket.join(gameCode);
        lobby.messageLog.push({ user: '$system', message: `${data.username} has joined the lobby.` });
        io.to(gameCode).emit('lobbyUpdate', { lobbyPlayers: lobby.lobbyPlayers, messageLog: lobby.messageLog });
      }
    }
    else {
      console.error(`Game not found: ${gameCode}`);
      socket.emit('error', `Game not found: ${gameCode}`);
    }
  });

  // Handle player joining lobby
  socket.on('leaveLobby', ({gameCode, data}) => {
    if(games[gameCode]) {
      const lobby = games[gameCode].lobby;
      const roles = games[gameCode].roles;
      console.log(`Leaving lobby: ${data.username}`);
      const player = lobby.lobbyPlayers.find((p) => p.name === data.username);
      lobby.lobbyPlayers = lobby.lobbyPlayers.filter((p) => p.name !== data.username);
      if (player) roles[player.token] = undefined;
      lobby.messageLog.push({ user: '$system', message: `${data.username} has left the lobby.` });
      io.to(gameCode).emit('lobbyUpdate', { lobbyPlayers: lobby.lobbyPlayers, messageLog: lobby.messageLog });
    }
    else {
      console.error(`Game not found: ${gameCode}`);
      socket.emit('error', `Game not found: ${gameCode}`);
    }
  });

  // Handle chat message
  socket.on('sendMessage', ({gameCode, data}) => {
    if(games[gameCode]) {
      const lobby = games[gameCode].lobby;
      lobby.messageLog.push(data);
      io.to(gameCode).emit('lobbyUpdate', { lobbyPlayers: lobby.lobbyPlayers, messageLog: lobby.messageLog }); 
    }
    else {
      console.error(`Game not found: ${gameCode}`);
      socket.emit('error', `Game not found: ${gameCode}`);
    }
  });

  // Handle client disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected');
    // lobbyPlayers = lobbyPlayers.filter(player => player.token !== socket.id);
    // io.emit('gameUpdate', { lobbyPlayers, gamePlayers, turn, prompt, timer });
  });
});

server.listen(4000, () => console.log('Server running on port 4000'));
