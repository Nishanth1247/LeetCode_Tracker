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

CREATE TABLE IF NOT EXISTS teams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS team_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_id INT NOT NULL,
    user_id INT NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS team_challenges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT NULL,
    difficulty ENUM('EASY','MEDIUM','HARD','MIXED') NOT NULL,
    target INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('ACTIVE','COMPLETED','EXPIRED') DEFAULT 'ACTIVE',
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_team_status (team_id, status)
);

CREATE TABLE IF NOT EXISTS leetcode_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    problem_title VARCHAR(255) NOT NULL,
    problem_slug VARCHAR(255) NOT NULL,
    difficulty ENUM('EASY','MEDIUM','HARD') NULL,
    language VARCHAR(100) NULL,
    solved_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_solved_at (user_id, solved_at),
    INDEX idx_user_problem (user_id, problem_slug),
    UNIQUE KEY uniq_user_problem_solved (user_id, problem_slug, solved_at)
);
