let request = require('request-promise')

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
