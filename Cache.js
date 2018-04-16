const BLOCK_SIZE = 4096;
const DEF_BLOCKS = 1000;

class Cache {
  constructor(blocks = DEF_BLOCKS) {
    this.num_blocks = blocks;
    this.blocks = new Array(blocks);
    this.map = {};

    this.history = [];
  }

  _add_file(file) {
    if(!this.map[file]) {
      this.map[file] = {};
    }
  }

  _shift(index = this.num_blocks) {
    for(var file in this.map) {
      file = this.map[file];
      for(var block in file) {
        if(file[block] < index) {
          file[block]++;
          if(file[block] >= this.num_blocks) {
            delete file[block];
          }
        }
      }
    }
  }

  Add(file, block, data) {
    this._add_file(file);

    if(this.map[file][block]) {
      let index = this.map[file][block];
      this.blocks[index] = data;
      this.Get(file, block)
      return;
    }
    this._shift();
    this.blocks.unshift(data);
    this.blocks = this.blocks.slice(0, this.num_blocks);
    this.map[file][block] = 0;
  }

  Get(file, block) {
    this._add_file(file);

    let file_data = this.map[file];
    let index = file_data[block];

    if(index === undefined) {
      return null;
    } else {
      let [ block_data ] = this.blocks.splice(index, 1);

      if(block_data === undefined) {
        throw new Error("It Broke")
      }

      this._shift(index)
      this.map[file][block] = 0;
      this.blocks.unshift(block_data)
      return block_data;
    }
  }

  contains(file, arr) {
    this._add_file(file);
    file = this.map[file];

    for(var item of arr) {
      if(file[item] === undefined) {
        return false
      }
    }

    return true;
  }

  Invalidate(file, block = false) {
    if(block === false) {
      delete this.map[file]
    } else {
      let b_pos = this.map[file][block];
      if(b_pos !== undefined) {
        this.blocks[b_pos] = undefined;
      }
      delete this.map[file][block]
    }
  }
}

module.exports = Cache
