const axios = require('axios');

/**
 * Validates and fetches public LeetCode stats for a given username.
 * @param {string} username - LeetCode username
 * @returns {Promise<Object>} Normalized LeetCode statistics
 */
async function getLeetCodeStats(username) {
  if (!username || typeof username !== 'string' || !username.trim()) {
    const err = new Error('Please provide a valid LeetCode username.');
    err.statusCode = 400;
    throw err;
  }

  const cleanUsername = username.trim();

  if (!/^[a-zA-Z0-9_-]+$/.test(cleanUsername)) {
    const err = new Error('LeetCode username contains invalid characters.');
    err.statusCode = 400;
    throw err;
  }

  const graphqlQuery = {
    query: `
      query userPublicStats($username: String!) {
        matchedUser(username: $username) {
          username
          profile {
            ranking
          }
          submitStats {
            acSubmissionNum {
              difficulty
              count
            }
          }
        }
        allQuestionsCount {
          difficulty
          count
        }
      }
    `,
    variables: { username: cleanUsername },
  };

  try {
    const response = await axios.post('https://leetcode.com/graphql', graphqlQuery, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Referer: 'https://leetcode.com',
      },
      timeout: 10000,
    });

    const data = response.data?.data;

    if (!data || !data.matchedUser) {
      const err = new Error('LeetCode user not found');
      err.statusCode = 404;
      throw err;
    }

    const matchedUser = data.matchedUser;
    const acSubmissions = matchedUser.submitStats?.acSubmissionNum || [];

    let totalSolved = 0;
    let easySolved = 0;
    let mediumSolved = 0;
    let hardSolved = 0;

    acSubmissions.forEach((item) => {
      if (item.difficulty === 'All') totalSolved = item.count || 0;
      if (item.difficulty === 'Easy') easySolved = item.count || 0;
      if (item.difficulty === 'Medium') mediumSolved = item.count || 0;
      if (item.difficulty === 'Hard') hardSolved = item.count || 0;
    });

    let totalQuestions = null;
    if (Array.isArray(data.allQuestionsCount)) {
      const allItem = data.allQuestionsCount.find((q) => q.difficulty === 'All');
      if (allItem) {
        totalQuestions = allItem.count;
      }
    }

    const ranking = matchedUser.profile?.ranking || null;

    return {
      username: matchedUser.username || cleanUsername,
      totalSolved,
      easySolved,
      mediumSolved,
      hardSolved,
      totalQuestions,
      ranking,
    };
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }

    if (error.code === 'ECONNABORTED') {
      const err = new Error('Unable to fetch LeetCode data right now (timeout). Please try again later.');
      err.statusCode = 504;
      throw err;
    }

    if (error.response) {
      if (error.response.status === 429) {
        const err = new Error('LeetCode rate limit reached. Please wait a moment and try again.');
        err.statusCode = 429;
        throw err;
      }
      if (error.response.status === 404) {
        const err = new Error('LeetCode user not found');
        err.statusCode = 404;
        throw err;
      }
    }

    console.error(`LeetCode Service Error for '${cleanUsername}':`, error.message);
    const err = new Error('Unable to fetch LeetCode data right now. Please try again later.');
    err.statusCode = 503;
    throw err;
  }
}

/**
 * Fetches recent accepted submissions for a LeetCode username.
 * @param {string} username - LeetCode username
 * @returns {Promise<Array>} Normalized array of recent accepted submissions
 */
async function getRecentLeetCodeActivity(username) {
  if (!username || typeof username !== 'string' || !username.trim()) {
    const err = new Error('Please provide a valid LeetCode username.');
    err.statusCode = 400;
    throw err;
  }

  const cleanUsername = username.trim();

  if (!/^[a-zA-Z0-9_-]+$/.test(cleanUsername)) {
    const err = new Error('LeetCode username contains invalid characters.');
    err.statusCode = 400;
    throw err;
  }

  const graphqlQuery = {
    query: `
      query recentAcSubmissions($username: String!, $limit: Int!) {
        recentAcSubmissionList(username: $username, limit: $limit) {
          title
          titleSlug
          timestamp
        }
      }
    `,
    variables: { username: cleanUsername, limit: 5 },
  };

  try {
    const response = await axios.post('https://leetcode.com/graphql', graphqlQuery, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Referer: 'https://leetcode.com',
      },
      timeout: 10000,
    });

    if (response.data?.errors && response.data.errors.length > 0) {
      const err = new Error('LeetCode GraphQL error occurred');
      err.statusCode = 502;
      throw err;
    }

    const data = response.data?.data;

    // Check for malformed response
    if (!data || !Array.isArray(data.recentAcSubmissionList)) {
      const err = new Error('Malformed or unexpected response from LeetCode');
      err.statusCode = 502;
      throw err;
    }

    const submissions = data.recentAcSubmissionList;

    // Valid response with no accepted submissions -> return []
    if (submissions.length === 0) {
      return [];
    }

    // Valid response with submissions -> return normalized array
    return submissions.slice(0, 5).map((item) => ({
      title: item.title || 'Untitled Problem',
      slug: item.titleSlug || null,
      timestamp: item.timestamp ? parseInt(item.timestamp, 10) * 1000 : null,
      language: null,
    }));
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }

    console.error(`getRecentLeetCodeActivity error for '${cleanUsername}':`, error.message);
    const err = new Error('Unable to fetch recent LeetCode activity.');
    err.statusCode = 502;
    throw err;
  }
}

module.exports = {
  getLeetCodeStats,
  getRecentLeetCodeActivity,
};
