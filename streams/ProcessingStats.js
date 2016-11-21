const miss = require('mississippi');
const ProgressBar = require('progress');
const appState = require('../state');

module.exports = multibar => {
  let progressBar = null;

  return miss.through.obj(
    _transform, _flush
  );

  function _transform(chunk, enc, done) {
    const data = JSON.parse(chunk.toString());

    appState.set('total', data.total);
    if (!progressBar) {
      progressBar = createProgressBar(multibar, data.total);
    }
    progressBar.tick(data.documents.length);
    if (progressBar.complete) {
      console.log(' -> Finishing up..');
    }

    done(null, chunk);
  }

  function _flush(done) {done()}
};

function createProgressBar(multibar, total) {
  return multibar.newBar(' -> Processing [:bar] :percent (:current of :total)', {
    complete: '=',
    incomplete: '-',
    width: 30,
    total: total
  });
}
