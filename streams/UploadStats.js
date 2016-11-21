const miss = require('mississippi');
const ProgressBar = require('progress');
const appState = require('../state');

module.exports = multibar => {
  let progressBar;

  return miss.through.obj(
    _transform, _flush
  );

  function _transform(data, enc, done) {
    if (!progressBar) {
      progressBar = createProgressBar(multibar, appState.get('total'));
    }
    progressBar.tick(data.adds);
    if (progressBar.complete) {
      console.log(' -> Finishing up..');
    }
    done(null, data);
  }

  function _flush(done) {done()}
};

function createProgressBar(multibar, total) {
  const params = {
    total: total,
    width: 20
  };

  return multibar.newBar(' -> Uploading  [:bar] :percent (:current of :total)', {
    complete: '=',
    incomplete: '-',
    width: 30,
    total: total
  });
}
