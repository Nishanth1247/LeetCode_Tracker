const { pool } = require('../config/db');
const dsaRoadmap = require('../data/dsaRoadmap');

exports.getMyRoadmapProgress = async (req, res) => {
  try {
    const userId = req.user.id;

    // Collect set of all 100 roadmap problem slugs and map slug -> problem info
    const roadmapSlugsSet = new Set();
    const slugToProblemMap = {};

    let totalEasy = 0;
    let totalMedium = 0;
    let totalHard = 0;

    dsaRoadmap.forEach((stage) => {
      stage.topics.forEach((topic) => {
        topic.problems.forEach((prob) => {
          roadmapSlugsSet.add(prob.slug);
          slugToProblemMap[prob.slug] = {
            ...prob,
            stageTitle: stage.title,
            stageId: stage.id,
            topicTitle: topic.title,
            topicId: topic.id,
          };

          const diffUpper = (prob.difficulty || '').toUpperCase();
          if (diffUpper === 'EASY') totalEasy++;
          else if (diffUpper === 'MEDIUM') totalMedium++;
          else if (diffUpper === 'HARD') totalHard++;
        });
      });
    });

    // 1. Fetch user's distinct solved submission records for roadmap matching
    let userSubs = [];
    try {
      const [rows] = await pool.query(
        `SELECT problem_slug, problem_title, difficulty, solved_at 
         FROM leetcode_submissions 
         WHERE user_id = ? 
         ORDER BY solved_at DESC`,
        [userId]
      );
      userSubs = rows || [];
    } catch (dbErr) {
      console.error('[ROADMAP_DB_ERROR] Failed querying leetcode_submissions for user_id:', userId, {
        message: dbErr.message,
        code: dbErr.code,
        errno: dbErr.errno,
        sqlState: dbErr.sqlState,
        sqlMessage: dbErr.sqlMessage,
      });
      userSubs = [];
    }

    // Distinct solved roadmap slugs
    const solvedRoadmapSlugsSet = new Set();
    // Map of earliest solve timestamp for each distinct solved roadmap slug
    const roadmapSlugSolvedAtMap = {};
    // Full list of unique solved roadmap submissions with earliest solve date
    const solvedRoadmapSubmissions = [];

    // Process from oldest to newest or group by slug
    userSubs.forEach((sub) => {
      if (roadmapSlugsSet.has(sub.problem_slug)) {
        solvedRoadmapSlugsSet.add(sub.problem_slug);
        if (!roadmapSlugSolvedAtMap[sub.problem_slug]) {
          roadmapSlugSolvedAtMap[sub.problem_slug] = sub.solved_at;
          solvedRoadmapSubmissions.push(sub);
        }
      }
    });

    let overallTotal = 0;
    let overallCompleted = 0;

    let completedEasy = 0;
    let completedMedium = 0;
    let completedHard = 0;

    let currentTopic = null;
    let nextIncompleteProblem = null;

    // Build user progress structure & calculate difficulty counts
    const stages = dsaRoadmap.map((stage) => {
      let stageTotal = 0;
      let stageCompleted = 0;

      const topics = stage.topics.map((topic) => {
        let topicTotal = topic.problems.length;
        let topicCompleted = 0;

        const problems = topic.problems.map((prob) => {
          const isCompleted = solvedRoadmapSlugsSet.has(prob.slug);
          if (isCompleted) {
            topicCompleted++;
            const diffUpper = (prob.difficulty || '').toUpperCase();
            if (diffUpper === 'EASY') completedEasy++;
            else if (diffUpper === 'MEDIUM') completedMedium++;
            else if (diffUpper === 'HARD') completedHard++;
          } else {
            if (!nextIncompleteProblem && (!currentTopic || currentTopic.id === topic.id)) {
              nextIncompleteProblem = {
                ...prob,
                stageTitle: stage.title,
                stageId: stage.id,
                topicTitle: topic.title,
                topicId: topic.id,
              };
            }
          }
          return {
            ...prob,
            completed: isCompleted,
            solvedAt: roadmapSlugSolvedAtMap[prob.slug] || null,
          };
        });

        overallTotal += topicTotal;
        overallCompleted += topicCompleted;

        stageTotal += topicTotal;
        stageCompleted += topicCompleted;

        const isTopicCompleted = topicTotal > 0 ? topicCompleted === topicTotal : true;

        const topicData = {
          id: topic.id,
          title: topic.title,
          description: topic.description,
          whyItMatters: topic.whyItMatters,
          connection: topic.connection,
          whenToUse: topic.whenToUse,
          recognitionClues: topic.recognitionClues,
          coreIdea: topic.coreIdea,
          codeTemplates: topic.codeTemplates,
          commonMistakes: topic.commonMistakes,
          completed: topicCompleted,
          total: topicTotal,
          percentage: topicTotal > 0 ? Math.round((topicCompleted / topicTotal) * 100) : 100,
          isCompleted: isTopicCompleted,
          problems,
        };

        // Track the very first incomplete topic
        if (!currentTopic && !isTopicCompleted) {
          currentTopic = {
            id: topic.id,
            title: topic.title,
            stageTitle: stage.title,
            completed: topicCompleted,
            total: topicTotal,
            percentage: topicTotal > 0 ? Math.round((topicCompleted / topicTotal) * 100) : 0,
          };
        }

        return topicData;
      });

      return {
        id: stage.id,
        title: stage.title,
        completed: stageCompleted,
        total: stageTotal,
        percentage: stageTotal > 0 ? Math.round((stageCompleted / stageTotal) * 100) : 100,
        isCompleted: stageTotal > 0 ? stageCompleted === stageTotal : true,
        topics,
      };
    });

    // Fallback if all completed
    if (!currentTopic && dsaRoadmap.length > 0 && dsaRoadmap[0].topics.length > 0) {
      const firstT = dsaRoadmap[0].topics[0];
      currentTopic = {
        id: firstT.id,
        title: firstT.title,
        stageTitle: dsaRoadmap[0].title,
        completed: stages[0].topics[0].completed,
        total: stages[0].topics[0].total,
        percentage: stages[0].topics[0].percentage,
      };
    }

    const overallPercentage = overallTotal > 0 ? Math.round((overallCompleted / overallTotal) * 100) : 0;

    // --- V14.3 STATISTICAL CALCULATIONS ---

    // 1. Difficulty Breakdown
    const difficultyProgress = {
      easy: {
        completed: completedEasy,
        total: totalEasy,
        percentage: totalEasy > 0 ? Math.round((completedEasy / totalEasy) * 1000) / 10 : 0,
      },
      medium: {
        completed: completedMedium,
        total: totalMedium,
        percentage: totalMedium > 0 ? Math.round((completedMedium / totalMedium) * 1000) / 10 : 0,
      },
      hard: {
        completed: completedHard,
        total: totalHard,
        percentage: totalHard > 0 ? Math.round((completedHard / totalHard) * 1000) / 10 : 0,
      },
    };

    // 2. Weekly Activity (Monday -> Sunday in local application time)
    const now = new Date();
    const currentDayOfWeek = now.getDay(); // 0 is Sun, 1 is Mon, ... 6 is Sat
    const distanceToMon = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;

    const mondayObj = new Date(now);
    mondayObj.setDate(now.getDate() - distanceToMon);
    mondayObj.setHours(0, 0, 0, 0);

    const sundayObj = new Date(mondayObj);
    sundayObj.setDate(mondayObj.getDate() + 6);
    sundayObj.setHours(23, 59, 59, 999);

    // Group unique roadmap solved slugs per day string YYYY-MM-DD
    const solveDatesMap = {}; // YYYY-MM-DD -> Set(problem_slug)
    const allUniqueSolveDatesSet = new Set();

    userSubs.forEach((sub) => {
      if (roadmapSlugsSet.has(sub.problem_slug) && sub.solved_at) {
        const dObj = new Date(sub.solved_at);
        const dateStr = dObj.toISOString().split('T')[0];

        if (!solveDatesMap[dateStr]) {
          solveDatesMap[dateStr] = new Set();
        }
        solveDatesMap[dateStr].add(sub.problem_slug);
        allUniqueSolveDatesSet.add(dateStr);
      }
    });

    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weeklyActivity = [];
    let weeklyUniqueProblemsCount = 0;
    let activeDaysThisWeek = 0;

    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(mondayObj);
      dayDate.setDate(mondayObj.getDate() + i);
      const dayStr = dayDate.toISOString().split('T')[0];

      const count = solveDatesMap[dayStr] ? solveDatesMap[dayStr].size : 0;
      if (count > 0) activeDaysThisWeek++;
      weeklyUniqueProblemsCount += count;

      weeklyActivity.push({
        day: daysOfWeek[i],
        date: dayStr,
        count,
      });
    }

    const avgPerActiveDay = activeDaysThisWeek > 0 ? Math.round((weeklyUniqueProblemsCount / activeDaysThisWeek) * 10) / 10 : 0;

    // 3. Roadmap-Specific Streak Calculation
    const uniqueDatesAsc = [...allUniqueSolveDatesSet].sort();
    let currentStreak = 0;
    let longestStreak = 0;

    if (uniqueDatesAsc.length > 0) {
      let currentRun = 0;
      let prevDateMs = null;

      for (const dStr of uniqueDatesAsc) {
        const dMs = new Date(dStr + 'T00:00:00').getTime();
        if (prevDateMs === null) {
          currentRun = 1;
        } else {
          const diffDays = Math.round((dMs - prevDateMs) / (24 * 60 * 60 * 1000));
          if (diffDays === 1) currentRun++;
          else currentRun = 1;
        }
        if (currentRun > longestStreak) longestStreak = currentRun;
        prevDateMs = dMs;
      }

      const todayStr = now.toISOString().split('T')[0];
      const yesterdayObj = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const yesterdayStr = yesterdayObj.toISOString().split('T')[0];

      const dateSet = new Set(uniqueDatesAsc);
      const activeToday = dateSet.has(todayStr);
      const activeYesterday = dateSet.has(yesterdayStr);

      if (activeToday || activeYesterday) {
        let checkDate = activeToday ? now : yesterdayObj;
        let curr = new Date(checkDate);
        while (dateSet.has(curr.toISOString().split('T')[0])) {
          currentStreak++;
          curr.setDate(curr.getDate() - 1);
        }
      }
    }

    // 4. Recently Solved Roadmap Problems (limit 5)
    const recentlySolvedRoadmap = [];
    const seenRecentSlugs = new Set();

    for (const sub of userSubs) {
      if (roadmapSlugsSet.has(sub.problem_slug) && !seenRecentSlugs.has(sub.problem_slug)) {
        seenRecentSlugs.add(sub.problem_slug);
        const meta = slugToProblemMap[sub.problem_slug];
        recentlySolvedRoadmap.push({
          title: sub.problem_title || meta?.title || sub.problem_slug,
          slug: sub.problem_slug,
          difficulty: sub.difficulty || meta?.difficulty || 'EASY',
          topicTitle: meta?.topicTitle || 'General',
          solvedAt: sub.solved_at ? new Date(sub.solved_at).toISOString() : new Date().toISOString(),
        });
        if (recentlySolvedRoadmap.length >= 5) break;
      }
    }

    // --- V14.4 REVISION CALCULATIONS ---

    // Collect all topics with their stage title
    const allTopicsList = [];
    stages.forEach((stage) => {
      stage.topics.forEach((topic) => {
        allTopicsList.push({
          ...topic,
          stageTitle: stage.title,
          stageId: stage.id,
        });
      });
    });

    // 1. Topics To Continue: Incomplete topics ordered strictly by roadmap sequence
    const incompleteTopics = allTopicsList
      .filter((topic) => !topic.isCompleted)
      .map((topic) => {
        const firstIncompleteProb = topic.problems.find((p) => !p.completed) || topic.problems[0] || null;
        return {
          id: topic.id,
          title: topic.title,
          stageTitle: topic.stageTitle,
          completed: topic.completed,
          total: topic.total,
          percentage: topic.percentage,
          firstIncompleteSlug: firstIncompleteProb ? firstIncompleteProb.slug : null,
          firstIncompleteTitle: firstIncompleteProb ? firstIncompleteProb.title : null,
        };
      });

    // 2. Completed Topics: Fully completed topics
    const completedTopics = allTopicsList
      .filter((topic) => topic.isCompleted)
      .map((topic) => ({
        id: topic.id,
        title: topic.title,
        stageTitle: topic.stageTitle,
        completed: topic.completed,
        total: topic.total,
        percentage: topic.percentage,
        problemsCount: topic.problems.length,
      }));

    // 3. Topics With More Practice Remaining: Incomplete topics sorted by lowest completion % first (roadmap order tiebreaker)
    const morePracticeTopics = [...incompleteTopics].sort((a, b) => {
      if (a.percentage !== b.percentage) {
        return a.percentage - b.percentage;
      }
      return 0; // maintain roadmap insertion order
    });

    // 4. Deterministic Quick Revision Problem Selection
    // Priority:
    // 1. First incomplete problem in the current incomplete topic
    // 2. First incomplete problem in the next incomplete topic in sequence
    // 3. If all 100% completed, deterministic problem based on day of year
    let quickRevision = null;
    if (nextIncompleteProblem) {
      quickRevision = {
        title: nextIncompleteProblem.title,
        slug: nextIncompleteProblem.slug,
        difficulty: nextIncompleteProblem.difficulty,
        topicTitle: nextIncompleteProblem.topicTitle,
        stageTitle: nextIncompleteProblem.stageTitle,
        reason: 'Current active incomplete problem in roadmap sequence',
      };
    } else if (allTopicsList.length > 0 && allTopicsList[0].problems.length > 0) {
      // 100% Roadmap Completed fallback
      const startOfYear = new Date(now.getFullYear(), 0, 0);
      const diff = now - startOfYear;
      const oneDay = 1000 * 60 * 60 * 24;
      const dayOfYear = Math.floor(diff / oneDay);
      const fallbackIdx = dayOfYear % roadmapSlugsSet.size;

      let counter = 0;
      let selectedProb = null;
      for (const stage of stages) {
        for (const topic of stage.topics) {
          for (const prob of topic.problems) {
            if (counter === fallbackIdx) {
              selectedProb = {
                title: prob.title,
                slug: prob.slug,
                difficulty: prob.difficulty,
                topicTitle: topic.title,
                stageTitle: stage.title,
                reason: 'Completed roadmap review suggestion',
              };
              break;
            }
            counter++;
          }
          if (selectedProb) break;
        }
        if (selectedProb) break;
      }
      quickRevision = selectedProb || {
        title: dsaRoadmap[0].topics[0].problems[0].title,
        slug: dsaRoadmap[0].topics[0].problems[0].slug,
        difficulty: dsaRoadmap[0].topics[0].problems[0].difficulty,
        topicTitle: dsaRoadmap[0].topics[0].title,
        stageTitle: dsaRoadmap[0].title,
        reason: 'Completed roadmap review suggestion',
      };
    }

    // 5. Deterministic Daily Revision Problem Selection
    // Based on dayOfYear % totalProblems
    const startOfYear = new Date(now.getFullYear(), 0, 0);
    const diff = now - startOfYear;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    const dailyIdx = dayOfYear % (overallTotal > 0 ? overallTotal : 1);

    let dailyCounter = 0;
    let dailyRevision = null;
    for (const stage of stages) {
      for (const topic of stage.topics) {
        for (const prob of topic.problems) {
          if (dailyCounter === dailyIdx) {
            dailyRevision = {
              title: prob.title,
              slug: prob.slug,
              difficulty: prob.difficulty,
              topicTitle: topic.title,
              stageTitle: stage.title,
              completed: prob.completed,
              dayOfYear,
            };
            break;
          }
          dailyCounter++;
        }
        if (dailyRevision) break;
      }
      if (dailyRevision) break;
    }

    const recommendedNext = nextIncompleteProblem;

    return res.status(200).json({
      success: true,
      data: {
        overall: {
          completed: overallCompleted,
          total: overallTotal,
          percentage: overallPercentage,
          isComplete: overallCompleted === overallTotal && overallTotal > 0,
        },
        difficultyProgress,
        currentTopic,
        recommendedNext,
        weeklyStats: {
          weeklyActivity,
          problemsSolvedThisWeek: weeklyUniqueProblemsCount,
          activeDaysThisWeek,
          avgPerActiveDay,
        },
        streak: {
          currentStreak,
          longestStreak,
        },
        recentlySolvedRoadmap,
        revision: {
          incompleteTopics,
          completedTopics,
          morePracticeTopics,
          quickRevision,
          dailyRevision,
        },
        stages,
      },
    });
  } catch (error) {
    console.error('[ROADMAP_CONTROLLER_ERROR] GET /api/roadmap/me failed for user_id:', req?.user?.id, {
      message: error.message,
      stack: error.stack,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage,
    });
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch DSA Journey progress.',
    });
  }
};

