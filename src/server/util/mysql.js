const mysql = require('mysql');

const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_PORT_3306_TCP_ADDR || 'localhost',
  user: process.env.DB_ENV_MYSQL_USER || 'root',
  password: process.env.DB_ENV_MYSQL_PASSWORD || '',
  database: process.env.DB_ENV_MYSQL_DATABASE || 'forge-db',
  port: process.env.DB_PORT_3306_TCP_PORT || 3306,
});

process.on('beforeExit', () => {
  pool.end();
});

module.exports = pool;