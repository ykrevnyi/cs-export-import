const fs = require('fs');
const through2Concurrent = require('through2-concurrent');

module.exports = (csd, config) => {
  let index = 0;
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

    csd.upload(params)
      .then(data => {
        done(null, JSON.stringify(data))
      })
      .catch(err => {
        console.log('errrr', err);
      });
  }

}
