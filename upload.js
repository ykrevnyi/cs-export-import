let fs = require('fs');
let AWS = require('aws-sdk');

var csd = new AWS.CloudSearchDomain({
  endpoint: '###',
  region: 'eu-west-1'
});

// Upload
let files = fs.readdirSync('./data/chunks');
let totalFiles = files.length;
let started = 0;
let finished = 0;

console.log('starting upload');

// start(files);
start(['74.json']);

function start(files, index) {
  index = index || 0;

  console.log(`processing ${files[index]}`);

  upload(fs.createReadStream(`./data/chunks/${files[index]}`), data => {
    finished++;

    console.log(`Total: ${totalFiles}. Finished ${finished}`);

    if (files.length === finished) return console.log('done.');

    start(files, ++index);
  });
}

function upload(fileStream, done) {
  var params = {
    contentType: 'application/json',
    documents: fileStream
  };

  csd.uploadDocuments(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else done(data);
  });
}
