const miss = require('mississippi');
const ProgressBar = require('progress');

module.exports = (cb) => {
  let progressBar = createProgressBar(Infinity);

  return miss.through.obj(
    _transform, _flush
  );

  function _transform(data, enc, done) {
    progressBar.tick(data.adds);
    done(null, data);
  }

  function _flush(done) {done()}
};

function createProgressBar(total) {
  const params = {
    total: total,
    width: 20
  };

  return new ProgressBar(' -> Uploaded :current documents', params);
}
