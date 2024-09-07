class Lobby {
  constructor(lobbyName) {
    this.lobbyPlayers = [];
    this.messageLog = [];
    this.lobbyName = lobbyName;
    this.size = 0;
  }

  pushChatMessage(message) {
    this.messageLog.push(message);
  }

  pushPlayer(player) {
    this.lobbyPlayers.push(player);
    this.size++;
  }
  removePlayer(username) {
    this.lobbyPlayers = this.lobbyPlayers.filter((p) => p.name !== username);
    this.size = this.lobbyPlayers.length;
  }
  findPlayer(username) {
    return this.lobbyPlayers.find((p) => p.name === username);
  }
}

module.exports = Lobby;