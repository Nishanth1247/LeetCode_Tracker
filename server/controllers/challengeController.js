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

// MEMBER or TEAM LEADER: Create Individual Task(s) for Team Members
exports.createIndividualChallenge = async (req, res) => {
  try {
    const { assignedTo, title, description, difficulty, target, startDate, endDate } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole !== 'MEMBER') {
      return res.status(403).json({
        success: false,
        message: 'Only Team Leaders (MEMBER role) can create individual task assignments.',
      });
    }

    // Verify current user is a Team Leader
    const [ledTeams] = await pool.query('SELECT id FROM teams WHERE leader_id = ?', [userId]);
    if (ledTeams.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned as a Team Leader of any team.',
      });
    }

    const teamId = ledTeams[0].id;

    if (!assignedTo || !title || !title.trim() || !difficulty || !target || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'assignedTo, title, difficulty, target, start date, and end date are required.',
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

    // Process assignedTo into an array of user IDs
    let targetMemberIds = [];
    if (Array.isArray(assignedTo)) {
      targetMemberIds = assignedTo.map((id) => parseInt(id, 10));
    } else {
      targetMemberIds = [parseInt(assignedTo, 10)];
    }

    if (targetMemberIds.length === 0 || targetMemberIds.some(isNaN)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid member assignment list.',
      });
    }

    // Verify all assigned member IDs belong to the leader's team
    const [teamMembers] = await pool.query(
      `SELECT tm.user_id, u.role, u.name 
       FROM team_members tm
       JOIN users u ON tm.user_id = u.id
       WHERE tm.team_id = ? AND tm.user_id IN (?)`,
      [teamId, targetMemberIds]
    );

    if (teamMembers.length !== targetMemberIds.length) {
      return res.status(403).json({
        success: false,
        message: 'One or more assigned members do not belong to your team.',
      });
    }

    for (const tm of teamMembers) {
      if (tm.role !== 'MEMBER') {
        return res.status(400).json({
          success: false,
          message: `User '${tm.name}' is an ADMIN and cannot receive task assignments.`,
        });
      }
    }

    const createdIds = [];

    // Create individual assignment row per assigned member
    for (const memberId of targetMemberIds) {
      const [result] = await pool.query(
        `INSERT INTO team_challenges 
         (team_id, title, description, difficulty, target, start_date, end_date, created_by, assigned_to, assignment_type)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'INDIVIDUAL')`,
        [teamId, cleanTitle, cleanDesc, difficulty, targetNum, startDate, endDate, userId, memberId]
      );
      createdIds.push(result.insertId);
    }

    return res.status(201).json({
      success: true,
      message: `${createdIds.length} individual task assignment(s) created successfully.`,
      data: {
        createdCount: createdIds.length,
        taskIds: createdIds,
        teamId,
        title: cleanTitle,
        target: targetNum,
        difficulty,
      },
    });
  } catch (error) {
    console.error('createIndividualChallenge error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create individual task assignment.',
    });
  }
};

// TEAM LEADER: Update individual task assignment
exports.updateIndividualChallenge = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, difficulty, target, startDate, endDate } = req.body;
    const userId = req.user.id;

    // Check challenge existence & assignment_type
    const [challenges] = await pool.query(
      `SELECT c.id, c.team_id, c.assignment_type, t.leader_id
       FROM team_challenges c
       JOIN teams t ON c.team_id = t.id
       WHERE c.id = ?`,
      [id]
    );

    if (challenges.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task assignment not found.',
      });
    }

    const challenge = challenges[0];

    if (challenge.assignment_type !== 'INDIVIDUAL') {
      return res.status(400).json({
        success: false,
        message: 'Only INDIVIDUAL task assignments can be updated with this endpoint.',
      });
    }

    if (challenge.leader_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not the Team Leader of the team associated with this task.',
      });
    }

    const newTitle = title ? title.trim() : undefined;
    const newDesc = description !== undefined ? description.trim() : undefined;
    const newTarget = target ? parseInt(target, 10) : undefined;
    const newDifficulty = difficulty;
    const newStartDate = startDate;
    const newEndDate = endDate;

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
      message: 'Individual task updated successfully.',
    });
  } catch (error) {
    console.error('updateIndividualChallenge error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update individual task assignment.',
    });
  }
};

// TEAM LEADER: Delete individual task assignment
exports.deleteIndividualChallenge = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [challenges] = await pool.query(
      `SELECT c.id, c.assignment_type, t.leader_id
       FROM team_challenges c
       JOIN teams t ON c.team_id = t.id
       WHERE c.id = ?`,
      [id]
    );

    if (challenges.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task assignment not found.',
      });
    }

    const challenge = challenges[0];

    if (challenge.assignment_type !== 'INDIVIDUAL') {
      return res.status(400).json({
        success: false,
        message: 'Only INDIVIDUAL task assignments can be deleted by Team Leaders.',
      });
    }

    if (challenge.leader_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not the Team Leader of the team associated with this task.',
      });
    }

    await pool.query('DELETE FROM team_challenges WHERE id = ?', [id]);

    return res.status(200).json({
      success: true,
      message: 'Individual task assignment deleted successfully.',
    });
  } catch (error) {
    console.error('deleteIndividualChallenge error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete individual task assignment.',
    });
  }
};

// MEMBER: Get challenges for authenticated member's team (Team Tasks & My Individual Tasks)
exports.getMyChallenges = async (req, res) => {
  try {
    const userId = req.user.id;

    const [assignments] = await pool.query(
      'SELECT tm.team_id, t.leader_id FROM team_members tm JOIN teams t ON tm.team_id = t.id WHERE tm.user_id = ?',
      [userId]
    );

    if (assignments.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          teamTasks: [],
          individualTasks: [],
        },
      });
    }

    const teamId = assignments[0].team_id;
    const isLeader = assignments[0].leader_id === userId;

    let querySQL = `
      SELECT id, title, description, difficulty, target, start_date as startDate, end_date as endDate, status,
             assignment_type as assignmentType, assigned_to as assignedTo, created_by as createdBy
      FROM team_challenges
      WHERE team_id = ?
    `;
    let queryParams = [teamId];

    if (!isLeader) {
      querySQL += ` AND (assignment_type = 'TEAM' OR assigned_to = ?)`;
      queryParams.push(userId);
    }

    querySQL += ` ORDER BY start_date DESC`;

    const [challenges] = await pool.query(querySQL, queryParams);

    const todayStr = new Date().toISOString().split('T')[0];

    const teamTasks = [];
    const individualTasks = [];

    challenges.forEach((c) => {
      let calcStatus = c.status;
      const endStr = new Date(c.endDate).toISOString().split('T')[0];
      if (todayStr > endStr && c.status !== 'COMPLETED') {
        calcStatus = 'EXPIRED';
      }

      const item = {
        ...c,
        status: calcStatus,
      };

      if (c.assignmentType === 'INDIVIDUAL') {
        individualTasks.push(item);
      } else {
        teamTasks.push(item);
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        isLeader,
        teamTasks,
        individualTasks,
        // Legacy list for backwards compatibility
        all: [...teamTasks, ...individualTasks],
      },
    });
  } catch (error) {
    console.error('getMyChallenges error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch team challenges.',
    });
  }
};

// GET CHALLENGE PROGRESS (V8.2 Submission-Based with Snapshot Fallback & Individual Task Support)
exports.getChallengeProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Fetch challenge details
    const [challenges] = await pool.query(
      `SELECT c.id, c.team_id as teamId, t.name as teamName, t.leader_id as leaderId,
              c.title, c.description, c.difficulty, c.target,
              c.start_date as startDate, c.end_date as endDate, c.status,
              c.assignment_type as assignmentType, c.assigned_to as assignedTo
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

    // MEMBER Authorization Pre-check
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

      // For INDIVIDUAL task: only assigned member or team leader or admin can view detail
      if (
        challenge.assignmentType === 'INDIVIDUAL' &&
        challenge.assignedTo !== userId &&
        challenge.leaderId !== userId
      ) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to view this individual task progress.',
        });
      }
    }

    // Determine target members for progress calculation
    let targetMemberFilter = `tm.team_id = ?`;
    let queryParams = [challenge.teamId];

    if (challenge.assignmentType === 'INDIVIDUAL' && challenge.assignedTo) {
      targetMemberFilter = `tm.team_id = ? AND u.id = ?`;
      queryParams.push(challenge.assignedTo);
    }

    // Get team members
    const [teamMembers] = await pool.query(
      `SELECT u.id, u.name, u.leetcode_username as leetcodeUsername,
              u.leetcode_total_solved, u.leetcode_easy_solved, u.leetcode_medium_solved, u.leetcode_hard_solved
       FROM team_members tm
       JOIN users u ON tm.user_id = u.id
       WHERE ${targetMemberFilter}`,
      queryParams
    );

    const startDateStr = new Date(challenge.startDate).toISOString().split('T')[0] + ' 00:00:00';
    const endDateStr = new Date(challenge.endDate).toISOString().split('T')[0] + ' 23:59:59';
    const todayStr = new Date().toISOString().split('T')[0];
    const challengeEndStr = new Date(challenge.endDate).toISOString().split('T')[0];

    const teamUserIds = teamMembers.map((m) => m.id);

    let calculationMethod = 'submission_based';
    let submissionRows = [];

    if (teamUserIds.length > 0) {
      // Query submission history for members within date window
      const [subs] = await pool.query(
        `SELECT id, user_id, problem_title as title, problem_slug as slug, difficulty, language, solved_at as solvedAt
         FROM leetcode_submissions
         WHERE user_id IN (?) AND solved_at >= ? AND solved_at <= ?
         ORDER BY solved_at DESC`,
        [teamUserIds, startDateStr, endDateStr]
      );
      submissionRows = subs;
    }

    const membersProgress = [];
    let teamTotalSolved = 0;
    const teamProblems = [];
    const teamDifficultyBreakdown = { easy: 0, medium: 0, hard: 0 };

    for (const member of teamMembers) {
      const memberSubs = submissionRows.filter((s) => s.user_id === member.id);

      const seenSlugs = new Set();
      const uniqueMemberProbs = [];
      let easyCount = 0;
      let mediumCount = 0;
      let hardCount = 0;

      for (const sub of memberSubs) {
        if (!seenSlugs.has(sub.slug)) {
          seenSlugs.add(sub.slug);

          const diff = sub.difficulty ? sub.difficulty.toUpperCase() : null;
          let countsForChallenge = false;

          if (challenge.difficulty === 'MIXED') {
            countsForChallenge = true;
          } else if (challenge.difficulty === diff) {
            countsForChallenge = true;
          }

          if (diff === 'EASY') easyCount++;
          if (diff === 'MEDIUM') mediumCount++;
          if (diff === 'HARD') hardCount++;

          if (countsForChallenge) {
            uniqueMemberProbs.push({
              title: sub.title,
              slug: sub.slug,
              difficulty: sub.difficulty || 'Unavailable',
              language: sub.language || 'Unavailable',
              solvedAt: new Date(sub.solvedAt).toISOString(),
            });
          }
        }
      }

      const memberSolved = uniqueMemberProbs.length;
      teamTotalSolved += memberSolved;

      teamDifficultyBreakdown.easy += easyCount;
      teamDifficultyBreakdown.medium += mediumCount;
      teamDifficultyBreakdown.hard += hardCount;

      uniqueMemberProbs.forEach((p) => {
        teamProblems.push({
          ...p,
          userId: member.id,
          userName: member.name,
        });
      });

      const memberPercentage = Math.min(100, Math.round((memberSolved / challenge.target) * 100));

      membersProgress.push({
        userId: member.id,
        name: member.name,
        username: member.leetcodeUsername,
        solved: memberSolved,
        target: challenge.target,
        remaining: Math.max(0, challenge.target - memberSolved),
        percentage: memberPercentage,
        difficultyBreakdown: {
          easy: easyCount,
          medium: mediumCount,
          hard: hardCount,
        },
        problems: uniqueMemberProbs,
      });
    }

    membersProgress.sort((a, b) => b.solved - a.solved);

    let dynamicStatus = 'ACTIVE';
    if (teamTotalSolved >= challenge.target) {
      dynamicStatus = 'COMPLETED';
    } else if (todayStr > challengeEndStr) {
      dynamicStatus = 'EXPIRED';
    }

    const teamPercentage = Math.min(
      100,
      Math.round((teamTotalSolved / challenge.target) * 100)
    );

    const isLeader = challenge.leaderId === userId;
    const isTargetAdmin = userRole === 'ADMIN';

    // If caller is a normal member (not Admin and not Team Leader), filter membersProgress and problems to only return their own data.
    let finalMembersProgress = membersProgress;
    let finalProblems = teamProblems;

    if (!isTargetAdmin && !isLeader) {
      finalMembersProgress = membersProgress.filter((m) => m.userId === userId);
      finalProblems = teamProblems.filter((p) => p.userId === userId);
    }

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
          teamId: challenge.teamId,
          assignmentType: challenge.assignmentType,
          assignedTo: challenge.assignedTo,
        },
        calculationMethod,
        progress: {
          target: challenge.target,
          solved: teamTotalSolved,
          remaining: Math.max(0, challenge.target - teamTotalSolved),
          percentage: teamPercentage,
        },
        difficultyBreakdown: (isTargetAdmin || isLeader) ? teamDifficultyBreakdown : undefined,
        status: dynamicStatus,
        membersProgress: finalMembersProgress,
        problems: finalProblems,
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
