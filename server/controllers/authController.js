const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { pool } = require('../config/db');

// Helper to validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Field validation
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Name is required.',
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email is required.',
      });
    }

    if (!isValidEmail(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user already exists
    const [existingUsers] = await pool.query('SELECT id FROM users WHERE email = ?', [cleanEmail]);
    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Force role to MEMBER, leaderboard_opt_in to FALSE, and leetcode_username to NULL
    await pool.query(
      'INSERT INTO users (name, email, password, role, leetcode_username, leaderboard_opt_in) VALUES (?, ?, ?, ?, ?, ?)',
      [name.trim(), cleanEmail, hashedPassword, 'MEMBER', null, false]
    );

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during registration.',
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Find user by email
    const [users] = await pool.query(
      'SELECT id, name, email, password, role, leetcode_username, leaderboard_opt_in FROM users WHERE email = ?',
      [cleanEmail]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const user = users[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        leetcode_username: user.leetcode_username,
        leaderboard_opt_in: Boolean(user.leaderboard_opt_in),
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during login.',
    });
  }
};

exports.googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: 'Google credential (ID token) is required.',
      });
    }

    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    const client = new OAuth2Client(googleClientId);

    // Verify ID token with google-auth-library
    let payload;
    try {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: googleClientId || undefined,
      });
      payload = ticket.getPayload();
    } catch (verifyError) {
      console.error('Google ID token verification failed:', verifyError.message);
      return res.status(400).json({
        success: false,
        message: 'Invalid or unverified Google token.',
      });
    }

    // Require verified Google email
    if (!payload || !payload.email_verified) {
      return res.status(400).json({
        success: false,
        message: 'Unverified Google email account.',
      });
    }

    const googleId = payload.sub;
    const cleanEmail = payload.email.trim().toLowerCase();
    const name = payload.name || 'Google User';

    // 1. Check if user exists by google_id
    const [existingByGoogleId] = await pool.query(
      'SELECT id, name, email, role, leetcode_username, leaderboard_opt_in FROM users WHERE google_id = ?',
      [googleId]
    );

    let user;

    if (existingByGoogleId.length > 0) {
      user = existingByGoogleId[0];
    } else {
      // 2. Check if user exists by verified email
      const [existingByEmail] = await pool.query(
        'SELECT id, name, email, role, google_id, leetcode_username, leaderboard_opt_in FROM users WHERE email = ?',
        [cleanEmail]
      );

      if (existingByEmail.length > 0) {
        const foundUser = existingByEmail[0];

        // Reject if google_id belongs to another account
        if (foundUser.google_id && foundUser.google_id !== googleId) {
          return res.status(400).json({
            success: false,
            message: 'This email account is already linked to another Google ID.',
          });
        }

        // Link google_id without overwriting password or reset settings
        if (!foundUser.google_id) {
          await pool.query('UPDATE users SET google_id = ? WHERE id = ?', [googleId, foundUser.id]);
        }

        user = foundUser;
      } else {
        // 3. Create new user for Google login
        const defaultPasswordHash = await bcrypt.hash('GOOGLE_AUTH_NO_PASSWORD_' + Date.now(), 10);

        const [insertResult] = await pool.query(
          'INSERT INTO users (name, email, password, role, google_id, leetcode_username, leaderboard_opt_in) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [name, cleanEmail, defaultPasswordHash, 'MEMBER', googleId, null, false]
        );

        const newUserId = insertResult.insertId;
        const [newUserRows] = await pool.query(
          'SELECT id, name, email, role, leetcode_username, leaderboard_opt_in FROM users WHERE id = ?',
          [newUserId]
        );
        user = newUserRows[0];
      }
    }

    // Issue application JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      success: true,
      message: 'Google authentication successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        leetcode_username: user.leetcode_username,
        leaderboard_opt_in: Boolean(user.leaderboard_opt_in),
      },
    });
  } catch (error) {
    console.error('googleAuth error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during Google authentication.',
    });
  }
};
