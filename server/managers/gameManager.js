let games = {
  XXXX: {
    game: {
      gamePlayers: [],
      prompt: '',
      word: '',
      timer: 5,
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
      timer: 5,
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

const getGame = (gameCode) => games[gameCode];
const getAllGames = () => games;
const createGame = (gameCode, gameData) => games[gameCode] = gameData;
const updateGame = (gameCode, gameData) => games[gameCode] = gameData;

module.exports = { getGame, getAllGames, createGame, updateGame, games };