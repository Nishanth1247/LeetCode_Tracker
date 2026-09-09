const { pool } = require('../config/db');

// ADMIN: Create a new team with optional initial member assignments
exports.createTeam = async (req, res) => {
  try {
    const { name, memberIds } = req.body;
    const createdBy = req.user.id;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Team name is required.',
      });
    }

    const cleanName = name.trim();

    // Check if team name already exists
    const [existingTeams] = await pool.query('SELECT id FROM teams WHERE name = ?', [cleanName]);
    if (existingTeams.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'A team with this name already exists.',
      });
    }

    // Validate members if provided
    let membersToAdd = [];
    if (Array.isArray(memberIds) && memberIds.length > 0) {
      // Check that all provided memberIds exist, have role = 'MEMBER', and are not in any team
      const [users] = await pool.query(
        'SELECT id, role, name FROM users WHERE id IN (?)',
        [memberIds]
      );

      if (users.length !== memberIds.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more selected user IDs do not exist.',
        });
      }

      for (const u of users) {
        if (u.role !== 'MEMBER') {
          return res.status(400).json({
            success: false,
            message: `User '${u.name}' is an ADMIN and cannot be assigned to a team.`,
          });
        }
      }

      const [existingAssigned] = await pool.query(
        'SELECT user_id FROM team_members WHERE user_id IN (?)',
        [memberIds]
      );

      if (existingAssigned.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'One or more selected users are already assigned to a team.',
        });
      }

      membersToAdd = memberIds;
    }

    // Insert team
    const [teamResult] = await pool.query(
      'INSERT INTO teams (name, created_by) VALUES (?, ?)',
      [cleanName, createdBy]
    );

    const teamId = teamResult.insertId;

    // Insert members
    for (const userId of membersToAdd) {
      await pool.query('INSERT INTO team_members (team_id, user_id) VALUES (?, ?)', [
        teamId,
        userId,
      ]);
    }

    return res.status(201).json({
      success: true,
      message: 'Team created successfully.',
      data: {
        id: teamId,
        name: cleanName,
        membersCount: membersToAdd.length,
      },
    });
  } catch (error) {
    console.error('createTeam error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create team.',
    });
  }
};

// ADMIN: Get all teams with member counts & active challenges count
exports.getAllTeams = async (req, res) => {
  try {
    const [teams] = await pool.query(`
      SELECT 
        t.id, 
        t.name, 
        t.created_at as createdAt,
        COUNT(DISTINCT tm.user_id) as memberCount,
        COUNT(DISTINCT tc.id) as activeChallengeCount
      FROM teams t
      LEFT JOIN team_members tm ON t.id = tm.team_id
      LEFT JOIN team_challenges tc ON t.id = tc.team_id AND tc.end_date >= CURRENT_DATE()
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `);

    return res.status(200).json({
      success: true,
      data: teams.map((t) => ({
        id: t.id,
        name: t.name,
        createdAt: t.createdAt,
        memberCount: parseInt(t.memberCount, 10) || 0,
        activeChallengeCount: parseInt(t.activeChallengeCount, 10) || 0,
      })),
    });
  } catch (error) {
    console.error('getAllTeams error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch teams.',
    });
  }
};

// ADMIN: Get team by ID with members & active challenges
exports.getTeamById = async (req, res) => {
  try {
    const { id } = req.params;

    const [teams] = await pool.query('SELECT id, name, created_at FROM teams WHERE id = ?', [id]);
    if (teams.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Team not found.',
      });
    }

    const team = teams[0];

    const [members] = await pool.query(
      `SELECT u.id, u.name, u.email, u.leetcode_username as leetcodeUsername, tm.created_at as joinedAt
       FROM team_members tm
       JOIN users u ON tm.user_id = u.id
       WHERE tm.team_id = ?
       ORDER BY u.name ASC`,
      [id]
    );

    const [challenges] = await pool.query(
      `SELECT id, title, description, difficulty, target, start_date as startDate, end_date as endDate, status, created_at as createdAt
       FROM team_challenges
       WHERE team_id = ?
       ORDER BY start_date DESC`,
      [id]
    );

    return res.status(200).json({
      success: true,
      data: {
        id: team.id,
        name: team.name,
        createdAt: team.created_at,
        members: members.map((m) => ({
          id: m.id,
          name: m.name,
          email: m.email,
          leetcodeUsername: m.leetcodeUsername,
          joinedAt: m.joinedAt,
        })),
        challenges: challenges.map((c) => ({
          id: c.id,
          title: c.title,
          description: c.description,
          difficulty: c.difficulty,
          target: c.target,
          startDate: c.startDate,
          endDate: c.endDate,
          status: c.status,
          createdAt: c.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error('getTeamById error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch team details.',
    });
  }
};

// ADMIN: Update team name
exports.updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Team name is required.',
      });
    }

    const cleanName = name.trim();

    const [existing] = await pool.query('SELECT id FROM teams WHERE name = ? AND id != ?', [
      cleanName,
      id,
    ]);
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Another team already uses this name.',
      });
    }

    const [result] = await pool.query('UPDATE teams SET name = ? WHERE id = ?', [cleanName, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Team not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Team updated successfully.',
      data: { id: parseInt(id, 10), name: cleanName },
    });
  } catch (error) {
    console.error('updateTeam error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update team.',
    });
  }
};

// ADMIN: Delete team
exports.deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query('DELETE FROM teams WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Team not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Team deleted successfully.',
    });
  } catch (error) {
    console.error('deleteTeam error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete team.',
    });
  }
};

// ADMIN: Add member to team
exports.addTeamMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required.',
      });
    }

    // Check team existence
    const [teams] = await pool.query('SELECT id FROM teams WHERE id = ?', [id]);
    if (teams.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Team not found.',
      });
    }

    // Check user existence and role
    const [users] = await pool.query('SELECT id, role, name FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    if (users[0].role !== 'MEMBER') {
      return res.status(400).json({
        success: false,
        message: `User '${users[0].name}' is an ADMIN and cannot belong to a team.`,
      });
    }

    // Pre-check single team membership
    const [existingAssignment] = await pool.query(
      'SELECT team_id FROM team_members WHERE user_id = ?',
      [userId]
    );

    if (existingAssignment.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Member is already assigned to a team.',
      });
    }

    await pool.query('INSERT INTO team_members (team_id, user_id) VALUES (?, ?)', [id, userId]);

    return res.status(200).json({
      success: true,
      message: 'Member added to team successfully.',
    });
  } catch (error) {
    console.error('addTeamMember error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add member to team.',
    });
  }
};

// ADMIN: Remove member from team
exports.removeTeamMember = async (req, res) => {
  try {
    const { id, userId } = req.params;

    const [result] = await pool.query(
      'DELETE FROM team_members WHERE team_id = ? AND user_id = ?',
      [id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Member assignment not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Member removed from team successfully.',
    });
  } catch (error) {
    console.error('removeTeamMember error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to remove member from team.',
    });
  }
};

// MEMBER: Get authenticated member's own team (Correction 3)
exports.getMyTeam = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find member's assigned team
    const [assignments] = await pool.query(
      'SELECT team_id FROM team_members WHERE user_id = ?',
      [userId]
    );

    if (assignments.length === 0) {
      return res.status(200).json({
        success: true,
        data: null, // Indicates not assigned to any team
      });
    }

    const teamId = assignments[0].team_id;

    const [teams] = await pool.query('SELECT id, name, created_at FROM teams WHERE id = ?', [
      teamId,
    ]);
    if (teams.length === 0) {
      return res.status(200).json({
        success: true,
        data: null,
      });
    }

    const team = teams[0];

    // Fetch team members
    const [members] = await pool.query(
      `SELECT u.id, u.name, u.leetcode_username as leetcodeUsername
       FROM team_members tm
       JOIN users u ON tm.user_id = u.id
       WHERE tm.team_id = ?
       ORDER BY u.name ASC`,
      [teamId]
    );

    // Fetch team challenges
    const [challenges] = await pool.query(
      `SELECT id, title, description, difficulty, target, start_date as startDate, end_date as endDate, status
       FROM team_challenges
       WHERE team_id = ?
       ORDER BY start_date DESC`,
      [teamId]
    );

    return res.status(200).json({
      success: true,
      data: {
        id: team.id,
        name: team.name,
        createdAt: team.created_at,
        members: members.map((m) => ({
          id: m.id,
          name: m.name,
          leetcodeUsername: m.leetcodeUsername,
        })),
        challenges: challenges.map((c) => ({
          id: c.id,
          title: c.title,
          description: c.description,
          difficulty: c.difficulty,
          target: c.target,
          startDate: c.startDate,
          endDate: c.endDate,
          status: c.status,
        })),
      },
    });
  } catch (error) {
    console.error('getMyTeam error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch your team data.',
    });
  }
};
