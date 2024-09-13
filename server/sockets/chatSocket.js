const gameManager = require('../managers/gameManager');
const eventManager = require('../managers/socketEventManager');

module.exports = (socket, io) => {
    socket.on('sendMessage', ({gameCode, data}) => {
      const gameProps = gameManager.getGame(gameCode);
      if(gameProps) {
        gameProps.pushChat(data);
        const lobby = gameProps.getLobby();
        eventManager.emitLobbyUpdate(io, gameCode, lobby);
      }
      else {
        console.error(`Game not found: ${gameCode}`);
        eventManager.emitError(socket, `Game not found: ${gameCode}`);
      }
    });
};