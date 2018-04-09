let getattr = require('./getattr');

module.exports = (conf, db, hooks, keyring) => async(path, fd, cb) => {
  cb(await getattr(conf, db, hooks, keyring)(path, cb))
}
