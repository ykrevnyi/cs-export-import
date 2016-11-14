let fs = require('fs');
let _ = require('lodash');

console.log('reading file');
let file = fs.readFileSync('./data/staging-data.json', {encoding: 'utf-8'})

console.log('updating file');
let updated = file.replace(/\"fields\":{/gi, "\"type\":\"add\",\"fields\":{");

let documents = JSON.parse(updated).map(document => {
  document.fields.description = _.get(document, 'fields.description[0]', '');
  document.fields.isbn = _.get(document, 'fields.isbn[0]', '');
  document.fields.title = _.get(document, 'fields.title[0]', '');

  return document;
});

console.log('count');
console.log('count is', documents.length);

console.log('creating chunks');
let result = [];
let total = documents.length;
let i = 0;
documents.forEach((document, index) => {
  result.push(document);

  if (result.length === 3000) {
    console.log('Writing chunk', ++i, 'With documents', result.length);
    fs.writeFileSync(`./data/chunks/${i}.json`, JSON.stringify(result), {encoding: 'utf-8'});
    result = [];
  } else if ((index + 1) >= total) {
    console.log('Writing last chunk', i + 1, 'With documents', result.length);
    fs.writeFileSync(`./data/chunks/${i + 1}.json`, JSON.stringify(result), {encoding: 'utf-8'});
  }
});

console.log('count is', documents.length);
