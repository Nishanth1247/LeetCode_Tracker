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

export const getChallengeProgress = async (id) => {
  const res = await api.get(`/challenges/${id}/progress`);
  return res.data;
};

// Admin Submissions History helper
export const getAdminSubmissions = async (userId, from, to) => {
  const res = await api.get('/admin/submissions', {
    params: { userId, from, to },
  });
  return res.data;
};

export default api;
