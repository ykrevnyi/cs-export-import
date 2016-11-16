const miss = require('mississippi');

module.exports = transform => {

  return miss.through.obj(
    transform, done => done()
  );

};
