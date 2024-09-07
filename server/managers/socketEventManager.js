class SocketEventManager {
  constructor() { }

  emitLobbyUpdate(io, gameCode, lobby) {
    io.to(gameCode).emit('lobbyUpdate', {
      lobbyPlayers: lobby.lobbyPlayers,
      messageLog: lobby.messageLog
    });
  }

  emitGameUpdate(io, gameCode, lobby, game) {
    io.to(gameCode).emit('gameUpdate', {
      lobbyPlayers: lobby.lobbyPlayers,
      gamePlayers: game.gamePlayers,
      turn: game.turn,
      prompt: game.prompt,
      timer: game.timer,
      winner: game.winner || null // Optional in case there's no winner
    });
  }

  emitGlobalGameUpdate(io, lobby, game) {
    io.emit('gameUpdate', {
      lobbyPlayers: lobby.lobbyPlayers,
      gamePlayers: game.gamePlayers,
      turn: game.turn,
      prompt: game.prompt,
      timer: game.timer
    });
  }

  emitError(socket, message) {
    socket.emit('error', message);
  }

  emitSettingsUpdate(io, gameCode, settings) {
    io.to(gameCode).emit('settingsUpdate', settings.getTransformedSettings());
  }

  emitAuth(io, gameCode, user) {
    io.to(gameCode).emit('auth', user);
  }
}

const eventManager = new SocketEventManager(io);
module.exports = socketManager;