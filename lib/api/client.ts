/**
 * API Client configuration
 * Axios instance with authentication and token refresh
 */
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor - Add authentication token
apiClient.interceptors.request.use(
  (config) => {
    // Only add token for client-side requests
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token expiration
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Try to refresh token
      if (typeof window !== 'undefined') {
        const refreshToken = localStorage.getItem('refresh_token');

        if (refreshToken) {
          try {
            const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
              refresh_token: refreshToken,
            });

            // Save new tokens
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('refresh_token', data.refresh_token);

            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
            return axios(originalRequest);
          } catch {
            // Refresh failed, clear tokens and redirect to login
            const cookieConsent = localStorage.getItem('cookie-consent');
            localStorage.clear();
            if (cookieConsent) {
              localStorage.setItem('cookie-consent', cookieConsent);
            }
            if (typeof window !== 'undefined') {
              window.location.href = '/?error=session_expired';
            }
          }
        } else {
          // No refresh token, redirect to login
          const cookieConsent = localStorage.getItem('cookie-consent');
          localStorage.clear();
          if (cookieConsent) {
            localStorage.setItem('cookie-consent', cookieConsent);
          }
          if (typeof window !== 'undefined') {
            window.location.href = '/?error=no_token';
          }
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
