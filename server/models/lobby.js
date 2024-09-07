class Lobby {
  constructor(lobbyName) {
    this.lobbyPlayers = [];
    this.messageLog = [];
    this.lobbyName = lobbyName;
  }

  pushChatMessage(message) {
    this.messageLog.push(message);
  }
}

module.exports = Lobby;