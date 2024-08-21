const { getGame } = require('../managers/gameManager');

module.exports = (socket, io) => {
    // Handle chat message
    socket.on('sendMessage', ({gameCode, data}) => {
      const game = getGame(gameCode);
      if(game) {
        const lobby = game.lobby;
        lobby.messageLog.push(data);
        io.to(gameCode).emit('lobbyUpdate', { lobbyPlayers: lobby.lobbyPlayers, messageLog: lobby.messageLog }); 
      }
      else {
        console.error(`Game not found: ${gameCode}`);
        socket.emit('error', `Game not found: ${gameCode}`);
      }
    });
};