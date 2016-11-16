const miss = require('mississippi');

module.exports = (cb) => {

  return miss.through.obj(
    (chunk, enc, done) => {
      cb && cb(chunk);
      done(null, chunk);
    },
    done => done()
  );

};
