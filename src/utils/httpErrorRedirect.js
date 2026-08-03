/** Map HTTP status → route trang lỗi tương ứng */
export const HTTP_ERROR_ROUTES = {
  401: '/401',
  403: '/403',
  404: '/404',
  500: '/500',
  502: '/503',
  503: '/503',
};

export const LOGIN_SESSION_EXPIRED_KEY = 'loginSessionExpiredMessage';
export const SESSION_EXPIRED_TOAST =
  'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại';

const AUTH_PATH_PREFIXES = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh-token',
  '/auth/logout',
  '/auth/verify-email',
  '/auth/exchange-code',
  '/auth/google',
];

function isAuthRequest(url = '') {
  return AUTH_PATH_PREFIXES.some((prefix) => url.includes(prefix));
}

function isErrorPagePath(pathname = '') {
  return Object.values(HTTP_ERROR_ROUTES).some((route) => pathname === route);
}

/** Chỉ chấp nhận path nội bộ — tránh open redirect */
export function sanitizeInternalRedirect(path) {
  if (!path || typeof path !== 'string') return null;
  const trimmed = path.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) return null;
  if (trimmed.startsWith('/login')) return null;
  return trimmed;
}

/**
 * Có nên bỏ qua redirect toàn cục tới trang lỗi không.
 * - skipErrorRedirect: true → luôn bỏ qua (API phụ)
 * - skipErrorRedirectStatuses: [404] → bỏ qua các status cụ thể
 * - redirectOn404: true → cho phép redirect khi API trả 404
 */
export function shouldSkipHttpErrorRedirect(status, config = {}) {
  if (config.skipErrorRedirect) return true;
  if (config.skipErrorRedirectStatuses?.includes(status)) return true;
  if (status === 401 && isAuthRequest(config.url)) return true;
  if (status === 404 && !config.redirectOn404) return true;
  return false;
}

export function getHttpErrorRoute(status) {
  return HTTP_ERROR_ROUTES[status] || null;
}

/**
 * Luồng chuẩn khi 401 (hết phiên / token không hợp lệ):
 * → /login?redirect=... + flash toast trên trang login.
 *
 * Route /401 giữ lại cho trường hợp đặc biệt (truy cập trực tiếp, link ngoài luồng),
 * KHÔNG dùng trong luồng tự động interceptor.
 */
export function redirectToLoginWithReturn(fromPath) {
  const { pathname, search } = window.location;
  if (pathname.startsWith('/login')) return false;

  const current = fromPath ?? `${pathname}${search}`;
  const safe = sanitizeInternalRedirect(current) ?? '/';

  try {
    sessionStorage.setItem(LOGIN_SESSION_EXPIRED_KEY, SESSION_EXPIRED_TOAST);
  } catch {
    /* ignore */
  }

  window.location.href = `/login?redirect=${encodeURIComponent(safe)}`;
  return true;
}

/**
 * Điều hướng sang trang lỗi HTTP (403, 500, 503…) — full page load trong axios interceptor.
 * 401 KHÔNG xử lý tại đây; dùng redirectToLoginWithReturn.
 */
export function redirectToHttpErrorPage(status, config = {}) {
  if (status === 401) return false;
  if (shouldSkipHttpErrorRedirect(status, config)) return false;

  const route = getHttpErrorRoute(status);
  if (!route) return false;

  const { pathname } = window.location;
  if (isErrorPagePath(pathname)) return false;

  window.location.href = route;
  return true;
}

/** Path login kèm redirect (legacy — trang /401 vẫn có thể dùng state) */
export function buildLoginRedirectPath(from = '/') {
  const safeFrom = sanitizeInternalRedirect(from) ?? '/';
  return {
    pathname: '/login',
    search: `?redirect=${encodeURIComponent(safeFrom)}`,
    state: { redirectTo: safeFrom },
  };
}
