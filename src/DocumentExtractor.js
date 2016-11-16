const miss = require('mississippi');
const ProgressBar = require('progress');

module.exports = (cb) => {
  return miss.through.obj(
    function(chunk, enc, done) {
      const data = JSON.parse(chunk.toString());

      data.documents.forEach(document => {
        this.push(document);
      });

      done(null);
    },
    done => done()
  );

};
