const mysql = require('mysql');

const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'root',
  // password: '',
  database: 'forge',
  // port: 32771,
  // debug: true
});

process.on('beforeExit', () => {
  pool.end();
});

module.exports = pool;