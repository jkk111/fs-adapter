let request = require('request-promise');

module.exports = (conf, db, hooks, keyring) => (path, size, cb) => {
  let body = {
    name: path,
    user: conf.user,
    size: size
  }
  request({
    url: `${conf.base_url}truncate`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })
  cb(0);
}
