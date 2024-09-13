const { botPlays } = require('../services/bot.service');
const gameManager = require('../managers/gameManager');
const eventManager = require('../managers/socketEventManager');

const startTurnTimer = (gameCode, io) => {
  const gameProps = gameManager.getGame(gameCode);
  const game = gameProps.getGame();
  const lobby = gameProps.getLobby();
  clearInterval(game.interval);
  gameProps.resetGameTimer();
  game.interval = setInterval(() => {
    game.timer -= 1;
    eventManager.emitTimerUpdate(io, gameCode, game);
    if (game.timer === 0) {
      gameProps.resetGameTimer();
      game.decrementLives();
      const player = game.getActivePlayer();
      if(player.lives === 0) {
        player.alive = false;
        const livingPlayers = game.getLivingPlayers();
        if(livingPlayers.length < 2) {
          game.winner = livingPlayers[0].name;
          game.resetGamePlayers();
          eventManager.emitEndGame(io, gameCode);
          eventManager.emitGameUpdate(io, gameCode, lobby, game);
          clearInterval(game.interval);
          return;
        }
      }
      game.incrementTurn();
      eventManager.emitGameUpdate(io, gameCode, lobby, game);
      const didBotPlay = botPlays(game.gamePlayers, game.turn, game.prompt);
      if(didBotPlay) {
        console.log(`Bot played ${didBotPlay}`);
        game.setPlayerInput(didBotPlay);
        game.incrementTurn();
        game.getNewPrompt();
        gameProps.resetGameTimer();
        eventManager.emitGameUpdate(io, gameCode, lobby, game);
      }
    }
  }, 1000);
};

const startStartTimer = (gameCode, io) => {
  const gameProps = gameManager.getGame(gameCode);
  const game = gameProps.getGame();
  const lobby = gameProps.getLobby();
  game.interval = setInterval(() => {
    game.startTimer--;
    eventManager.emitStartTimerUpdate(io, gameCode, game);
    if(game.startTimer === 0) {
      game.getNewPrompt();
      clearInterval(game.interval);
      eventManager.emitStartGame(io, gameCode);
      eventManager.emitGameUpdate(io, gameCode, lobby, game);
      const didBotPlay = botPlays(game.gamePlayers, game.turn, game.prompt);
      if(didBotPlay) {
        game.setPlayerInput(didBotPlay);
        game.incrementTurn();
        game.getNewPrompt();
        gameProps.resetGameTimer();
        startTurnTimer(gameCode, io);
        eventManager.emitGameUpdate(io, gameCode, lobby, game);
      }
      else {
        game.resetGameTimer;
        startTurnTimer(gameCode, io);
        eventManager.emitGameUpdate(io, gameCode, lobby, game);
      }
      game.startTimer = 15;
      return;
    }
  }, 1000);
};

module.exports = { startTurnTimer, startStartTimer };