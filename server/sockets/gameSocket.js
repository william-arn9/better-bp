const { getGame, createGame } = require('../managers/gameManager');
const { verifyRealWord } = require('../services/words.service');
const { incrementTurn } = require('../services/turn.service');
const { botPlays, configureBotPlayers } = require('../services/bot.service');
const { startStartTimer } = require('../services/timers.service');
const { getRandomPrompt } = require('../services/generators');
const { createGamePlayer } = require('../services/player.service');
const gameManager = require('../managers/gameManager');

module.exports = (socket, io) => {
  socket.on('createGame', ({visibility, lobbyName}, callback) => {
    const gameCode = gameManager.createGame(lobbyName, visibility);
    socket.join(gameCode);
    callback(gameCode);
  });

  socket.on('joinGame', ({gameCode, data}) => {
    const gameProps = gameManager.getGame(gameCode);
    if(gameProps) {
      const { game, lobby, settings } = gameProps;
      game.gamePlayers.push(createGamePlayer(data, settings));
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
      const { game, lobby } = gameProps;
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
      const { game, lobby } = gameProps;
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
      const { game, lobby, settings } = gameProps;
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
    console.debug(data);
    const gameProps = getGame(gameCode);
    if(gameProps) {
      const settings = gameProps.settings;
      settings.visibility = data.visibility;
      settings.timerDuration = data.timer;
      settings.startingLives = data.lives;
      settings.maxLives = data.maxLives;
      settings.difficulty = data.difficulty;
      if(data.bot) {
        configureBotPlayers(data, gameProps);
      }
      console.debug(`=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=`);
      console.debug(`Visibility: ${settings.visibility}\nTimer: ${settings.timerDuration}\nStarting Lives: ${settings.startingLives}\nMax Lives: ${settings.maxLives}\nDifficulty: ${settings.difficulty}`);
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