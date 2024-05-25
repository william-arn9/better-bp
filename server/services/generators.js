const letterCombinations = [
  'a', 'e', 'i', 'o', 'u', // Vowels
  'b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z', // Consonants
  'th', 'ch', 'sh', 'ph', 'wh', 'qu', 'st', 'tr', 'br', 'cl', 'dr', 'fr', 'gr', 'pl', 'pr', 'sc', 'sk', 'sl', 'sp', 'sw' // Common bigrams
];
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