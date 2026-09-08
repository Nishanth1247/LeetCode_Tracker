const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function runMigrationAndSeed() {
  console.log('--- Starting Database Migration & Admin Seeding Script ---');
  let connection;

  try {
    const host = process.env.DB_HOST || 'localhost';
    const user = process.env.DB_USER || 'root';
    const password = process.env.DB_PASSWORD || '';
    const dbName = process.env.DB_NAME || 'leetcode_tracker';
    const port = parseInt(process.env.DB_PORT || '3306', 10);

    // Connect to MySQL server
    connection = await mysql.createConnection({ host, user, password, port });
    
    // Create database if not exists
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    await connection.query(`USE \`${dbName}\`;`);

    // Create users table if not exists
    const createUsersTableSQL = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('ADMIN', 'MEMBER') NOT NULL DEFAULT 'MEMBER',
        leetcode_username VARCHAR(100) NULL DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `;
    await connection.query(createUsersTableSQL);

    // Idempotent Migration: Add V2/V4 columns to users if they do not exist
    const columnsToEnsure = [
      { name: 'leetcode_total_solved', spec: 'INT DEFAULT 0' },
      { name: 'leetcode_easy_solved', spec: 'INT DEFAULT 0' },
      { name: 'leetcode_medium_solved', spec: 'INT DEFAULT 0' },
      { name: 'leetcode_hard_solved', spec: 'INT DEFAULT 0' },
      { name: 'leetcode_total_questions', spec: 'INT NULL DEFAULT NULL' },
      { name: 'leetcode_ranking', spec: 'INT NULL DEFAULT NULL' },
      { name: 'leetcode_last_synced', spec: 'TIMESTAMP NULL DEFAULT NULL' },
      { name: 'leetcode_last_activity', spec: 'TIMESTAMP NULL DEFAULT NULL' },
    ];

    for (const col of columnsToEnsure) {
      const [existingCols] = await connection.query(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = ?`,
        [dbName, col.name]
      );

      if (existingCols.length === 0) {
        console.log(`[MIGRATION] Adding column '${col.name}' to 'users' table...`);
        await connection.query(`ALTER TABLE users ADD COLUMN ${col.name} ${col.spec};`);
      }
    }

    // V6 Migration: Create leetcode_stats_history table if not exists
    const createHistoryTableSQL = `
      CREATE TABLE IF NOT EXISTS leetcode_stats_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        total_solved INT NOT NULL DEFAULT 0,
        easy_solved INT NOT NULL DEFAULT 0,
        medium_solved INT NOT NULL DEFAULT 0,
        hard_solved INT NOT NULL DEFAULT 0,
        recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_recorded (user_id, recorded_at)
      );
    `;
    await connection.query(createHistoryTableSQL);
    console.log('[MIGRATION] Table leetcode_stats_history verified/created.');

    // Admin Seeding
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@example.com').trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    const [existing] = await connection.query('SELECT id FROM users WHERE email = ?', [adminEmail]);

    if (existing.length > 0) {
      console.log(`[INFO] Admin user '${adminEmail}' already exists.`);
    } else {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await connection.query(
        'INSERT INTO users (name, email, password, role, leetcode_username) VALUES (?, ?, ?, ?, ?)',
        ['Admin User', adminEmail, hashedPassword, 'ADMIN', null]
      );
      console.log(`[SUCCESS] Admin user '${adminEmail}' created successfully!`);
    }
  } catch (error) {
    console.error('[ERROR] Migration/Seed failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
    console.log('--- Database Migration & Seeding Complete ---');
  }
}

runMigrationAndSeed();
