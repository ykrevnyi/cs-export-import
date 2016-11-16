const _ = require('lodash');
const miss = require('mississippi');

module.exports = () => {

  return miss.through.obj(
    (document, enc, done) => {
      document.type = 'add';
      document.fields.description = _.get(document, 'fields.description[0]', '');
      document.fields.isbn = _.get(document, 'fields.isbn[0]', '');
      document.fields.title = _.get(document, 'fields.title[0]', '');

      done(null, document);
    },
    done => done()
  );

};
