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

let fuse = require('fuse-bindings')

module.exports = (conf, database, hooks, keyring) => async(path, cb) => {
  console.log("Path =>", path)

  let body = {
    name: path,
    user: conf.user
  }

  let contents = await request({
    url: `${conf.base_url}readdir`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body,
    json: true
  })

  if(contents.success === 'false') {
    if(fuse[contents.error]) {
      return cb(fuse[contents.error]);
    } else {
      cb(fuse.ENOENT)
    }
  }

  console.log('Path %s ', path, contents);

  return cb(0, contents)
}
