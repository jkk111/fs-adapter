module.exports = (conf, db, hooks) => (path, fd, cb) => {
  hooks.release(fd)
  cb(0)
}