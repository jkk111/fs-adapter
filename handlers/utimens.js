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
