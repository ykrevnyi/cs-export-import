let fs = require('fs');

console.log('reading file');
let file = fs.readFileSync('./data/chunks/73.json', {encoding: 'utf-8'})

console.log('counting');
const count = JSON.parse(file).length;

console.log(`Got ${count} documents`);
