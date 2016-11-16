const _ = require('lodash');
const miss = require('mississippi');
const Promise = require('bluebird');
const ProgressBar = require('progress');
const JSONStream = require('JSONStream');
const BatchStream = require('batch-stream');
const fs = require('fs');
const Stream = require('stream');
const CloudSearchDomain = require('./src/CloudSearchDomain');
const CloudSearchStream = require('./src/CloudSearchStream');
const Mapper = require('./src/Mapper');
const Mapper2 = require('./src/Mapper2');
const Batcher = require('./src/Batcher');
const Chunker = require('./src/Chunker');
const Uploader = require('./src/Uploader');
const Debug = require('./src/Debug');
const ProcessingStats = require('./src/ProcessingStats');
const DocumentExtractor = require('./src/DocumentExtractor');
const Transform = require('./src/Transform');

let csd = new CloudSearchDomain({
  endpoint: 'search-test-hjp7plskkkzj5zhe7taidjswkq.eu-west-1.cloudsearch.amazonaws.com',
  region: 'eu-west-1'
});

const params = {
  query: '*',
  cursor: 'initial',
  queryParser: 'lucene',
  size: 100
};

function getData() {
  csd
    .fetch([], 'initial', 10000, 0)
    .then(data => {
      console.log(`Got ${data.length} rows`);

      return data;
    })
    .then(Mapper.transform)
    .then(data => {
      console.log(`Writing data to file`);

      return fs.writeFile('result.json', JSON.stringify(data), {encoding: 'utf-8'});
    })
    .then(data => {
      console.log('done.');
    })
    .catch(err => console.log('failed', err))
}

let i = 0;
let pumped = 0;
function uploadData() {
  let $input = fs.createReadStream('result.json', {encoding: 'utf-8'});

  $input
    .pipe(JSONStream.parse('*'))
    .pipe(new Mapper({objectMode: true}))
    .pipe(new Batcher({bufferSize: 10, objectMode: true}))
    .pipe(Uploader(csd, {maxConcurrency: 10}))

    .pipe(Debug(chunk => {
      console.log('hi there', chunk);
    }))
    // .pipe(Chunker({maxConcurrency: 10}))

    // .pipe(fs.createWriteStream(`./data/chunks/${i++}.json`))
    .pipe(process.stdout)
}

function fetchStream() {
  const documents = new CloudSearchStream({
    endpoint: 'search-test-hjp7plskkkzj5zhe7taidjswkq.eu-west-1.cloudsearch.amazonaws.com',
    region: 'eu-west-1'
  });
  const mapper = miss.through.obj(
    (document, enc, done) => {
      document.type = 'add';
      document.fields.description = _.get(document, 'fields.description[0]', '');
      document.fields.isbn = _.get(document, 'fields.isbn[0]', '');
      document.fields.title = _.get(document, 'fields.title[0]', '');

      done(null, document);
    },
    done => done()
  );

  documents
    .pipe(ProcessingStats())
    .pipe(DocumentExtractor())
    .pipe(mapper)
    .pipe(JSONStream.stringify())
    .pipe(fs.createWriteStream('./data/test.json'))

  miss.finished(documents, err => {
    err && console.log(err);

    console.log(' -> Done!');
  })
};


fetchStream();

// uploadData()
