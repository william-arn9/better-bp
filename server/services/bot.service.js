const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../../dict.txt');
const fileContent = fs.readFileSync(filePath, 'utf-8');
const words = fileContent.split('\n').map(word => word.trim()).filter(word => word.length > 0);

function configureBotPlayers(socketData, gameProps) {
  const { game, settings } = gameProps;
  settings.bot = socketData.bot;
  const botPlayer = {
    name: 'Bot',
    lives: settings.startingLives,
    alive: true,
    bot: true
  };
  game.gamePlayers.push(botPlayer);
}

function botPlays(gamePlayers, turn, prompt) {
  console.log(`Bot attempting to play prompt: ${prompt}`);
  if(gamePlayers[turn].bot) {
    const minWords = words.filter((w) => w.includes(prompt));
    const randomIndex = Math.floor(Math.random() * minWords.length);
    return minWords[randomIndex].toUpperCase();
  }
  return false;
};

module.exports = { botPlays, configureBotPlayers };