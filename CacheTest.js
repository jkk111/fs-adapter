let Cache = require('./Cache')
let cache = new Cache(4096);

cache.Add('_', 0, 0);

for(var i = 1; i <= 32; i++) {
  cache.Add('_', i, i)
}

let c7_0 = cache.Get('_', 7);
let c0_0 = cache.Get('_', 0);
let c0_1 = cache.Get('_', 0);

console.log(c7_0, c0_0, c0_1)

let readline = require('readline')

let rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})


rl.on('data', () => {
  console.log('line')
})

rl.on('line', (d) => {
  // console.log('line')
  let params = (d.toString()).split(' ');

  let [ task, file, block, data ] = params;

  if(task === 'a') {
    cache.Add(file, block, data)
  } else if(task === 'g') {
    console.log(cache.Get(file, block))
  }
})
