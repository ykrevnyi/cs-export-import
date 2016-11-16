const miss = require('mississippi');
const ProgressBar = require('progress');

module.exports = (cb) => {
  let progressBar = null;

  return miss.through.obj(
    _transform, _flush
  );

  function _transform(chunk, enc, done) {
    const data = JSON.parse(chunk.toString());

    if (!progressBar) {
      progressBar = createProgressBar(data.total);
    }
    progressBar.tick(data.documents.length);
    if (progressBar.complete) {
      console.log(' -> Finishing up..');
    }

    done(null, chunk);
  }

  function _flush(done) {done()}
};

function createProgressBar(total) {
  const params = {
    total: total,
    width: 20
  };

  return new ProgressBar(' -> Processing [:bar] :percent (:current of :total)', params);
}