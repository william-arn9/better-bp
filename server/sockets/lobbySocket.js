const gameManager = require('../managers/gameManager');
const { v4: uuidv4 } = require('uuid');
const eventManager = require('../managers/socketEventManager');

module.exports = (socket, io) => {
  socket.on('getLobbies', () => {
    const games = gameManager.getAllGames();
    const retArray = [];
    games.forEach((game, gameCode) => {
      if (game.settings.visibility === 'public') {
        retArray.push({
          gameCode,
          difficulty: game.settings.difficulty,
          name: game.lobby.lobbyName,
          players: game.lobby.lobbyPlayers.length
        });
      }
    });
    io.emit('lobbyListUpdate', retArray);
  });

  socket.on('joinLobby', ({gameCode, data}) => {
    const gameProps = gameManager.getGame(gameCode);
    if(gameProps) {
      const lobby = gameProps.getLobby();
      const roles = gameProps.getRoles();
      if(!lobby.findPlayer(data.username)) {
        const userToken = uuidv4();
        const userRole = lobby.size === 0 ? 'leader' : 'player';
        lobby.pushPlayer({ name: data.username, token: userToken, role: userRole });
        roles.set(userToken, userRole);
        socket.join(gameCode);
        lobby.pushChatMessage({ user: '$system', message: `${data.username} has joined the lobby.` });
        eventManager.emitLobbyUpdate(io, gameCode, lobby);
      }
    }
    else {
      console.error(`Game not found: ${gameCode}`);
      eventManager.emitError(socket, `Game not found: ${gameCode}`);
    }
  });

  socket.on('leaveLobby', ({gameCode, data}) => {
    const gameProps = gameManager.getGame(gameCode);
    if(gameProps) {
      const lobby = gameProps.getLobby();
      const roles = gameProps.getRoles();
      const player = lobby.findPlayer(data.username);
      if (player) {
        roles.delete(player.token);
        lobby.removePlayer(data.username);
      }
      lobby.pushChatMessage({ user: '$system', message: `${data.username} has left the lobby.` });
      eventManager.emitLobbyUpdate(io, gameCode, lobby);
    }
    else {
      console.error(`Game not found: ${gameCode}`);
      eventManager.emitError(socket, `Game not found: ${gameCode}`);
    }
  });

  socket.on('authFetch', ({gameCode, data}) => {
    const gameProps = gameManager.getGame(gameCode);
    if(gameProps) {
      const lobby = gameProps.getLobby();
      const user = lobby.findPlayer(data.username);
      eventManager.emitAuth(io, gameCode, user);
    }
    else {
      console.error(`Game not found: ${gameCode}`);
      eventManager.emitError(socket, `Game not found: ${gameCode}`);
    }
  });
};