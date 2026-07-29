/** Map HTTP status → route trang lỗi tương ứng */
export const HTTP_ERROR_ROUTES = {
  401: '/401',
  403: '/403',
  404: '/404',
  500: '/500',
  502: '/503',
  503: '/503',
};

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

/**
 * Có nên bỏ qua redirect toàn cục tới trang lỗi không.
 * - skipErrorRedirect: true → luôn bỏ qua
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
 * Điều hướng sang trang lỗi tương ứng HTTP status (full page load — dùng trong axios interceptor).
 */
export function redirectToHttpErrorPage(status, config = {}) {
  if (shouldSkipHttpErrorRedirect(status, config)) return false;

  const route = getHttpErrorRoute(status);
  if (!route) return false;

  const { pathname, search } = window.location;
  if (isErrorPagePath(pathname)) return false;

  if (status === 401) {
    const from = `${pathname}${search}`;
    window.location.href = `${route}?from=${encodeURIComponent(from)}`;
    return true;
  }

  window.location.href = route;
  return true;
}

/** Path login kèm redirect (dùng từ trang /401) */
export function buildLoginRedirectPath(from = '/') {
  const safeFrom = from && from.startsWith('/') ? from : '/';
  return { pathname: '/login', state: { redirectTo: safeFrom } };
}
