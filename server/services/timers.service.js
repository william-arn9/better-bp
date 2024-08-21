const { incrementTurn } = require('../services/turn.service');
const { getRandomPrompt } = require('../services/generators');
const { botPlays } = require('../services/bot.service');
const { getGame } = require('../managers/gameManager');

const startTurnTimer = (gameCode, io) => {
  const gameProps = getGame(gameCode);
  const game = gameProps.game;
  const lobby = gameProps.lobby;
  const settings = gameProps.settings;
  clearInterval(game.interval);
  game.timer = settings.timerDuration;
  game.interval = setInterval(() => {
    game.timer -= 1;
    console.log(`Sending timer decrement: ${game.timer}`);
    io.to(gameCode).emit('timerUpdate', { timer: game.timer, turn: game.turn });
    console.log(`Sent`);
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

const startStartTimer = (gameCode, io) => {
  const gameProps = getGame(gameCode);
  const game = gameProps.game;
  const lobby = gameProps.lobby;
  const settings = gameProps.settings;
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
      const didBotPlay = botPlays(game.gamePlayers, game.turn, game.prompt);
      console.log(`Bot played ${didBotPlay}`);
      if(didBotPlay) {
        game.gamePlayers[game.turn].inputVal = didBotPlay;
        game.turn = incrementTurn(game.gamePlayers, game.turn);
        game.prompt = getRandomPrompt();
        game.timer = settings.timerDuration;
        startTurnTimer(gameCode, io);
        io.to(gameCode).emit('gameUpdate', {
          lobbyPlayers: lobby.lobbyPlayers,
          gamePlayers: game.gamePlayers,
          turn: game.turn,
          prompt: game.prompt,
          timer: game.timer
        });
      }
      else {
        game.timer = settings.timerDuration;
        startTurnTimer(gameCode, io);
        io.to(gameCode).emit('gameUpdate', {
          lobbyPlayers: lobby.lobbyPlayers,
          gamePlayers: game.gamePlayers,
          turn: game.turn,
          prompt: game.prompt,
          timer: game.timer
        });
      }
      game.startTimer = 15;
      return;
    }
  }, 1000);
};

module.exports = { startTurnTimer, startStartTimer };