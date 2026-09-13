const { pool } = require('../config/db');
const leetcodeService = require('../services/leetcodeService');

// ADMIN ONLY: Get all MEMBER accounts with team info & stats
exports.getAdminUsers = async (req, res) => {
  try {
    const [users] = await pool.query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.role,
        u.leetcode_username as leetcodeUsername,
        u.leetcode_total_solved as leetcodeTotalSolved,
        u.leetcode_easy_solved as leetcodeEasySolved,
        u.leetcode_medium_solved as leetcodeMediumSolved,
        u.leetcode_hard_solved as leetcodeHardSolved,
        u.leetcode_last_synced as leetcodeLastSynced,
        u.leetcode_last_activity as leetcodeLastActivity,
        u.created_at as createdAt,
        t.id as teamId,
        t.name as teamName
      FROM users u
      LEFT JOIN team_members tm ON u.id = tm.user_id
      LEFT JOIN teams t ON tm.team_id = t.id
      WHERE u.role = 'MEMBER'
      ORDER BY u.created_at DESC
    `);

    return res.status(200).json({
      success: true,
      data: users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        leetcodeUsername: u.leetcodeUsername,
        leetcodeTotalSolved: u.leetcodeTotalSolved || 0,
        leetcodeEasySolved: u.leetcodeEasySolved || 0,
        leetcodeMediumSolved: u.leetcodeMediumSolved || 0,
        leetcodeHardSolved: u.leetcodeHardSolved || 0,
        leetcodeLastSynced: u.leetcodeLastSynced,
        leetcodeLastActivity: u.leetcodeLastActivity,
        createdAt: u.createdAt,
        teamId: u.teamId || null,
        teamName: u.teamName || null,
      })),
    });
  } catch (error) {
    console.error('getAdminUsers error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user accounts.',
    });
  }
};

// ADMIN ONLY: Get single user details by ID
exports.getAdminUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const [users] = await pool.query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.role,
        u.leetcode_username as leetcodeUsername,
        u.leetcode_total_solved as leetcodeTotalSolved,
        u.created_at as createdAt,
        t.id as teamId,
        t.name as teamName
      FROM users u
      LEFT JOIN team_members tm ON u.id = tm.user_id
      LEFT JOIN teams t ON tm.team_id = t.id
      WHERE u.id = ?
    `, [id]);

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    const targetUser = users[0];

    // ADMIN accounts are protected from member management endpoints
    if (targetUser.role === 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden. Admin accounts cannot be managed through member management.',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: targetUser.id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
        leetcodeUsername: targetUser.leetcodeUsername,
        teamId: targetUser.teamId || null,
        teamName: targetUser.teamName || null,
        createdAt: targetUser.createdAt,
      },
    });
  } catch (error) {
    console.error('getAdminUserById error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user details.',
    });
  }
};

// ADMIN ONLY: Update a member user (Name, Email, LeetCode username, Team)
exports.updateAdminUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, leetcodeUsername, teamId } = req.body;

    // 1. Fetch target user
    const [users] = await pool.query('SELECT id, name, email, role, leetcode_username FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    const targetUser = users[0];

    // 2. ADMIN protection rule
    if (targetUser.role === 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden. Admin accounts cannot be edited via user management.',
      });
    }

    // 3. Validate name if provided
    let cleanName = targetUser.name;
    if (name !== undefined) {
      if (!name || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: 'User name cannot be empty.',
        });
      }
      cleanName = name.trim();
    }

    // 4. Validate email if provided
    let cleanEmail = targetUser.email;
    if (email !== undefined && email.trim() !== targetUser.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address.',
        });
      }

      // Check email uniqueness
      const [existingEmail] = await pool.query('SELECT id FROM users WHERE email = ? AND id != ?', [
        email.trim(),
        id,
      ]);
      if (existingEmail.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'A user with this email already exists.',
        });
      }
      cleanEmail = email.trim();
    }

    // 5. Validate LeetCode username if provided and changed
    let cleanLeetCodeUsername = targetUser.leetcode_username;
    let newLeetCodeStats = null;

    if (leetcodeUsername !== undefined) {
      const trimmedLc = leetcodeUsername ? leetcodeUsername.trim() : '';
      if (trimmedLc && trimmedLc !== targetUser.leetcode_username) {
        // Validate LeetCode username by querying stats from LeetCode Service
        try {
          newLeetCodeStats = await leetcodeService.getLeetCodeStats(trimmedLc);
          cleanLeetCodeUsername = newLeetCodeStats.username;
        } catch (lcErr) {
          return res.status(400).json({
            success: false,
            message: lcErr.message || `Invalid or unavailable LeetCode username: '${trimmedLc}'`,
          });
        }
      } else if (!trimmedLc) {
        cleanLeetCodeUsername = null;
      }
    }

    // 6. Update user basic info in users table
    if (newLeetCodeStats) {
      const now = new Date();
      await pool.query(
        `UPDATE users 
         SET name = ?,
             email = ?,
             leetcode_username = ?,
             leetcode_total_solved = ?,
             leetcode_easy_solved = ?,
             leetcode_medium_solved = ?,
             leetcode_hard_solved = ?,
             leetcode_total_questions = ?,
             leetcode_ranking = ?,
             leetcode_last_synced = ?
         WHERE id = ?`,
        [
          cleanName,
          cleanEmail,
          cleanLeetCodeUsername,
          newLeetCodeStats.totalSolved,
          newLeetCodeStats.easySolved,
          newLeetCodeStats.mediumSolved,
          newLeetCodeStats.hardSolved,
          newLeetCodeStats.totalQuestions,
          newLeetCodeStats.ranking,
          now,
          id,
        ]
      );
    } else {
      await pool.query(
        `UPDATE users 
         SET name = ?,
             email = ?,
             leetcode_username = ?
         WHERE id = ?`,
        [cleanName, cleanEmail, cleanLeetCodeUsername, id]
      );
    }

    // 7. Update Team assignment if teamId is provided in request body
    if (teamId !== undefined) {
      // First remove member from current team
      await pool.query('DELETE FROM team_members WHERE user_id = ?', [id]);

      // If teamId is specified (not null / not empty / not 'none')
      if (teamId && teamId !== 'none' && teamId !== '') {
        const parsedTeamId = parseInt(teamId, 10);
        // Verify team exists
        const [teams] = await pool.query('SELECT id FROM teams WHERE id = ?', [parsedTeamId]);
        if (teams.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'Specified team does not exist.',
          });
        }

        // Insert team assignment
        await pool.query('INSERT INTO team_members (team_id, user_id) VALUES (?, ?)', [
          parsedTeamId,
          id,
        ]);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'User updated successfully.',
    });
  } catch (error) {
    console.error('updateAdminUser error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update user.',
    });
  }
};

// ADMIN ONLY: Remove/delete a member user
exports.deleteAdminUser = async (req, res) => {
  try {
    const { id } = req.params;
    const adminUserId = req.user.id;

    const targetId = parseInt(id, 10);

    // 1. Self-protection rule: Admin cannot delete their own account
    if (targetId === adminUserId) {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden. You cannot delete your own admin account.',
      });
    }

    // 2. Fetch target user to check existence & role
    const [users] = await pool.query('SELECT id, role, name FROM users WHERE id = ?', [targetId]);
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    const targetUser = users[0];

    // 3. ADMIN protection rule: Admin cannot delete another ADMIN
    if (targetUser.role === 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden. Admin accounts cannot be deleted.',
      });
    }

    // 4. Delete user (MySQL ON DELETE CASCADE foreign keys will safely delete team_members, leetcode_submissions, leetcode_stats_history)
    // Teams created by other admins or challenge definitions are NOT deleted.
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [targetId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: `User '${targetUser.name}' removed successfully.`,
    });
  } catch (error) {
    console.error('deleteAdminUser error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to remove user.',
    });
  }
};
