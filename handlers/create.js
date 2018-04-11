let _request = require('request-promise').defaults({ timeout: 5000 })

let request = (...args) => {
  return new Promise(async(resolve) => {
    try {
      resolve(await _request(...args))
    } catch(e) {
      if(e.code === 'ETIMEDOUT') {
        resolve(await request(...args))
      }
    }
  })
}

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
