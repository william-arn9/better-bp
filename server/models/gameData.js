const Game = require("./game");
const Lobby = require("./lobby");
const Settings = require("./settings");

class GameData {
  constructor(lobbyName, visibility = 'public') {
    this.game = new Game();
    this.lobby = new Lobby(lobbyName);
    this.settings = new Settings(visibility);
    this.roles = new Map();
  }

  getGame() {
    return this.game;
  }
  getLobby() {
    return this.lobby;
  }
  getSettings() {
    return this.settings;
  }
  getRoles() {
    return this.roles;
  }

  setSettings(partialSettings) {
    this.settings.updateSettings(partialSettings);
    return this;
  }

  pushChat(message) {
    this.lobby.pushChatMessage(message);
  }

  resetGameTimer() {
    this.game.timer = this.settings.timerDuration;
  }
}

module.exports = GameData;