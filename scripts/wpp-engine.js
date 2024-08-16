const fs = require('fs');
const path = require('path');
const prompts = require('../server/assets/prompts.json');

const filePath = path.join(__dirname, '../dict.txt');
const fileContent = fs.readFileSync(filePath, 'utf-8');
const words = fileContent.split('\n').map(word => word.trim()).filter(word => word.length > 0);

const finalPrompts = [];

for(const p of prompts) {
  let count = 0;
  for(const word of words) {
    if(word.includes(p)) count++;
  }
  finalPrompts.push({prompt: p, wpp: count});
}

const jsonData = JSON.stringify(finalPrompts, null, 2); // The second argument is for pretty printing

// 3. Write the JSON string to a file
fs.writeFile('../server/assets/final-prompts.json', jsonData, (err) => {
  if (err) {
    console.error('Error writing to file', err);
  } else {
    console.log('File successfully written!');
  }
});