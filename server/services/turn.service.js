function incrementTurn(gamePlayers, turn) {
  turn = (turn + 1) % gamePlayers.length;
  let currentPlayer = gamePlayers[turn];
  while (!currentPlayer.alive) {
    turn = (turn + 1) % gamePlayers.length;
    currentPlayer = gamePlayers[turn];
  }
  return turn;
};

module.exports = { incrementTurn };