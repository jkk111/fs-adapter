let CHUNK_SIZE = 4096;
let request = require('request-promise');

module.exports = (conf, db, hooks, keyring) => async(path, fd, buffer, length, position, cb) => {
  let c_start_off = position % CHUNK_SIZE;
  let c_end_off = CHUNK_SIZE - ((position + length) % CHUNK_SIZE);
  let c_start = Math.floor(position / CHUNK_SIZE) * CHUNK_SIZE;
  let c_end = Math.ceil((position + length) / CHUNK_SIZE) * CHUNK_SIZE;
  let read_length = c_end - c_start;

  // console.log('[READ]', path, fd, buffer, length, position, cb)
  let read = await request({
    url: `${conf.base_url}read`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    encoding: null,
    body: JSON.stringify({
      name: path,
      offset: c_start,
      length: read_length,
      user: conf.user
    }),
    simple: false
  })

  console.log('[READ]', read, c_start_off, c_end_off)

  if(path !== "Keyring" && keyring.files[path]) {
    read = keyring.Decrypt(path, read);
  }

  read = read.slice(c_start_off, c_start_off + length);

  console.log('[Read Done]', read.length, length, read);

  console.log('[Sliced]', c_start_off, c_end_off, c_start, c_end)

  let len = read.length;

  read.copy(buffer)

  console.log(c_start, read.length, read_length)
  console.log(read, read.length);
  console.log(buffer, buffer.length);

  // for(var i = 0; i < len; i++) {
  //   buffer[i] = read[i];
  // }

  console.log('[READ] n:%s l:%d rl:%d bl:%d p:%d', path, len, length, buffer.length, position)
  cb(len)
}
