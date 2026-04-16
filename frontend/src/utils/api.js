import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://electricity-billing-system-yar7.onrender.com',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('ebs_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('ebs_token');
      localStorage.removeItem('ebs_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default API;
