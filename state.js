let state = {};

module.exports = function state() {
  return state;
};

module.exports.get = function setState(field) {
  return state[field];
};


module.exports.set = function setState(field, value) {
  state[field] = value;
};
