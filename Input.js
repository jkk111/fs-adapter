let readline = require('readline');
let { Writable } = require('stream');

class MutableStdout extends Writable {
  constructor(...args) {
    super(...args)
    this.muted = true;
  }

  write(c, enc, cb) {
    if(!this.muted) {
      process.stdout.write(c, enc)
    }
    if(cb) cb();
  }
}

class Input {
  constructor() {
    this.stdout = new MutableStdout();
    this.rl = readline.createInterface({
      input: process.stdin,
      output: this.stdout,
      terminal: true
    })

    this.Input = this.Input.bind(this);
    this.Password = this.Password.bind(this);
    this.Text = this.Text.bind(this);
    this.close = this.close.bind(this);
  }

  Input(prompt = '') {
    return new Promise(resolve => {
      this.rl.question(prompt, (response) => {
        if(this.stdout.muted) {
          process.stdout.write('\n')
        }
        resolve(response)
      })
    })
  }

  Password() {
    this.stdout.muted = true;
    process.stdout.write('Password: ');
    return this.Input()
  }

  Text(prompt) {
    this.stdout.muted = false;
    return this.Input(prompt);
  }

  close() {
    this.rl.close();
  }
}

module.exports = Input
