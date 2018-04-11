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

module.exports = (conf, db, hooks) => async(path, cb) => {
  let body = JSON.stringify({
    name: path,
    user: conf.user
  })

  await request({
    url: `${conf.base_url}rmdir`,
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body
  })
  cb(0)
}
