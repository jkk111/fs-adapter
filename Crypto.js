let crypto = require('crypto')
let algo = 'aes-256-ctr';

const CHUNK_SIZE = 4096;

let key_len = 32;
let iv_len = 16;

let salt = 'salt';
let iterations = 1000;
let digest = 'sha512'

let generate_key = () => crypto.randomBytes(key_len);
let generate_iv = () => crypto.randomBytes(iv_len);

let derive_key = (password) => crypto.pbkdf2Sync(password, salt, iterations, key_len, digest)


let encrypt = (buf, iv, pass) => {
  let cipher = crypto.createCipheriv(algo, pass, iv);
  let encrypted = cipher.update(buf);
  return encrypted
}

let decrypt = (buf, iv, pass) => {
  let cipher = crypto.createDecipheriv(algo, pass, iv);
  let decrypted = cipher.update(buf)
  return decrypted
}

class Crypto {
  constructor(pass) {
    this.key = derive_key(pass);
    console.log('key', this.key);
    this.files = {};
    this.listeners = [];
  }

  GenerateFile(filename) {
    return;
    if(filename === 'Keyring') {
      return
    }
    let aes = generate_key();
    let iv = generate_iv();
    this.files[filename] = { aes, iv };
    console.log(`Generated Keys For ${filename}`)
    this.notify();
  }

  notify() {
    let exported = this.export();
    for(var ln of this.listeners) {
      ln(exported)
    }
  }

  move(src, dst) {
    if(this.files[src]) {
      this.files[dst] = this.files[src];
      delete this.files[src];
      this.notify();
    }
  }

  changed(cb) {
    this.listeners.push(cb);
  }

  import(data) {
    let iv = data.slice(0, iv_len)
    data = data.slice(iv_len)
    data = decrypt(data, iv, this.key);
    console.log(data.toString());
    data = JSON.parse(data.toString());
    for(var file in data) {
      data[file] = {
        aes: Buffer.from(data[file].aes),
        iv: Buffer.from(data[file].iv)
      }
      this.files[file] = data[file];
    }
  }

  export() {
    let iv = generate_iv();
    let data = Buffer.from(JSON.stringify(this.files));
    data = encrypt(data, iv, this.key);
    return Buffer.concat([ iv, data ])
  }

  Encrypt(filename, data) {
    if(!this.files[filename]) {
      return data;
    }
    let { iv, aes } = this.files[filename];

    let buf = Buffer.alloc(data.length);

    let i = 0;

    while(i < data.length) {
      let slice = data.slice(i, i + CHUNK_SIZE);
      let chunk = encrypt(slice, iv, aes);
      chunk.copy(buf, i);
      i += slice.length;
    }

    console.log('[Encrypt]', data.length, buf.length)

    return buf;
  }

  Decrypt(filename, data) {
    if(!this.files[filename]) {
      return data;
    }
    let { iv, aes } = this.files[filename];

    let buf = Buffer.alloc(data.length);

    let i = 0;

    while(i < data.length) {
      let slice = data.slice(i, i + CHUNK_SIZE);
      let chunk = decrypt(slice, iv, aes);
      chunk.copy(buf, i);
      i += slice.length;
    }

    console.log('[Decrypt]', data.length, buf.length)
    console.log(data);
    console.log(buf);

    return buf;
  }
}


let test = () => {
  let buf = Buffer.from('Hello World')

  let c = new Crypto("Fuck It");
  c.GenerateFile("index.js")
  let enc = c.Encrypt('index.js', 'Hello World')

  let c2 = new Crypto('Fuck It');
  c2.import(c.export())
  let dec = c2.Decrypt('index.js', enc)
  console.log(c2.Encrypt('index.js', 'Hell'), enc)
  console.log(dec)
}

if(!module.parent) {
  test();
}

module.exports = Crypto
