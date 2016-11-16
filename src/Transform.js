const miss = require('mississippi');

module.exports = (cb) => {

  return miss.through.obj(
    cb, done => done()
  );

};
