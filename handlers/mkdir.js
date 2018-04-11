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
