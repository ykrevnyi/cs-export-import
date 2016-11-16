const fs = require('fs');
const _ = require('lodash');
const miss = require('mississippi');
const JSONStream = require('JSONStream');
const CloudSearch = require('./src/CloudSearch');
const Batcher = require('./src/Batcher');
const Uploader = require('./src/Uploader');
const Debug = require('./src/Debug');
const Transform = require('./src/Transform');
const ProcessingStats = require('./src/ProcessingStats');
const UploadStats = require('./src/UploadStats');
const DocumentExtractor = require('./src/DocumentExtractor');

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

const options = {
  step: 300,
  dest: './data/export.json',
  _transform: (document, enc, done) => {
    document.type = 'add';
    document.fields.description = _.get(document, 'fields.description[0]', '');
    document.fields.isbn = _.get(document, 'fields.isbn[0]', '');
    document.fields.title = _.get(document, 'fields.title[0]', '');

    done(null, document);
  },
  _flush: done => done()
}

importDocuments({
  source: './data/export.json',
  resultDest: './data/import-result.json'
});

// exportDocuments(options);
