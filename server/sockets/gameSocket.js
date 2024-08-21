const { getGame, createGame, updateGame } = require('../managers/gameManager');
const { verifyRealWord } = require('../services/words.service');
const { incrementTurn } = require('../services/turn.service');
const { botPlays } = require('../services/bot.service');
const { startStartTimer } = require('../services/timers.service');
const { getRandomPrompt } = require('../services/generators');

module.exports = (socket, io) => {
  socket.on('createGame', ({visibility, lobbyName}, callback) => {
    const gameCode = generateGameCode();
    const game = {
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
    createGame(gameCode, game);
    socket.join(gameCode);
    callback(gameCode);
  });

  socket.on('joinGame', ({gameCode, data}) => {
    const gameProps = getGame(gameCode);
    if(gameProps) {
      const game = gameProps.game;
      const lobby = gameProps.lobby;
      const settings = gameProps.settings;
      game.gamePlayers.push({ name: data.username, lives: settings.startingLives, alive: true });
      if(game.gamePlayers.length > 1) {
        startStartTimer(gameCode, io);
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

  socket.on('leaveGame', ({gameCode, data}) => {
    const gameProps = getGame(gameCode);
    if(gameProps) {
      const game = gameProps.game;
      const lobby = gameProps.lobby;
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
    const gameProps = getGame(gameCode);
    if(gameProps) {
      const game = gameProps.game;
      const lobby = gameProps.lobby;
      game.gamePlayers[game.turn].inputVal = data.inputVal;
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

  socket.on('submitWord', ({gameCode, data}) => {
    const gameProps = getGame(gameCode);
    if(gameProps) {
      const game = gameProps.game;
      const lobby = gameProps.lobby;
      const settings = gameProps.settings;
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
      const didBotPlay = botPlays(game.gamePlayers, game.turn, game.prompt);
      console.log(`Bot played ${didBotPlay}`);
      if(didBotPlay) {
        game.gamePlayers[game.turn].inputVal = didBotPlay;
        game.turn = incrementTurn(game.gamePlayers, game.turn);
        game.prompt = getRandomPrompt();
        game.timer = settings.timerDuration;
        io.to(gameCode).emit('gameUpdate', {
          lobbyPlayers: lobby.lobbyPlayers,
          gamePlayers: game.gamePlayers,
          turn: game.turn,
          prompt: game.prompt,
          timer: game.timer
        });
      }
    }
    else {
      console.error(`Game not found: ${gameCode}`);
      socket.emit('error', `Game not found: ${gameCode}`);
    }
  });

  socket.on('updateSettings', ({gameCode, data}) => {
    console.log(data);
    const gameProps = getGame(gameCode);
    if(gameProps) {
      const settings = games[gameCode].settings;
      settings.visibility = data.visibility;
      settings.timerDuration = data.timer;
      settings.startingLives = data.lives;
      settings.maxLives = data.maxLives;
      settings.difficulty = data.difficulty;
      if(data.bot) {
        console.log('Setting bot player');
        const players = games[gameCode].game.gamePlayers;
        settings.bot = data.bot;
        const botPlayer = { name: 'Bot', lives: settings.startingLives, alive: true, bot: true };
        players.push(botPlayer);
      }
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

  socket.on('getSettings', ({gameCode}) => {
    const gameProps = getGame(gameCode);
    if(gameProps) {
      const settings = gameProps.settings;
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
};