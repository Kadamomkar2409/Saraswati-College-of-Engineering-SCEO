const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const isRemoteDb = process.env.DB_HOST && process.env.DB_HOST !== 'localhost' && process.env.DB_HOST !== '127.0.0.1';
const useSSL = process.env.DB_SSL === 'true' || (process.env.DB_SSL !== 'false' && isRemoteDb);

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'college_sms_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
  ssl: useSSL ? { rejectUnauthorized: false } : undefined
});

module.exports = pool;
