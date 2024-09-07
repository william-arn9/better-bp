class Game {
  constructor() {
    this.gamePlayers = [];
    this.prompt = '';
    this.word = '';
    this.timer = 5,
    this.turn = 0,
    this.interval = null,
    this.startTimer = 15
  }
}

module.exports = Game;