let request = require('request-promise')
require('colors')
const CHUNK_SIZE = 4 * 1024;

let req = async(base_url, file, user, pos, buf) => {

  await request({
    url: `${base_url}write`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: file,
      offset: pos,
      buffer: [ ...buf ],
      user: user
    })
  })
}

let read_chunk = async(base_url, user, path, pos) => {
  let body = JSON.stringify({
    name: path,
    offset: pos,
    length: CHUNK_SIZE,
    user
  })

  let data = await request({
    url: `${base_url}read`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    encoding: null,
    simple: false,
    body
  })

  return data;
}

module.exports = (conf, db, hooks, keyring) => async(file, fd, buffer, length, position, cb) => {
  buffer = buffer.slice(0, length);

  if(file === 'Keyring') {
    await req(conf.base_url, file, conf.user, position, buffer)
    return cb(length)
  }

  let c_start = Math.floor(position / CHUNK_SIZE) * CHUNK_SIZE;
  let c_end = Math.ceil((position + length) / CHUNK_SIZE) * CHUNK_SIZE;

  let pre_off = position % CHUNK_SIZE;
  let end_off = (position + length) % CHUNK_SIZE;

  let final = Buffer.alloc(c_end - c_start);
  let offset = position - c_start;

  // If we aren't aligned with the chunk, we'll need to fetch decrypt and re-encrypt
  if(pre_off > 0) {
    let chunk = await read_chunk(conf.base_url, conf.user, file, c_start);
    let buf = keyring.Decrypt(file, chunk);
    buf.copy(final);
  }

  // If we aren't aligned with the chunk we'll need to fetch decrypt and re-encrypt
  if(end_off > 0 && c_start !== c_end + CHUNK_SIZE) {
    let read_start = c_end - CHUNK_SIZE;
    let chunk = await read_chunk(conf.base_url, conf.user, file, read_start);
    let buf = keyring.Decrypt(file, chunk);
    buf.copy(final, c_end - c_start - CHUNK_SIZE);

    let clen = chunk.length;
    let tot_len = clen;

    let tot_update = offset + length;

    if(tot_update > tot_len) {
      tot_len = tot_update;
    }

    console.log('[end fix]', offset, length, tot_update, tot_len)

    final = final.slice(0, tot_len);
  }

  console.log('[Final Length]', final.length, c_start, c_end, pre_off, end_off, final)

  if(final.length % CHUNK_SIZE > 0) {
    console.log(final.length)
    // process.exit();
  }

  buffer.copy(final, offset, 0, length);

  if(keyring.files[file]) {
    buffer = keyring.Encrypt(file, final);
    console.log('encrypted')
  }

  await req(conf.base_url, file, conf.user, c_start, final)
  cb(length)
}
