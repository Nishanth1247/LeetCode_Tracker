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

// Helper function to test DB connection and initialize user_goals schema if missing
async function testConnection() {
  try {
    const connection = await pool.getConnection();

    // Ensure user_goals table exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_goals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL UNIQUE,
        monthly_problem_goal INT NOT NULL DEFAULT 30,
        daily_problem_goal INT NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

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