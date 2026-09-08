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

// Member Activity helper method
export const getMyActivity = async () => {
  const res = await api.get('/activity/me');
  return res.data;
};

export default api;
