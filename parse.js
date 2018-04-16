let fs = require('fs')
let re = /\[getattr\]\s\[\s\'(.*?)\',.*\]\s\](.|\s)*?\[getattr:CB\]\s\[\s((-)?\d)(,(.|\s)*?\])?/gm
let input = fs.readFileSync('./log.txt', 'utf8');

let readline = require('readline')
let rl = readline.createInterface({ input: process.stdin, output: process.stdout })

let line = () => {
  return new Promise(resolve => {
    rl.question('Continue: <Enter>', resolve)
  })
}


let run = async() => {
  let match = re.exec(input)

  while(match) {
    console.log(match[1], match[3], match[5]);

    console.log(match[0].length, input.length)

    // input = input.slice(match[0].length)

    match = re.exec(input);
    await line();
  }

  rl.close();
}

run();
