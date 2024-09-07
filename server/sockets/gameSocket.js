const { verifyRealWord } = require('../services/words.service');
const { botPlays, configureBotPlayers } = require('../services/bot.service');
const { startStartTimer } = require('../services/timers.service');
const gameManager = require('../managers/gameManager');
const eventManager = require('../managers/socketEventManager');

module.exports = (socket, io) => {
  socket.on('createGame', ({visibility, lobbyName}, callback) => {
    const gameCode = gameManager.createGame(lobbyName, visibility);
    socket.join(gameCode);
    callback(gameCode);
  });

  socket.on('joinGame', ({gameCode, data}) => {
    const gameProps = gameManager.getGame(gameCode);
    if(gameProps) {
      const game = gameProps.getGame();
      const lobby = gameProps.getLobby();
      const settings = gameProps.getSettings();
      game.pushPlayer({ name: data.username, lives: settings.startingLives, alive: true });
      if(game.size > 1) {
        startStartTimer(gameCode, io);
      }
      eventManager.emitGameUpdate(io, gameCode, lobby, game);
    }
    else {
      console.error(`Game not found: ${gameCode}`);
      eventManager.emitError(socket, `Game not found: ${gameCode}`);
    }
  });

  socket.on('leaveGame', ({gameCode, data}) => {
    const gameProps = gameManager.getGame(gameCode);
    if(gameProps) {
      const game = gameProps.getGame();
      const lobby = gameProps.getLobby();
      game.removePlayer(data.username);
      eventManager.emitGameUpdate(io, gameCode, lobby, game);
    }
    else {
      console.error(`Game not found: ${gameCode}`);
      eventManager.emitError(socket, `Game not found: ${gameCode}`);
    }
  });

  socket.on('typeChar', ({gameCode, data}) => {
    const gameProps = gameManager.getGame(gameCode);
    if(gameProps) {
      const game = gameProps.getGame();
      const lobby = gameProps.getLobby();
      game.setPlayerInput(data.inputVal);
      eventManager.emitGameUpdate(io, gameCode, lobby, game);
    }
    else {
      console.error(`Game not found: ${gameCode}`);
      eventManager.emitError(socket, `Game not found: ${gameCode}`);
    }
  });

  socket.on('submitWord', ({gameCode, data}) => {
    const gameProps = gameManager.getGame(gameCode);
    if(gameProps) {
      const game = gameProps.getGame();
      const lobby = gameProps.getLobby();
      const settings = gameProps.getSettings();
      if(data.word === '/BOOM') {
        game.timer = settings.timerDuration;
        game.decrementLives();
        const player = game.getActivePlayer();
        if(player.lives === 0) {
          player.alive = false;
          const livingPlayers = game.getLivingPlayers();
          if(livingPlayers.length < 2) {
            game.winner = livingPlayers[0].name;
            game.resetGamePlayers();
            io.to(gameCode).emit('endGame');
            eventManager.emitGameUpdate(io, gameCode, lobby, game);
            clearInterval(game.interval);
            return;
          }
        }
        game.incrementTurn();
        game.getNewPrompt();
      }
      else if(verifyRealWord(data.word) && data.word.includes(game.prompt)) {
        game.incrementTurn();
        game.getNewPrompt();
        gameProps.resetGameTimer();
      }
      eventManager.emitGameUpdate(io, gameCode, lobby, game);
      const didBotPlay = botPlays(game.gamePlayers, game.turn, game.prompt);
      console.log(`Bot played ${didBotPlay}`);
      if(didBotPlay) {
        game.gamePlayers[game.turn].inputVal = didBotPlay;
        game.incrementTurn();
        game.getNewPrompt();
        game.timer = settings.timerDuration;
        eventManager.emitGameUpdate(io, gameCode, lobby, game);
      }
    }
    else {
      console.error(`Game not found: ${gameCode}`);
      eventManager.emitError(socket, `Game not found: ${gameCode}`);
    }
  });

  socket.on('updateSettings', ({gameCode, data}) => {
    const gameProps = gameManager.getGame(gameCode);
    if(gameProps) {
      data = {
        visibility: data.visibility,
        timerDuration: data.timer,
        startingLives: data.lives,
        maxLives: data.maxLives,
        difficulty: data.difficulty
      };
      gameProps.setSettings(data);
      if(data.bot) {
        configureBotPlayers(data, gameProps);
      }
      const settings = gameProps.getSettings();
      eventManager.emitSettingsUpdate(io, gameCode, settings);
    }
    else {
      console.error(`Game not found: ${gameCode}`);
      eventManager.emitError(socket, `Game not found: ${gameCode}`);
    }
  });

  socket.on('getSettings', ({gameCode}) => {
    const gameProps = gameManager.getGame(gameCode);
    if(gameProps) {
      const settings = gameProps.getSettings();
      eventManager.emitSettingsUpdate(io, gameCode, settings);
    }
    else {
      console.error(`Game not found: ${gameCode}`);
      eventManager.emitError(socket, `Game not found: ${gameCode}`);
    }
  });
};