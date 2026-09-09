const { pool } = require('../config/db');

/**
 * Helper: Map difficulty to snapshot column
 */
function getDifficultyColumn(difficulty) {
  switch (difficulty) {
    case 'EASY':
      return 'easy_solved';
    case 'MEDIUM':
      return 'medium_solved';
    case 'HARD':
      return 'hard_solved';
    case 'MIXED':
    default:
      return 'total_solved';
  }
}

/**
 * Helper: Map difficulty to user table column
 */
function getUserDifficultyColumn(difficulty) {
  switch (difficulty) {
    case 'EASY':
      return 'leetcode_easy_solved';
    case 'MEDIUM':
      return 'leetcode_medium_solved';
    case 'HARD':
      return 'leetcode_hard_solved';
    case 'MIXED':
    default:
      return 'leetcode_total_solved';
  }
}

// ADMIN: Create Challenge
exports.createChallenge = async (req, res) => {
  try {
    const { teamId, title, description, difficulty, target, startDate, endDate } = req.body;
    const createdBy = req.user.id;

    if (!teamId || !title || !title.trim() || !difficulty || !target || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Team, title, difficulty, target, start date, and end date are required.',
      });
    }

    const cleanTitle = title.trim();
    const cleanDesc = description ? description.trim() : null;

    if (!['EASY', 'MEDIUM', 'HARD', 'MIXED'].includes(difficulty)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid difficulty. Must be EASY, MEDIUM, HARD, or MIXED.',
      });
    }

    const targetNum = parseInt(target, 10);
    if (isNaN(targetNum) || targetNum <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Target must be greater than 0.',
      });
    }

    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({
        success: false,
        message: 'End date cannot be before start date.',
      });
    }

    // Verify team exists
    const [teams] = await pool.query('SELECT id FROM teams WHERE id = ?', [teamId]);
    if (teams.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Team not found.',
      });
    }

    const [result] = await pool.query(
      `INSERT INTO team_challenges 
       (team_id, title, description, difficulty, target, start_date, end_date, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [teamId, cleanTitle, cleanDesc, difficulty, targetNum, startDate, endDate, createdBy]
    );

    return res.status(201).json({
      success: true,
      message: 'Team challenge created successfully.',
      data: {
        id: result.insertId,
        teamId,
        title: cleanTitle,
        difficulty,
        target: targetNum,
        startDate,
        endDate,
        status: 'ACTIVE',
      },
    });
  } catch (error) {
    console.error('createChallenge error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create team challenge.',
    });
  }
};

// ADMIN: Get all challenges across teams
exports.getAllChallenges = async (req, res) => {
  try {
    const [challenges] = await pool.query(`
      SELECT 
        c.id, c.team_id as teamId, t.name as teamName,
        c.title, c.description, c.difficulty, c.target,
        c.start_date as startDate, c.end_date as endDate,
        c.status, c.created_at as createdAt
      FROM team_challenges c
      JOIN teams t ON c.team_id = t.id
      ORDER BY c.created_at DESC
    `);

    const todayStr = new Date().toISOString().split('T')[0];

    const formatted = challenges.map((c) => {
      let calcStatus = c.status;
      const endStr = new Date(c.endDate).toISOString().split('T')[0];
      if (todayStr > endStr && c.status !== 'COMPLETED') {
        calcStatus = 'EXPIRED';
      }
      return {
        ...c,
        status: calcStatus,
      };
    });

    return res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    console.error('getAllChallenges error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch challenges.',
    });
  }
};

// ADMIN or MEMBER: Get single challenge by ID with Authorization check
exports.getChallengeById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const [challenges] = await pool.query(
      `SELECT c.id, c.team_id as teamId, t.name as teamName,
              c.title, c.description, c.difficulty, c.target,
              c.start_date as startDate, c.end_date as endDate,
              c.status, c.created_at as createdAt
       FROM team_challenges c
       JOIN teams t ON c.team_id = t.id
       WHERE c.id = ?`,
      [id]
    );

    if (challenges.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found.',
      });
    }

    const challenge = challenges[0];

    // MEMBER Authorization Pre-check (Correction 2)
    if (userRole === 'MEMBER') {
      const [memberAssignment] = await pool.query(
        'SELECT team_id FROM team_members WHERE user_id = ?',
        [userId]
      );

      if (memberAssignment.length === 0 || memberAssignment[0].team_id !== challenge.teamId) {
        return res.status(403).json({
          success: false,
          message: 'You do not have access to this team challenge.',
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: challenge,
    });
  } catch (error) {
    console.error('getChallengeById error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch challenge.',
    });
  }
};

// ADMIN: Update challenge with edit rule restriction
exports.updateChallenge = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, difficulty, target, startDate, endDate } = req.body;

    const [challenges] = await pool.query(
      'SELECT id, start_date, difficulty, end_date FROM team_challenges WHERE id = ?',
      [id]
    );

    if (challenges.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found.',
      });
    }

    const challenge = challenges[0];

    // Check if challenge has started
    const todayStr = new Date().toISOString().split('T')[0];
    const existingStartStr = new Date(challenge.start_date).toISOString().split('T')[0];
    const hasStarted = todayStr >= existingStartStr;

    if (hasStarted) {
      // Rule: Once started, ADMIN cannot edit difficulty, startDate, or endDate
      if (
        (difficulty && difficulty !== challenge.difficulty) ||
        (startDate && new Date(startDate).toISOString().split('T')[0] !== existingStartStr) ||
        (endDate &&
          new Date(endDate).toISOString().split('T')[0] !==
            new Date(challenge.end_date).toISOString().split('T')[0])
      ) {
        return res.status(400).json({
          success: false,
          message:
            'Cannot modify difficulty or start/end dates for an active or completed challenge that has already started.',
        });
      }
    }

    const newTitle = title ? title.trim() : undefined;
    const newDesc = description !== undefined ? description.trim() : undefined;
    const newTarget = target ? parseInt(target, 10) : undefined;
    const newDifficulty = hasStarted ? challenge.difficulty : difficulty;
    const newStartDate = hasStarted ? challenge.start_date : startDate;
    const newEndDate = hasStarted ? challenge.end_date : endDate;

    if (newTarget && (isNaN(newTarget) || newTarget <= 0)) {
      return res.status(400).json({
        success: false,
        message: 'Target must be greater than 0.',
      });
    }

    if (newStartDate && newEndDate && new Date(newEndDate) < new Date(newStartDate)) {
      return res.status(400).json({
        success: false,
        message: 'End date cannot be before start date.',
      });
    }

    await pool.query(
      `UPDATE team_challenges
       SET title = COALESCE(?, title),
           description = COALESCE(?, description),
           difficulty = COALESCE(?, difficulty),
           target = COALESCE(?, target),
           start_date = COALESCE(?, start_date),
           end_date = COALESCE(?, end_date)
       WHERE id = ?`,
      [newTitle, newDesc, newDifficulty, newTarget, newStartDate, newEndDate, id]
    );

    return res.status(200).json({
      success: true,
      message: 'Challenge updated successfully.',
    });
  } catch (error) {
    console.error('updateChallenge error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update challenge.',
    });
  }
};

// ADMIN: Delete challenge
exports.deleteChallenge = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query('DELETE FROM team_challenges WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Challenge deleted successfully.',
    });
  } catch (error) {
    console.error('deleteChallenge error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete challenge.',
    });
  }
};

// MEMBER: Get challenges for authenticated member's team
exports.getMyChallenges = async (req, res) => {
  try {
    const userId = req.user.id;

    const [assignments] = await pool.query(
      'SELECT team_id FROM team_members WHERE user_id = ?',
      [userId]
    );

    if (assignments.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    const teamId = assignments[0].team_id;

    const [challenges] = await pool.query(
      `SELECT id, title, description, difficulty, target, start_date as startDate, end_date as endDate, status
       FROM team_challenges
       WHERE team_id = ?
       ORDER BY start_date DESC`,
      [teamId]
    );

    const todayStr = new Date().toISOString().split('T')[0];

    const formatted = challenges.map((c) => {
      let calcStatus = c.status;
      const endStr = new Date(c.endDate).toISOString().split('T')[0];
      if (todayStr > endStr && c.status !== 'COMPLETED') {
        calcStatus = 'EXPIRED';
      }
      return {
        ...c,
        status: calcStatus,
      };
    });

    return res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    console.error('getMyChallenges error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch team challenges.',
    });
  }
};

// GET CHALLENGE PROGRESS (Correction 1, 2, 4, 5, 6, 7)
exports.getChallengeProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Fetch challenge details
    const [challenges] = await pool.query(
      `SELECT c.id, c.team_id as teamId, t.name as teamName,
              c.title, c.description, c.difficulty, c.target,
              c.start_date as startDate, c.end_date as endDate, c.status
       FROM team_challenges c
       JOIN teams t ON c.team_id = t.id
       WHERE c.id = ?`,
      [id]
    );

    if (challenges.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found.',
      });
    }

    const challenge = challenges[0];

    // MEMBER Authorization Pre-check (Correction 2)
    if (userRole === 'MEMBER') {
      const [memberAssignment] = await pool.query(
        'SELECT team_id FROM team_members WHERE user_id = ?',
        [userId]
      );

      if (memberAssignment.length === 0 || memberAssignment[0].team_id !== challenge.teamId) {
        return res.status(403).json({
          success: false,
          message: 'You do not have access to this team challenge.',
        });
      }
    }

    // Get team members
    const [teamMembers] = await pool.query(
      `SELECT u.id, u.name, u.leetcode_username as leetcodeUsername,
              u.leetcode_total_solved, u.leetcode_easy_solved, u.leetcode_medium_solved, u.leetcode_hard_solved
       FROM team_members tm
       JOIN users u ON tm.user_id = u.id
       WHERE tm.team_id = ?`,
      [challenge.teamId]
    );

    const diffCol = getDifficultyColumn(challenge.difficulty);
    const userDiffCol = getUserDifficultyColumn(challenge.difficulty);

    // Inclusive date string boundaries
    const startDateStr = new Date(challenge.startDate).toISOString().split('T')[0] + ' 00:00:00';
    const endDateStr = new Date(challenge.endDate).toISOString().split('T')[0] + ' 23:59:59';
    const todayStr = new Date().toISOString().split('T')[0];
    const challengeEndStr = new Date(challenge.endDate).toISOString().split('T')[0];

    const membersProgress = [];
    let teamProgressSum = 0;

    for (const member of teamMembers) {
      let memberProgress = 0;

      if (member.leetcodeUsername) {
        // 1. Baseline snapshot on or before start_date 23:59:59
        const [baselineRows] = await pool.query(
          `SELECT ${diffCol} as solvedCount, recorded_at 
           FROM leetcode_stats_history 
           WHERE user_id = ? AND recorded_at <= ?
           ORDER BY recorded_at DESC, id DESC 
           LIMIT 1`,
          [member.id, startDateStr]
        );

        let baselineCount = null;

        if (baselineRows.length > 0) {
          baselineCount = baselineRows[0].solvedCount;
        } else {
          // If no baseline snapshot on or before start_date, find earliest snapshot during challenge window
          const [earliestWindowRows] = await pool.query(
            `SELECT ${diffCol} as solvedCount 
             FROM leetcode_stats_history 
             WHERE user_id = ? AND recorded_at >= ? AND recorded_at <= ?
             ORDER BY recorded_at ASC, id ASC 
             LIMIT 1`,
            [member.id, startDateStr, endDateStr]
          );

          if (earliestWindowRows.length > 0) {
            baselineCount = earliestWindowRows[0].solvedCount;
          }
        }

        // 2. Latest snapshot on or before end_date 23:59:59 (or current stats if ongoing)
        let latestCount = null;

        const [latestRows] = await pool.query(
          `SELECT ${diffCol} as solvedCount 
           FROM leetcode_stats_history 
           WHERE user_id = ? AND recorded_at <= ?
           ORDER BY recorded_at DESC, id DESC 
           LIMIT 1`,
          [member.id, endDateStr]
        );

        if (latestRows.length > 0) {
          latestCount = latestRows[0].solvedCount;
        } else if (todayStr <= challengeEndStr) {
          latestCount = member[userDiffCol] || 0;
        }

        // 3. Compute delta (clamped to zero)
        if (baselineCount !== null && latestCount !== null) {
          memberProgress = Math.max(0, latestCount - baselineCount);
        } else {
          memberProgress = 0;
        }
      }

      teamProgressSum += memberProgress;

      membersProgress.push({
        userId: member.id,
        name: member.name,
        username: member.leetcodeUsername,
        progress: memberProgress,
      });
    }

    // Sort members by progress descending
    membersProgress.sort((a, b) => b.progress - a.progress);

    // Compute dynamic challenge status (Correction 6)
    let dynamicStatus = 'ACTIVE';
    if (teamProgressSum >= challenge.target) {
      dynamicStatus = 'COMPLETED';
    } else if (todayStr > challengeEndStr) {
      dynamicStatus = 'EXPIRED';
    }

    const teamPercentage = Math.min(
      100,
      Math.round((teamProgressSum / challenge.target) * 100)
    );

    return res.status(200).json({
      success: true,
      data: {
        challenge: {
          id: challenge.id,
          title: challenge.title,
          description: challenge.description,
          difficulty: challenge.difficulty,
          target: challenge.target,
          startDate: challenge.startDate,
          endDate: challenge.endDate,
          status: dynamicStatus,
          teamName: challenge.teamName,
        },
        teamProgress: teamProgressSum,
        target: challenge.target,
        teamPercentage,
        status: dynamicStatus,
        calculationMethod: 'snapshot_based', // Correction 4
        membersProgress,
      },
    });
  } catch (error) {
    console.error('getChallengeProgress error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to calculate challenge progress.',
    });
  }
};
