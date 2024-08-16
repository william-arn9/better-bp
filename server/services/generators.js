const letterCombinations = require('../assets/prompts.json');

function getRandomPrompt() {
  const randomIndex = Math.floor(Math.random() * letterCombinations.length);
  return letterCombinations[randomIndex].toUpperCase();
};

function generateGameCode() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  return code;
};

module.exports = { getRandomPrompt, generateGameCode };