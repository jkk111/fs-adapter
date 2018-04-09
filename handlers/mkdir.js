let request = require('request-promise')

module.exports = (conf) => async(path, mode, cb) => {
  let body = JSON.stringify({
    name: path,
    mode: 16676,
    user: conf.user
  })
  await request({
    url: `${conf.base_url}mkdir`,
    headers: {
      'Content-Type': 'application/json'
    },
    body
  })
  cb(0);
}
