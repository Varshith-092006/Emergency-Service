import axios from 'axios';
import { toast } from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache'
  }
});

// Request interceptor
api.interceptors.request.use(config => {
  const newConfig = { ...config };
  // Clean up undefined params
  if (newConfig.params) {
    newConfig.params = Object.fromEntries(
      Object.entries(newConfig.params).filter(([_, v]) => v !== undefined && v !== '')
    );
  }
  return newConfig;
});

// Response interceptor with retry logic
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    // Retry only on timeout/aborted and not already retried
    if (error.code === 'ECONNABORTED' && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Show toast notification
      toast('Connection is slow. Retrying...', {
        icon: '⏳',
        duration: 2000
      });
      
      // Wait 2 seconds before retrying
      await new Promise(resolve => setTimeout(resolve, 2000));
      return api(originalRequest);
    }
    
    return Promise.reject(error);
  }
);

export default api;