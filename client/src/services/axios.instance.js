import axios from 'axios';

const resolvedBaseURL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AUTH_TOKEN_KEY = 'final-third-auth-token';

const api = axios.create({
  baseURL: resolvedBaseURL,
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem(AUTH_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }
  return config;
});

export default api;
