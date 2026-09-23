import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

// Google Login API helper
export const loginWithGoogle = async (credential) => {
  const res = await api.post('/auth/google', { credential });
  return res.data;
};

// LeetCode API helper methods
export const connectLeetCode = async (username) => {
  const res = await api.post('/leetcode/connect', { username });
  return res.data;
};

export const syncLeetCode = async () => {
  const res = await api.post('/leetcode/sync');
  return res.data;
};

export const getMyLeetCodeStats = async () => {
  const res = await api.get('/leetcode/me');
  return res.data;
};

// Leaderboard API helper method
export const getLeaderboard = async () => {
  const res = await api.get('/leaderboard');
  return res.data;
};

// Leaderboard Privacy helper methods
export const getLeaderboardPrivacy = async () => {
  const res = await api.get('/users/me/leaderboard-privacy');
  return res.data;
};

export const updateLeaderboardPrivacy = async (leaderboardOptIn) => {
  const res = await api.put('/users/me/leaderboard-privacy', { leaderboardOptIn });
  return res.data;
};

// Member Activity helper method
export const getMyActivity = async () => {
  const res = await api.get('/activity/me');
  return res.data;
};

// Analytics API helper methods
export const getMyAnalytics = async () => {
  const res = await api.get('/analytics/me');
  return res.data;
};

export const getMyDailyAnalytics = async (date) => {
  const res = await api.get(`/analytics/me/daily${date ? `?date=${date}` : ''}`);
  return res.data;
};

export const getMyWeekAnalytics = async (startDate) => {
  const res = await api.get(`/analytics/me/week${startDate ? `?startDate=${startDate}` : ''}`);
  return res.data;
};

export const getAdminMemberDailyAnalytics = async (userId, date) => {
  const res = await api.get(`/analytics/admin/member-daily?userId=${userId}${date ? `&date=${date}` : ''}`);
  return res.data;
};

export const getTeamDailyAnalytics = async (teamId, date) => {
  const res = await api.get(`/analytics/team-daily?teamId=${teamId}${date ? `&date=${date}` : ''}`);
  return res.data;
};

export const getTeamAnalytics = async () => {
  const res = await api.get('/analytics/team');
  return res.data;
};

// Teams API helpers
export const getAllTeams = async () => {
  const res = await api.get('/teams');
  return res.data;
};

export const getTeamById = async (id) => {
  const res = await api.get(`/teams/${id}`);
  return res.data;
};

export const createTeam = async (data) => {
  const res = await api.post('/teams', data);
  return res.data;
};

export const updateTeam = async (id, data) => {
  const res = await api.put(`/teams/${id}`, data);
  return res.data;
};

export const deleteTeam = async (id) => {
  const res = await api.delete(`/teams/${id}`);
  return res.data;
};

export const addTeamMember = async (teamId, userId) => {
  const res = await api.post(`/teams/${teamId}/members`, { userId });
  return res.data;
};

export const removeTeamMember = async (teamId, userId) => {
  const res = await api.delete(`/teams/${teamId}/members/${userId}`);
  return res.data;
};

export const getMyTeam = async () => {
  const res = await api.get('/teams/me');
  return res.data;
};

// Challenges API helpers
export const getAllChallenges = async () => {
  const res = await api.get('/challenges');
  return res.data;
};

export const getChallengeById = async (id) => {
  const res = await api.get(`/challenges/${id}`);
  return res.data;
};

export const createChallenge = async (data) => {
  const res = await api.post('/challenges', data);
  return res.data;
};

export const updateChallenge = async (id, data) => {
  const res = await api.put(`/challenges/${id}`, data);
  return res.data;
};

export const deleteChallenge = async (id) => {
  const res = await api.delete(`/challenges/${id}`);
  return res.data;
};

export const getMyChallenges = async () => {
  const res = await api.get('/challenges/me');
  return res.data;
};

export const createIndividualChallenge = async (data) => {
  const res = await api.post('/challenges/individual', data);
  return res.data;
};

export const updateIndividualChallenge = async (id, data) => {
  const res = await api.put(`/challenges/individual/${id}`, data);
  return res.data;
};

export const deleteIndividualChallenge = async (id) => {
  const res = await api.delete(`/challenges/individual/${id}`);
  return res.data;
};

export const getChallengeProgress = async (id) => {
  const res = await api.get(`/challenges/${id}/progress`);
  return res.data;
};

// Admin Submissions History helper
export const getAdminSubmissions = async (userId, from, to) => {
  const res = await api.get(`/admin/submissions?userId=${userId}&from=${from}&to=${to}`);
  return res.data;
};

export const getAdminStreaks = async () => {
  const res = await api.get('/admin/streaks');
  return res.data;
};

export const getAdminMemberStreakDetail = async (userId) => {
  const res = await api.get(`/admin/streaks/${userId}`);
  return res.data;
};

export const getAdminSyncStatus = async () => {
  const res = await api.get('/admin/sync-status');
  return res.data;
};

// Member Personal Goals & Performance helpers (V11)
export const getMyGoals = async () => {
  const res = await api.get('/goals/me');
  return res.data;
};

export const updateMyGoals = async (data) => {
  const res = await api.put('/goals/me', data);
  return res.data;
};

export const getMyPerformanceSummary = async () => {
  const res = await api.get('/analytics/me/performance');
  return res.data;
};

// Admin Team & Member Performance helpers (V11)
export const getAdminTeamPerformance = async () => {
  const res = await api.get('/admin/team-performance');
  return res.data;
};

export const getAdminMemberPerformance = async () => {
  const res = await api.get('/admin/member-performance');
  return res.data;
};

export const getAdminMemberPerformanceDetail = async (userId) => {
  const res = await api.get(`/admin/member-performance/${userId}`);
  return res.data;
};

// Admin User Management helpers
export const getAdminDashboardOverview = async () => {
  const res = await api.get('/admin/dashboard');
  return res.data;
};

export const getAdminUsers = async () => {
  const res = await api.get('/admin/users');
  return res.data;
};

export const getAdminUser = async (id) => {
  const res = await api.get(`/admin/users/${id}`);
  return res.data;
};

export const updateAdminUser = async (id, data) => {
  const res = await api.put(`/admin/users/${id}`, data);
  return res.data;
};

export const deleteAdminUser = async (id) => {
  const res = await api.delete(`/admin/users/${id}`);
  return res.data;
};

// Admin Member Language Analytics helper (V12.1)
export const getAdminMemberLanguageAnalytics = async (userId) => {
  const res = await api.get(`/admin/language-analytics/${userId}`);
  return res.data;
};

// Practice Suggestions helper (V13.3)
export const getPracticeSuggestions = async () => {
  const res = await api.get('/recommendations/me');
  return res.data;
};

// DSA Journey Roadmap helper (V14)
export const getMyRoadmapProgress = async () => {
  const res = await api.get('/roadmap/me');
  return res.data;
};

// DSA Personal Learning Notes helpers (V14.5)
export const getMyRoadmapNotes = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await api.get(`/roadmap/notes${query ? `?${query}` : ''}`);
  return res.data;
};

export const getProblemRoadmapNotes = async (slug) => {
  const res = await api.get(`/roadmap/notes/problem/${slug}`);
  return res.data;
};

export const getTopicRoadmapNotes = async (topicId) => {
  const res = await api.get(`/roadmap/notes/topic/${topicId}`);
  return res.data;
};

export const getMistakeReview = async () => {
  const res = await api.get('/roadmap/mistakes');
  return res.data;
};

export const createRoadmapNote = async (data) => {
  const res = await api.post('/roadmap/notes', data);
  return res.data;
};

export const updateRoadmapNote = async (id, data) => {
  const res = await api.put(`/roadmap/notes/${id}`, data);
  return res.data;
};

export const deleteRoadmapNote = async (id) => {
  const res = await api.delete(`/roadmap/notes/${id}`);
  return res.data;
};

export default api;
