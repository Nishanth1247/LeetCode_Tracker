const { pool } = require('../config/db');
const dsaRoadmap = require('../data/dsaRoadmap');

exports.getMyRoadmapProgress = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Efficiently query all distinct problem_slug solved by this authenticated user
    const [userSubs] = await pool.query(
      `SELECT DISTINCT problem_slug 
       FROM leetcode_submissions 
       WHERE user_id = ?`,
      [userId]
    );

    const solvedSlugsSet = new Set(userSubs.map((s) => s.problem_slug));

    let overallTotal = 0;
    let overallCompleted = 0;

    let currentTopic = null;

    // Build user progress structure
    const stages = dsaRoadmap.map((stage) => {
      let stageTotal = 0;
      let stageCompleted = 0;

      const topics = stage.topics.map((topic) => {
        let topicTotal = topic.problems.length;
        let topicCompleted = 0;

        const problems = topic.problems.map((prob) => {
          const isCompleted = solvedSlugsSet.has(prob.slug);
          if (isCompleted) {
            topicCompleted++;
          }
          return {
            ...prob,
            completed: isCompleted,
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
          explanation: topic.explanation,
          recognitionClues: topic.recognitionClues,
          basicIdea: topic.basicIdea,
          completed: topicCompleted,
          total: topicTotal,
          percentage: topicTotal > 0 ? Math.round((topicCompleted / topicTotal) * 100) : 100,
          isCompleted: isTopicCompleted,
          problems,
        };

        // Track the very first incomplete topic (or the first topic if 0 total)
        if (!currentTopic && (!isTopicCompleted || topicTotal === 0)) {
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

    return res.status(200).json({
      success: true,
      data: {
        overall: {
          completed: overallCompleted,
          total: overallTotal,
          percentage: overallPercentage,
        },
        currentTopic,
        stages,
      },
    });
  } catch (error) {
    console.error('getMyRoadmapProgress error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch DSA Journey progress.',
    });
  }
};
