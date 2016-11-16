

module.exports = function fetchStream() {
  const cs = new CloudSearch({
    endpoint: 'search-boex-staging-kzcp2zugbb6ijrvxgcz2rhe2gy.eu-west-1.cloudsearch.amazonaws.com',
    region: 'eu-west-1'
  });
  const documents = cs.getStream({
    step: 500
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
