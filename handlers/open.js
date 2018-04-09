module.exports = (conf, db, hooks) => (file, flags, cb) => {
  let fd = hooks.create(file);
  cb(0, fd)
}
