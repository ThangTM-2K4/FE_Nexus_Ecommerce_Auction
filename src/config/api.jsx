import axios from 'axios';

const clearAuthStorage = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('expiresAt');
};

export const BACKEND_BASE_URL =
  'https://api-gateway-staging.whitepond-c634a77b.southeastasia.azurecontainerapps.io/api/v1';

const api = axios.create({
  baseURL: BACKEND_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest || error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    const requestUrl = originalRequest.url || '';
    if (
      requestUrl.includes('/auth/refresh-token') ||
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/logout') ||
      requestUrl.includes('/auth/register') ||
      requestUrl.includes('/auth/verify-email') ||
      requestUrl.includes('/auth/exchange-code')
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const storedRefreshToken = localStorage.getItem('refreshToken');
      if (!storedRefreshToken) {
        throw error;
      }

      const { data } = await axios.post(
        `${BACKEND_BASE_URL}/auth/refresh-token`,
        { refreshToken: storedRefreshToken },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const accessToken = data?.accessToken;
      if (!accessToken) {
        throw error;
      }

      localStorage.setItem('accessToken', accessToken);
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      if (data.user) {
        const prev = JSON.parse(localStorage.getItem('user') || 'null');
        const merged = {
          ...prev,
          ...data.user,
          id: data.user.id ?? data.user.userId ?? prev?.id,
          currentMode: data.user.currentMode ?? prev?.currentMode ?? 'BUYER',
          sellerStatus: data.user.sellerStatus ?? prev?.sellerStatus ?? null,
        };
        localStorage.setItem('user', JSON.stringify(merged));
      }
      localStorage.setItem('expiresAt', String(Date.now() + 3 * 24 * 60 * 60 * 1000));

      processQueue(null, accessToken);
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      clearAuthStorage();

      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
