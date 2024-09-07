const { Game } = require("./game");
const { Lobby } = require("./lobby");
const { Settings } = require("./settings");

export class GameData {
  constructor(lobbyName, visibility = 'public') {
    this.game = new Game();
    this.lobby = new Lobby(lobbyName);
    this.settings = new Settings(visibility);
    this.roles = new Map();
  }

  getGameCode() {
    return this.code;
  }

  getLobby() {
    return this.lobby;
  }

  setSettings(partialSettings) {
    this.settings.updateSettings(partialSettings);
  }

  pushChat(message) {
    this.lobby.pushChatMessage(message);
  }
}