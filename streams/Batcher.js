const miss = require('mississippi');

module.exports = (options) => {
  let buffer = [];
  let bufferSize = options.bufferSize || 10;

  return miss.through.obj(
    _transform, _flush
  );

  function _transform(document, enc, done) {
    buffer.push(document);

    if (buffer.length >= bufferSize) {
      this.push(buffer);
      buffer = [];
    }

    done();
  }

  function _flush(done) {
    if (buffer.length) {
      this.push(buffer);
      buffer = [];
    }

    done();
  }

};
