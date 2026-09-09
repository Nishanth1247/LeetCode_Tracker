CREATE DATABASE IF NOT EXISTS leetcode_tracker;

USE leetcode_tracker;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'MEMBER') NOT NULL DEFAULT 'MEMBER',
    google_id VARCHAR(255) NULL DEFAULT NULL UNIQUE,
    leetcode_username VARCHAR(100) NULL DEFAULT NULL,
    leetcode_total_solved INT DEFAULT 0,
    leetcode_easy_solved INT DEFAULT 0,
    leetcode_medium_solved INT DEFAULT 0,
    leetcode_hard_solved INT DEFAULT 0,
    leetcode_total_questions INT NULL DEFAULT NULL,
    leetcode_ranking INT NULL DEFAULT NULL,
    leetcode_last_synced TIMESTAMP NULL DEFAULT NULL,
    leetcode_last_activity TIMESTAMP NULL DEFAULT NULL,
    leaderboard_opt_in BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

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
