let request = require('request-promise');

module.exports = (conf, db, hooks, keyring) => async(name, mode, cb) => {
  let url = `${conf.base_url}create`;
  keyring.GenerateFile(name);
  let body = JSON.stringify({
    name: name,
    mode: 33206,
    user: conf.user
  })
  await request({
    url,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body
  })
  cb(0)
}
