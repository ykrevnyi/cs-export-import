const fs = require('fs');
const through2Concurrent = require('through2-concurrent');

module.exports = (CS, config) => {
  let count = {
    input: 0,
    output: 0
  };
  let maxConcurrency = config.maxConcurrency || 10;
  let path = config.path || `./data/chunks`;

  return through2Concurrent.obj(
    {maxConcurrency}, uploadDocuments
  );

  function uploadDocuments(document, enc, done) {
    let params = {
      contentType: 'application/json',
      documents: JSON.stringify(document)
    };

    CS.upload(params, done);
  }

};
