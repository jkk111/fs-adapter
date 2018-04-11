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

module.exports = (conf, db, hooks, keyring) => async(src, dst, cb) => {
  let body = JSON.stringify({
    name: src,
    updated: dst,
    user: conf.user
  })


  keyring.move(src, dst)

  await request({
    url: `${conf.base_url}rename`,
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body
  })

  cb(0)
}
