require('colors')
let fuse = require('fuse-bindings')
let _request = require('request-promise').defaults({ timeout: 5000 })

let request = (...args) => {
  if(typeof args[0] === 'object') {
    let req = args[0];
    req.retries = req.retries || 5;
  } else {
    args[0] = {
      url: args[0],
      retries: 5
    }
  }


  return new Promise(async(resolve) => {
    try {
      resolve(await _request(...args))
    } catch(e) {
      let { error } = e;
      console.log(JSON.stringify(e));
      args[0].retries--;
      if(error.code === 'ETIMEDOUT' && args[0].retries > 0) {
        resolve(await request(...args))
      } else {
        console.log(e.code, e.name);
        throw e;
      }
    }
  })
}

module.exports = (conf) => async(path, cb) => {
  let url = `${conf.base_url}stat`;
  let body = {
    name: path,
    user: conf.user
  }
  console.log(url);
  let stat = await request({
    url,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    json: true
  })

  console.log('Stat Response')

  if(stat.error) {
    console.error("ENOENT".red, path.blue)
    return cb(fuse.ENOENT)
  }

  // console.log(stat)

  cb(0, {
    dev: 428019991,
    fsid: 428019991,
    _dev: 1000,
    mtime: new Date(stat.modified / 1000000),
    atime: new Date(stat.accessed / 1000000),
    ctime: new Date(stat.created / 1000000),
    st_ino: 8,
    ino: 1e9 + 32 + '',
    _ino: 8,
    nlink: 1,
    size: stat.size,
    mode: stat.mode,
    uid: process.getuid ? process.getuid() : 0,
    gid: process.getgid ? process.getgid() : 0
  })
}
