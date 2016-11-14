let fs = require('fs');
let AWS = require('aws-sdk');

var csd = new AWS.CloudSearchDomain({
  endpoint: '###',
  region: 'eu-west-1'
});

fetch([], 'initial', 5000, 0, data => {
  console.log('writing file');
  fs.writeFileSync('./data/staging-data.json', JSON.stringify(data), {encoding: 'utf-8'});
  console.log('done.');
});

function fetch(documents, cursor, step, processed, done) {
  var params = {
    query: '*',
    cursor: cursor,
    queryParser: 'lucene',
    size: step
  };

  csd.search(params, function(err, data) {
    if (err) return console.log(err, err.stack);

    let total = data.hits.found;
    documents = documents.concat(data.hits.hit);
    processed += step;

    console.log(`Processed ${processed} of ${total}`);

    if (processed >= total) {
      return done(documents);
    }

    fetch(documents, data.hits.cursor, step, processed, done);
  });
}
