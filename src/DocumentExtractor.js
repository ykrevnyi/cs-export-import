const miss = require('mississippi');
const ProgressBar = require('progress');

module.exports = cb => {
  return miss.through.obj(
    _transform, _flush
  );

  function _transform(chunk, enc, done) {
    const data = JSON.parse(chunk.toString());

    data.documents.forEach(document => {
      this.push(document);
    });

    done(null);
  }

  function _flush(done) {done()}

};
