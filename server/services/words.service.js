const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../../dict.txt');
const fileContent = fs.readFileSync(filePath, 'utf-8');
const words = fileContent.split('\n').map(word => word.trim()).filter(word => word.length > 0);

function verifyRealWord(word) {
  return words.find((listWord) => word === listWord);
};

module.exports = { verifyRealWord };