let request = require('request-promise')

module.exports = (conf, cb, hooks, keyring) => async(path, atime, mtime, cb) => {
  atime = new Date(atime).getTime()
  mtime = new Date(mtime).getTime()
  let body = JSON.stringify({
    name: path,
    atime,
    mtime,
    user: conf.user
  })

  await request({
    url: `${conf.base_url}utimens`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body
  })

  cb(0);
}
