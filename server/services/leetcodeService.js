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

/**
 * Fetches difficulty for a LeetCode problem by its titleSlug.
 * Returns 'EASY', 'MEDIUM', 'HARD', or null on failure.
 * @param {string} titleSlug
 * @returns {Promise<string|null>}
 */
async function getProblemDifficulty(titleSlug) {
  try {
    const q = {
      query: `query questionData($titleSlug: String!) {
        question(titleSlug: $titleSlug) { difficulty }
      }`,
      variables: { titleSlug },
    };
    const r = await axios.post('https://leetcode.com/graphql', q, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Referer: 'https://leetcode.com',
      },
      timeout: 8000,
    });
    const raw = r.data?.data?.question?.difficulty;
    if (!raw) return null;
    // Normalize to uppercase ENUM value (Easy -> EASY, Medium -> MEDIUM, Hard -> HARD)
    return raw.toUpperCase();
  } catch {
    return null;
  }
}

/**
 * Fetches available accepted submission history for a LeetCode username (up to 20 recent AC submissions).
 * Retrieves language from the submission list and difficulty via per-slug problem metadata queries.
 * @param {string} username - LeetCode username
 * @returns {Promise<Array>} Normalized array of submission records
 */
async function getAcceptedSubmissionHistory(username) {
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

  // Include lang and langName -- confirmed present in recentAcSubmissionList
  const graphqlQuery = {
    query: `
      query recentAcSubmissions($username: String!, $limit: Int!) {
        recentAcSubmissionList(username: $username, limit: $limit) {
          id
          title
          titleSlug
          timestamp
          lang
          langName
        }
      }
    `,
    variables: { username: cleanUsername, limit: 20 },
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

    if (!data || !Array.isArray(data.recentAcSubmissionList)) {
      return [];
    }

    const submissions = data.recentAcSubmissionList;
    if (submissions.length === 0) return [];

    // Fetch difficulty for each unique slug (avoid redundant queries for the same problem)
    const uniqueSlugs = [...new Set(submissions.map((s) => s.titleSlug).filter(Boolean))];
    const difficultyMap = {};
    for (const slug of uniqueSlugs) {
      difficultyMap[slug] = await getProblemDifficulty(slug);
      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return submissions.map((item) => ({
      problemTitle: item.title || 'Untitled Problem',
      problemSlug: item.titleSlug || 'untitled-problem',
      difficulty: difficultyMap[item.titleSlug] || null,
      // langName is the display name (e.g. "Java"), lang is the short code (e.g. "java")
      language: item.langName || item.lang || null,
      solvedAt: item.timestamp ? new Date(parseInt(item.timestamp, 10) * 1000) : new Date(),
    }));
  } catch (error) {
    if (error.statusCode) throw error;
    console.error(`getAcceptedSubmissionHistory error for '${cleanUsername}':`, error.message);
    return [];
  }
}

module.exports = {
  getLeetCodeStats,
  getRecentLeetCodeActivity,
  getAcceptedSubmissionHistory,
};
