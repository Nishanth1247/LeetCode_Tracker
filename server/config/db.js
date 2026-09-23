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

// Helper function to test DB connection and initialize schema extensions if missing
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

    // Check & Add leader_id column to teams table if missing
    const [teamCols] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'teams' AND COLUMN_NAME = 'leader_id'
    `);
    if (teamCols.length === 0) {
      await connection.query(`
        ALTER TABLE teams 
        ADD COLUMN leader_id INT NULL DEFAULT NULL,
        ADD CONSTRAINT fk_teams_leader FOREIGN KEY (leader_id) REFERENCES users(id) ON DELETE SET NULL
      `);
    }

    // Check & Add assigned_to column to team_challenges table if missing
    const [challengeAssignedCols] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'team_challenges' AND COLUMN_NAME = 'assigned_to'
    `);
    if (challengeAssignedCols.length === 0) {
      await connection.query(`
        ALTER TABLE team_challenges 
        ADD COLUMN assigned_to INT NULL DEFAULT NULL,
        ADD CONSTRAINT fk_challenges_assigned FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE CASCADE
      `);
    }

    // Check & Add assignment_type column to team_challenges table if missing
    const [challengeTypeCols] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'team_challenges' AND COLUMN_NAME = 'assignment_type'
    `);
    if (challengeTypeCols.length === 0) {
      await connection.query(`
        ALTER TABLE team_challenges 
        ADD COLUMN assignment_type ENUM('TEAM', 'INDIVIDUAL') NOT NULL DEFAULT 'TEAM'
      `);
    }

    // Ensure roadmap_notes table exists (V14.5)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS roadmap_notes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        problem_slug VARCHAR(150) NULL,
        topic_id VARCHAR(150) NULL,
        note_type ENUM('UNDERSTANDING', 'APPROACH', 'MISTAKE', 'KEY_POINT', 'GENERAL') NOT NULL DEFAULT 'GENERAL',
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user (user_id),
        INDEX idx_user_problem (user_id, problem_slug),
        INDEX idx_user_topic (user_id, topic_id)
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