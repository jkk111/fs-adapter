let truncate = require('./truncate.js');

module.exports = (conf, db, hooks, keyring) => async(path, fd, size, cb) => {
  truncate(conf, cb, hooks, keyring)(path, size, cb);
}
