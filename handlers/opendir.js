module.exports = (conf, db, hooks) => (path, flags, cb) => {
  let fd = hooks.create(path)
  cb(0, fd)
}