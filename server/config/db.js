const mysql = require('mysql2/promise');

require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '0707077',
  database: process.env.DB_NAME || 'leetcode_tracker',
  port: parseInt(process.env.DB_PORT || '3306', 10),

  ssl: process.env.DB_SSL === 'true'
    ? {
        rejectUnauthorized: false
      }
    : undefined
});

// Helper function to test DB connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    connection.release();
    return true;
  } catch (error) {
    console.error('MySQL connection error:', error.message);
    return false;
  }
}

module.exports = {
  pool,
  testConnection
};