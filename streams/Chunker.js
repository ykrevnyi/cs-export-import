const fs = require('fs');
const through2Concurrent = require('through2-concurrent');

module.exports = function (config) {
  let index = 0;
  let maxConcurrency = config.maxConcurrency || 10;
  let path = config.path || `./data/chunks`;

  return through2Concurrent.obj(
    {maxConcurrency: maxConcurrency},
    function(document, enc, done) {
      const filename = `${path}/${index++}.json`;

      createFile(filename, document, done);
    }
  );

  function createFile(name, data, done) {
    let self = this;

    fs.writeFile(
      name,
      JSON.stringify(data),
      {encoding: 'utf-8'},
      function(err, data) {
        console.log(err, data);
        done(null);
      }
    )
  }
}
