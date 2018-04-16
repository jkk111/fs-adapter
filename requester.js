let _request = require('request-promise');

const DEF_TIMEOUT = 10000

const RECOVERABLE = [
  "ETIMEDOUT",
  "ESOCKETTIMEDOUT"
]

let request = (req) => {
  if(typeof req === 'object') {
    req.retries = req.retries || 5;
    req.timeout = req.timeout || DEF_TIMEOUT;
  }

  return new Promise(async(resolve) => {
    try {
      resolve(await _request(req))
    } catch(e) {
      console.log(e);
      let { error } = e;
      console.log(JSON.stringify(e));
      req.retries--;
      if(RECOVERABLE.includes(error.code) && req.retries > 0) {
        resolve(await request(req))
      } else {
        console.log(e.code, e.name);
        throw e;
      }
    }
  })
}

module.exports = (req) => {
  if(typeof req !== 'object') {
    throw new Error("Must Specify Request Object")
  }

  req.retries = req.retries || 5;

  return request(req);
}
