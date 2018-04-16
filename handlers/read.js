let CHUNK_SIZE = 32 * 1024; // 25k Per Cache Item
let FETCH_MULTI = 16;
// let _request = require('request-promise').defaults({ timeout: 5000 })

// let request = (...args) => {
//   return new Promise(async(resolve) => {
//     try {
//       resolve(await _request(...args))
//     } catch(e) {
//       let { error } = e;
//       if(error.code === 'ETIMEDOUT') {
//         resolve(await request(...args))
//       } else {
//         console.log(e);
//       }
//     }
//   })
// }

let request = require('../requester')

// module.exports = (conf, db, hooks, keyring) => async(path, fd, buffer, length, position, cb) => {
//   let c_start_off = position % CHUNK_SIZE;
//   let c_end_off = CHUNK_SIZE - ((position + length) % CHUNK_SIZE);
//   let c_start = Math.floor(position / CHUNK_SIZE) * CHUNK_SIZE;
//   let c_end = Math.ceil((position + length) / CHUNK_SIZE) * CHUNK_SIZE;
//   let read_length = c_end - c_start;

//   // console.log('[READ]', path, fd, buffer, length, position, cb)
//   let read = await request({
//     url: `${conf.base_url}read`,
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json'
//     },
//     encoding: null,
//     body: JSON.stringify({
//       name: path,
//       offset: c_start,
//       length: read_length,
//       user: conf.user
//     }),
//     simple: false
//   })

//   console.log('[READ]', read, c_start_off, c_end_off)

//   if(path !== "Keyring" && keyring.files[path]) {
//     read = keyring.Decrypt(path, read);
//   }

//   read = read.slice(c_start_off, c_start_off + length);

//   console.log('[Read Done]', read.length, length, read);

//   console.log('[Sliced]', c_start_off, c_end_off, c_start, c_end)

//   let len = read.length;

//   read.copy(buffer)

//   console.log(c_start, read.length, read_length)
//   console.log(read, read.length);
//   console.log(buffer, buffer.length);

//   // for(var i = 0; i < len; i++) {
//   //   buffer[i] = read[i];
//   // }

//   console.log('[READ] n:%s l:%d rl:%d bl:%d p:%d', path, len, length, buffer.length, position)
//   cb(len)
// }

let range = (start, end) => {
  let arr = [];

  for(var i = start; i <= end; i++) {
    arr.push(i);
  }

  return arr;
}

module.exports = (conf, cache, hooks, keyring) => async(path, fd, buffer, length, position, cb) => {


  let start = Date.now();

  let block_start = Math.floor(position / CHUNK_SIZE);
  let block_start_offset = position % CHUNK_SIZE;
  let block_end = Math.ceil((position + length) / CHUNK_SIZE);
  let block_end_offset = (CHUNK_SIZE - (position % CHUNK_SIZE)) % CHUNK_SIZE;

  console.log(block_end_offset)

  if(cache.contains(path, range(block_start, block_end))) {
    // Great its all in the cache, lets get it and send it to the user
    let buf = [];
    for(var i = block_start; i <= block_end; i++) {
      let block = cache.Get(path, i);
      console.log(i, block)
      buf.push(block);
    }

    buf = Buffer.concat(buf);

    let b_end = ((block_end - block_start) * CHUNK_SIZE) - block_end_offset;

    if(b_end > buf.length) {
      b_end = buf.length
    }

    let copied = buf.copy(buffer, 0, block_start_offset, b_end);

    return cb(copied);
  }

  let remote_read_end = (FETCH_MULTI * (block_end - block_start)) * CHUNK_SIZE;
  console.log("Making Read Request, Requested: %d Fetching %d", length, remote_read_end)

  let body = JSON.stringify({
    name: path,
    offset: block_start * CHUNK_SIZE,
    length: remote_read_end,
    user: conf.user
  })

  let read = await request({
    url: `${conf.base_url}read`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    encoding: null,
    body,
    simple: false
  })

  for(var i = 0; i < (read.length / CHUNK_SIZE); i++) {
    let data = read.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
    cache.Add(path, block_start + i, data);
  }

  console.log('Completed Read Request (%dms)', Date.now() - start)

  let copy_end = read.length;
  let req_end = ((block_end - block_start) * CHUNK_SIZE) - block_end_offset;
  if(req_end < copy_end) {
    copy_end = req_end;
  }

  console.log(block_start_offset, copy_end, read.length, req_end)

  let copied = read.copy(buffer, 0, block_start_offset, copy_end);
  cb(copied);
}
