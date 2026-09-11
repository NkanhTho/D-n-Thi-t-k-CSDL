const mysql = require('mysql2/promise');
require('dotenv').config();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.getConnection()
  .then((conn) => {
    console.log('Đã kết nối MySQL thành công!');
    conn.release();
  })
  .catch((err) => console.error('Kết nối database thất bại:', err));

module.exports = db;