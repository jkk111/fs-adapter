if(!process.getuid) {
  process.getuid = () => {
    return 0;
  }
}

if(!process.getgid) {
  process.getgid = () => {
    return 0;
  }
}

let init = require('./handlers/init');
let access = null;
let statfs = require('./handlers/statfs');
let getattr = require('./handlers/getattr');
let fgetattr = require('./handlers/fgetattr');
let flush = require('./handlers/flush');
let fsync = null;
let fsyncdir = null;
let readdir = require('./handlers/readdir');
let truncate = require('./handlers/truncate');
let ftruncate = require('./handlers/ftruncate');
let readlink = null;
let chown = null;
let chmod = null;
let mknod = null;
let setxattr = null;
let getxattr = null;
let listxattr = null;
let removexattr = null;
let open = require('./handlers/open');
let opendir = require('./handlers/opendir');
let read = require('./handlers/read');
let write = require('./handlers/write');
let release = require('./handlers/release');
let releasedir = require('./handlers/releasedir');
let create = require('./handlers/create');
let utimens = require('./handlers/utimens');
let unlink = require('./handlers/unlink');
let rename = require('./handlers/rename');
let link = null;
let symlink = null;
let mkdir = require('./handlers/mkdir');
let rmdir = require('./handlers/rmdir');
let destroy = null;

let modules = {
  init,
  access,
  statfs,
  getattr,
  fgetattr,
  flush,
  fsync,
  fsyncdir,
  readdir,
  truncate,
  ftruncate,
  readlink,
  chown,
  chmod,
  mknod,
  setxattr,
  getxattr,
  listxattr,
  removexattr,
  open,
  opendir,
  read,
  write,
  release,
  releasedir,
  create,
  utimens,
  unlink,
  rename,
  link,
  symlink,
  mkdir,
  rmdir,
  destroy
}

let call_to = (method, cb) => (...args) => {
  for(var i = 0; i < args.length; i++) {
    if(typeof args[i] === 'function') {
      let _arg = args[i];
      args[i] = (...cb_args) => {
        console.log(`[${method}:CB]`, cb_args)
        _arg(...cb_args)
      }
    }
  }
  console.log(`[${method}]`, args)
  cb(...args);
}

class HookHandler {
  constructor() {
    this.hooks = {};
    this._next_id = 0x10001;
  }

  get next() {
    return this._next_id++;
  }

  create(file) {
    let fd = this.next;
    this.hooks[fd] = { file, position: 0 };
    return fd;
  }

  position(file, fd) {
    if(!this.hooks[fd]) {
      this.hooks[fd] = { file, position: 0 };
    }
    return this.hooks[fd].position;
  }

  seek(fd, count) {
    this.hooks[fd].position += count
  }

  release(fd) {
    delete this.hooks[fd];
  }
}

let dummy_module = (name) => (conf, db, hooks) => (...args) => {
  console.log("[%s] Un-implemented".red, name.blue, args)
  // process.exit();
  args.forEach(arg => {
    if(typeof arg === 'function') {
      arg();
    }
  })
}

module.exports = (conf, db, keyring) => {
  let exp = {};
  let hooks = new HookHandler();
  for(var module in modules) {
    if(!modules[module]) {
      modules[module] = dummy_module(module);
    }

    exp[module] = call_to(module, modules[module](conf, db, hooks, keyring));
  }
  exp.force = true
  exp.options = [ 'direct_io', 'debug', 'use_ino', 'fsname=Test', 'blkdev' ]
  return exp;
}
