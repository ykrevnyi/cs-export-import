const fs = require('fs');
const miss = require('mississippi');
const JSONStream = require('JSONStream');
const CloudSearch = require('./CloudSearch');
const ProgressBar = require('progress');
const Multiprogress = require("multi-progress");
const Batcher = require('./streams/Batcher');
const Uploader = require('./streams/Uploader');
const Debug = require('./streams/Debug');
const Transform = require('./streams/Transform');
const ProcessingStats = require('./streams/ProcessingStats');
const UploadStats = require('./streams/UploadStats');
const DocumentExtractor = require('./streams/DocumentExtractor');

const multibar = new Multiprogress(process.stderr);

module.exports = {
  sync: syncDocuments,
  import: importDocuments,
  export: exportDocuments
};

const CS = new CloudSearch({
  endpoint: 'search-boex-staging-kzcp2zugbb6ijrvxgcz2rhe2gy.eu-west-1.cloudsearch.amazonaws.com',
  region: 'eu-west-1'
});

function syncDocuments(options) {
  options = options || {};

  if (!options._transform) throw new Error('You have to implement _transform function!');

  const flush = options.flush || function(done) {done()};
  const step = options.step || 500;
  const resultPath = options.resultPath || './data/import-result.json';

  const $mapper = Transform(
    options._transform, flush
  );

  console.log(' -> Syncing CloudSearch Domains');

  sourceCS = new CloudSearch({
    endpoint: 'search-boex-staging-kzcp2zugbb6ijrvxgcz2rhe2gy.eu-west-1.cloudsearch.amazonaws.com',
    region: 'eu-west-1'
  });
  destCS = new CloudSearch({
    endpoint: 'search-test2-mixixtnbbi42nix7eyb73vyyda.eu-west-1.cloudsearch.amazonaws.com',
    region: 'eu-west-1'
  });

  sourceCS.getStream({step: step})
    .pipe(ProcessingStats(multibar))
    .pipe(DocumentExtractor())
    .pipe($mapper)
    .pipe(Batcher({bufferSize: 500}))
    .pipe(Uploader(destCS, {maxConcurrency: 10}))
    .pipe(UploadStats(multibar))
    .pipe(JSONStream.stringify())
    .pipe(fs.createWriteStream(resultPath));
}

function importDocuments(options) {
  options = options || {};
  const sourcePath = options.sourcePath || './data/export.json';
  const resultPath = options.resultPath || './data/import-result.json';

  console.log(' -> Importing data..');

  const $input = fs.createReadStream(sourcePath, {encoding: 'utf-8'});
  $input
    .pipe(JSONStream.parse('*'))
    .pipe(Batcher({bufferSize: 500}))
    .pipe(Uploader(CS, {maxConcurrency: 10}))
    .pipe(UploadStats())
    .pipe(JSONStream.stringify())
    .pipe(fs.createWriteStream(resultPath));
}

function exportDocuments(options) {
  options = options || {};

  if (!options._transform) throw new Error('You have to implement _transform function!');

  const flush = options.flush || function(done) {done()};
  const step = options.step || 500;
  const resultPath = options.resultPath || './data/export.json';

  const $mapper = Transform(
    options._transform, flush
  );

  CS.getStream({step: step})
    .pipe(ProcessingStats())
    .pipe(DocumentExtractor())
    .pipe($mapper)
    .pipe(JSONStream.stringify())
    .pipe(fs.createWriteStream(resultPath));
};
