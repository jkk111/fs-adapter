let request = require('request-promise');

let buf = Buffer.alloc(1024 * 1024)

for(var i = 0; i < buf.length; i++) {
  buf[i] = i % 128;
}

let fsadapter = require('./adapter');

let conf = {
  base_url: "http://localhost:8080/api/",
  user: "jkk"
}

let adapter = fsadapter(conf, null, { GenerateFile: () => {}, files: {} });

let validate = (buf) => {
  for(var i = 0; i < buf.length; i++) {
    if(buf[i] !== (i % 128)) {
      console.error(i);
    }
  }
}

adapter.create('/test', 511, () => {
  adapter.write("/test", 0, buf, 1024 * 1024, 0, () => {
    buf.fill(0);
    adapter.read('/test', 0, buf, 1024 * 1024, 0, () => {
      console.log('read')
      validate(buf);
    })
    console.log('written')
  })
})

console.log(buf)
