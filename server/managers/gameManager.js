
const GameData = require("../models/gameData");
const { generateGameCode } = require("../services/generators");

class GameManager {
  constructor() {
    this.games = new Map();
    this.buildRankedGames();
  }

  buildRankedGames() {
    const easyRanked = new GameData('Ranked BP Easy', 'public');
    const hardRanked = new GameData('Ranked BP', 'public').setSettings({difficulty: 100});
    this.games.set('ABCD', easyRanked);
    this.games.set('XXXX', hardRanked);
  }

  getGame(gameCode) {
    return this.games.get(gameCode);
  }

  getAllGames() {
    return this.games;
  }

  createGame(lobbyName, visibility) {
    const gameCode = generateGameCode();
    const game = new GameData(lobbyName, visibility);
    this.games.set(gameCode, game);
    return gameCode;
  }
}

const gameManager = new GameManager();
module.exports = gameManager;