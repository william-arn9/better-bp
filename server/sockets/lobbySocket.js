const { getGame, getAllGames } = require('../managers/gameManager');
const { v4: uuidv4 } = require('uuid');

module.exports = (socket, io) => {
  socket.on('getLobbies', () => {
    const games = getAllGames();
    const retArray = [];
    for(let gameCode in games) {
      const game = games[gameCode];
      if(game.settings.visibility === 'public') {
        retArray.push({
          gameCode,
          difficulty: game.settings.difficulty,
          name: game.lobby.lobbyName,
          players: game.lobby.lobbyPlayers.length
        });
      }
    }
    io.emit('lobbyListUpdate', retArray);
  });

  socket.on('joinLobby', ({gameCode, data}) => {
    const gameProps = getGame(gameCode);
    if(gameProps) {
      const { lobby, roles } = gameProps;
      if(!lobby.lobbyPlayers.find((p) => p.name === data.username)) {
        // Assign auth token and verify role
        const userToken = uuidv4();
        const userRole = lobby.lobbyPlayers.length === 0 ? 'leader' : 'player';
        lobby.lobbyPlayers.push({ name: data.username, token: userToken, role: userRole });
        roles[userToken] = userRole;
        socket.join(gameCode);
        // Notify in chat that user has joined
        lobby.messageLog.push({ user: '$system', message: `${data.username} has joined the lobby.` });
        // Send return socket event
        io.to(gameCode).emit('lobbyUpdate', { lobbyPlayers: lobby.lobbyPlayers, messageLog: lobby.messageLog });
      }
    }
    else {
      console.error(`Game not found: ${gameCode}`);
      socket.emit('error', `Game not found: ${gameCode}`);
    }
  });

  socket.on('leaveLobby', ({gameCode, data}) => {
    const gameProps = getGame(gameCode);
    if(gameProps) {
      // Remove user and user role
      const { lobby, roles } = gameProps;
      console.log(`Leaving lobby: ${data.username}`);
      const player = lobby.lobbyPlayers.find((p) => p.name === data.username);
      lobby.lobbyPlayers = lobby.lobbyPlayers.filter((p) => p.name !== data.username);
      if (player) roles[player.token] = undefined;
      // Notify in chat that user has left
      lobby.messageLog.push({ user: '$system', message: `${data.username} has left the lobby.` });
      // Send return socket event
      io.to(gameCode).emit('lobbyUpdate', { lobbyPlayers: lobby.lobbyPlayers, messageLog: lobby.messageLog });
    }
    else {
      console.error(`Game not found: ${gameCode}`);
      socket.emit('error', `Game not found: ${gameCode}`);
    }
  });

  socket.on('authFetch', ({gameCode, data}) => {
    const gameProps = getGame(gameCode);
    if(gameProps) {
      const lobby = gameProps.lobby;
      const user = lobby.lobbyPlayers.find((p) => p.name === data.username);
      io.to(gameCode).emit('auth', user);
    }
    else {
      console.error(`Game not found: ${gameCode}`);
      socket.emit('error', `Game not found: ${gameCode}`);
    }
  });
};