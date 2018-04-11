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
