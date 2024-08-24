function createGamePlayer(socketData, gameSettings) {
  return {
    name: socketData.username,
    lives: gameSettings.startingLives,
    alive: true
  };
};

module.exports = { createGamePlayer };