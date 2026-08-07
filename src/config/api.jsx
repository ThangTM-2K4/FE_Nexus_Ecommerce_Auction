import axios from 'axios';
import { API_BASE_URL } from './endpoints';
import {
  redirectToHttpErrorPage,
  redirectToLoginWithReturn,
} from '../utils/httpErrorRedirect';

const clearAuthStorage = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('expiresAt');
};

export const BACKEND_BASE_URL = (import.meta.env.DEV && !import.meta.env.VITE_DISABLE_PROXY)
  ? '/api/v1'
  : (API_BASE_URL || '/api/v1');

const api = axios.create({
  baseURL: BACKEND_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue = [];
let isRedirectingToLogin = false;

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

/**
 * 401 thống nhất → /login?redirect=... (không dùng /401 trong luồng chuẩn).
 * Route /401 giữ cho trường hợp đặc biệt / truy cập trực tiếp.
 */
const handleUnauthorized = () => {
  if (isRedirectingToLogin || window.location.pathname.startsWith('/login')) {
    return;
  }
  isRedirectingToLogin = true;
  clearAuthStorage();
  redirectToLoginWithReturn();
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const isAuthPath = config.url?.includes('/auth/');
    if (!isAuthPath && ['post', 'put', 'delete', 'patch'].includes(config.method?.toLowerCase())) {
      const uuid = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : '00000000-0000-0000-0000-000000000001';

      config.headers['Idempotency-Key'] = config.headers['Idempotency-Key'] || uuid;
      config.headers['X-Idempotency-Key'] = config.headers['X-Idempotency-Key'] || uuid;
      config.headers['IdempotencyKey'] = config.headers['IdempotencyKey'] || uuid;
      config.headers['X-Operation-Key'] = config.headers['X-Operation-Key'] || uuid;
      config.headers['OperationKey'] = config.headers['OperationKey'] || uuid;

      if (config.data && typeof config.data === 'object' && !(config.data instanceof FormData)) {
        if (!config.data.idempotencyKey) config.data.idempotencyKey = uuid;
        if (!config.data.IdempotencyKey) config.data.IdempotencyKey = uuid;
        if (!config.data.operationKey) config.data.operationKey = uuid;
        if (!config.data.OperationKey) config.data.OperationKey = uuid;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);


api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    const requestUrl = originalRequest?.url || '';
    const isAuthUrl =
      requestUrl.includes('/auth/refresh-token') ||
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/logout') ||
      requestUrl.includes('/auth/register') ||
      requestUrl.includes('/auth/verify-email') ||
      requestUrl.includes('/auth/exchange-code');

    const storedRefreshToken = localStorage.getItem('refreshToken');

    // Cố gắng refresh token khi gặp 401 hoặc 403 (Backend Spring Security thường trả 403 khi token hết hạn)
    if (
      originalRequest &&
      !originalRequest._retry &&
      (status === 401 || status === 403) &&
      !isAuthUrl &&
      storedRefreshToken
    ) {
      originalRequest._retry = true;

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

      isRefreshing = true;

      try {
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
        handleUnauthorized();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (originalRequest?.skipErrorRedirect) {
      return Promise.reject(error);
    }

    if (status === 401) {
      const isPublicPath =
        originalRequest?.url?.includes('/categories') ||
        originalRequest?.url?.includes('/products') ||
        originalRequest?.url?.includes('/ecommerce');
      if (!isPublicPath) {
        handleUnauthorized();
      }
    } else if (status === 404) {
      // Bỏ qua tự động chuyển hướng trang /404 khi API trả về 404 (để UI trang tự xử lý hiển thị)
      return Promise.reject(error);
    } else if (status && originalRequest) {
      redirectToHttpErrorPage(status, originalRequest);
    }

    return Promise.reject(error);
  }
);

export default api;
