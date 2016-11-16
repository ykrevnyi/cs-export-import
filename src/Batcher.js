const _ = require('lodash');
const Stream = require('stream');

class Batcher extends Stream.Transform {

  constructor(options) {
    super(options);

    this.buffer = [];
    this.bufferSize = options.bufferSize || 10;
  }

  _transform(document, enc, done) {
    this.buffer.push(document);

    if (this.buffer.length >= this.bufferSize) {
      this.push(this.buffer);
      this.buffer = [];
    }
    done();
  }

  _flush(done) {
    if (this.buffer.length) {
      this.push(this.buffer);
      this.buffer = [];
    }

    done();
  }

}

module.exports = Batcher;
