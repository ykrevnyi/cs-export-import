const fs = require('fs');
const _ = require('lodash');
const miss = require('mississippi');
const JSONStream = require('JSONStream');
const CloudSearch = require('./CloudSearch');
const Batcher = require('./streams/Batcher');
const Uploader = require('./streams/Uploader');
const Debug = require('./streams/Debug');
const Transform = require('./streams/Transform');
const ProcessingStats = require('./streams/ProcessingStats');
const UploadStats = require('./streams/UploadStats');
const DocumentExtractor = require('./streams/DocumentExtractor');

module.exports = {
  import: importDocuments,
  export: exportDocuments
};

const CS = new CloudSearch({
  endpoint: 'search-boex-staging-kzcp2zugbb6ijrvxgcz2rhe2gy.eu-west-1.cloudsearch.amazonaws.com',
  region: 'eu-west-1'
});

function importDocuments(options) {
  console.log(' -> Importing data..');

  const $input = fs.createReadStream(`${options.source}`, {encoding: 'utf-8'});

  $input
    .pipe(JSONStream.parse('*'))
    .pipe(Batcher({bufferSize: 500}))
    .pipe(Uploader(CS, {maxConcurrency: 10}))
    .pipe(UploadStats())
    .pipe(JSONStream.stringify())
    .pipe(fs.createWriteStream(`${options.resultDest}`));
}

function exportDocuments(options) {
  const $mapper = Transform(
    options._transform,
    options._flush
  );

  CS.getStream({step: options.step})
    .pipe(ProcessingStats())
    .pipe(DocumentExtractor())
    .pipe($mapper)
    .pipe(JSONStream.stringify())
    .pipe(fs.createWriteStream(`${options.dest}`))
};
