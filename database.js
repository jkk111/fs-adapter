let sql = require('sqlite3').verbose();

let table = (config) => {
  let keys = ''

  for(var key in config.keys) {
    if(keys !== '') {
      keys += ', '
    }
    keys += `${key} ${config.keys[key]}`
  }

  return `CREATE TABLE IF NOT EXISTS ${config.name} (
    ${keys}
  )`
}

let where_statement = (keys) => {
  let where = '';
  for(var key in keys) {
    if(where === '') {
      where += 'WHERE ';
    } else {
      where += ' AND '
    }

    where += key + ' ?';
  }
}

let select_statement = (table, select_keys, keys) => {
  if(Array.isArray(keys)) {
    keys = keys.join(', ');
  }
  let where = where_statement(select_keys)
  return `SELECT ${keys} FROM ${table} ${where}`
}

class Database {
  constructor(file, schema) {
    this.file = file;
    this.schema = schema;
    this.ready = false;
    this.preparing = false;
    this.queue = [];
  }

  prepare() {
    return new Promise(async(resolve) => {
      if(this.ready) {
        return resolve();
      }

      if(this.preparing) {
        return this.queue.push(resolve);
      }

      this.preparing = true;
      this.db = new sql.Database(this.file)
      for(var t of this.schema) {
        let t_query = table(t);
        await query(this.db, t_query);
      }

      this.ready = true;
      resolve();
      while(this.queue.length) {
        let res = this.queue.pop()
        res();
      }
    })
  }

  async select(table, where, keys) {
    return [];
  }

  async insert(table, keys) {
    return [];
  }

  async delete(table, where) {
    return [];
  }

  async update(table, where, set) {
    return [];
  }

  async run(query) {
    return [];
  }
}

module.exports = Database