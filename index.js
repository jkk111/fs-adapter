process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason, Error.stack);
  // application specific logging, throwing an error, or other logic here
});



global.Promise = require('bluebird')
let Promise = require('bluebird')
Promise.config({
    // Enable warnings
    warnings: true,
    // Enable long stack traces
    longStackTraces: true,
    // Enable cancellation
    cancellation: true,
    // Enable monitoring
    monitoring: true
});

let Keyring = require('./Crypto')
let Input = require('./Input')
var fuse = require('fuse-bindings')
var mountPath = process.platform !== 'win32' ? './mnt' : 'M:\\';
let conf = require('./config.json');
let fs = require('fs');





let Cache = require('./Cache');
let cache = new Cache();

global.cache = cache;

let promisify = (...args) => {
  return new Promise(resolve => {
    let func = args[0];
    args = args.slice(1);
    args.push((...args) => {
      resolve(args)
    })
    func(...args)
  });
}

let Adapter = require('./adapter')
let keyring = null;
let mount = async() => {
  let input = new Input();
  let user = conf.user || await input.Text('Username: ');
  // let password = await input.Password();
  // let bootstrap = await input.Text('Bootstrap: (localhost) ');
  let password = ''
  keyring = new Keyring('');

  conf.user = user;

  console.log(keyring);
  console.log(`[DEBUG] Starting With User: "${user}" and Password: ${password}`)
  let adapter = Adapter(conf, cache, keyring);


  let keyring_stat = await promisify(adapter.getattr, "Keyring")
  let [ code, data ] = keyring_stat;
  console.log(code, data)


  if(code === -2 || data.size === 0) {
    data = keyring.export();
    await promisify(adapter.create, 'Keyring', 511);
    await promisify(adapter.write, 'Keyring', 0, data, data.length, 0)
  } else {
    let buf = Buffer.alloc(data.size)
    let read = await promisify(adapter.read, 'Keyring', 0, buf, data.size, 0);

    console.log(read);

    // console.log(read, buf)
    // process.exit();
    // keyring.import(buf);
  }

  keyring.changed(async(data) => {
    await promisify(adapter.write, 'Keyring', 0, data, data.length, 0)
    await promisify(adapter.truncate, 'Keyring', data.length);
  })

  fuse.mount(mountPath, adapter, ['debug'], () => {
    console.log("Here")
  });
}

mount()

process.on('SIGINT', function () {
  fuse.unmount(mountPath, function (err) {
    if (err) {
      console.log('filesystem at ' + mountPath + ' not unmounted', err)
      process.exit();
    } else {
      console.log('filesystem at ' + mountPath + ' unmounted')
    }

    if(keyring) {
      let exported = keyring.export();
      fs.writeFileSync('./keyring', exported)
    }
  })
})
