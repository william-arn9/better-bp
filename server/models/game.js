const { getRandomPrompt } = require("../services/generators");

class Game {
  constructor() {
    this.gamePlayers = [];
    this.prompt = '';
    this.timer = 5;
    this.turn = 0;
    this.interval = null;
    this.startTimer = 15;
    this.winner = null;
    this.size = 0;
  }

  incrementTurn() {
    this.turn = (this.turn + 1) % this.size;
    let currentPlayer = this.gamePlayers[this.turn];
    while (!currentPlayer.alive) {
      this.turn = (this.turn + 1) % this.size;
      currentPlayer = this.gamePlayers[this.turn];
    }
  }

  getNewPrompt() {
    this.prompt = getRandomPrompt();
  }

  pushPlayer(player) {
    this.gamePlayers.push(player);
    this.size++;
  }
  removePlayer(username) {
    this.gamePlayers = this.gamePlayers.filter((p) => p.name !== username);
    this.size = this.gamePlayers.length;
  }
  resetGamePlayers() {
    this.gamePlayers = [];
  }
  getLivingPlayers() {
    return this.gamePlayers.filter((player) => player.alive);
  }
  getActivePlayer() {
    return this.gamePlayers[game.turn];
  }
  findPlayer(id) {
    return this.gamePlayers.find((p) => p.name === username);
  }
  setPlayerInput(inputVal) {
    this.gamePlayers[this.turn].inputVal = inputVal;
  }
  decrementLives() {
    this.gamePlayers[game.turn].lives--;
  }
}

module.exports = Game;