const gameManager = require('../managers/gameManager');

module.exports = (socket, io) => {
    socket.on('sendMessage', ({gameCode, data}) => {
      const gameProps = gameManager.getGame(gameCode);
      if(gameProps) {
        gameProps.pushChat(data);
        const lobby = gameProps.getLobby();
        io.to(gameCode).emit('lobbyUpdate', { lobbyPlayers: lobby.lobbyPlayers, messageLog: lobby.messageLog }); 
      }
      else {
        console.error(`Game not found: ${gameCode}`);
        socket.emit('error', `Game not found: ${gameCode}`);
      }
    });
};