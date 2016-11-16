const _ = require('lodash');
const Stream = require('stream');

class Mapper extends Stream.Transform {

  constructor(options) {
    super(options);
  }

  _transform(document, enc, done) {
    document.type = 'add';
    document.fields.description = _.get(document, 'fields.description[0]', '');
    document.fields.isbn = _.get(document, 'fields.isbn[0]', '');
    document.fields.title = _.get(document, 'fields.title[0]', '');

    done(null, document);
  }

  _flush(done) {
    done(null);
  }

}

module.exports = Mapper;
