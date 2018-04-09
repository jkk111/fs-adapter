let request = require('request-promise');

module.exports = (conf, db, hooks) => async(path, cb) => {
  let body = JSON.stringify({
    name: path,
    user: conf.user
  })
  await request({
    url: `${conf.base_url}unlink`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body
  })

  cb(0)
}
