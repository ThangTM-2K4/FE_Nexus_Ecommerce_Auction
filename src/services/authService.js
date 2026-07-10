import api from '../config/api';

const SESSION_KEY = 'user';
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const EXPIRES_AT_KEY = 'expiresAt';

const SESSION_DURATION_MS = 3 * 24 * 60 * 60 * 1000;

const readStoredUser = () => {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const unwrapAuthPayload = (payload) => {
  if (!payload || typeof payload !== 'object') return null;

  if (
    payload.data &&
    typeof payload.data === 'object' &&
    (payload.data.accessToken || payload.data.user || payload.data.userId || payload.data.id)
  ) {
    return payload.data;
  }

  if (payload.result && typeof payload.result === 'object') {
    return payload.result;
  }

  return payload;
};

const extractUserSource = (authPayload) => {
  if (!authPayload) return null;

  if (authPayload.user && typeof authPayload.user === 'object') {
    return authPayload.user;
  }

  if (authPayload.userInfo && typeof authPayload.userInfo === 'object') {
    return authPayload.userInfo;
  }

  if (authPayload.userId || authPayload.id || authPayload.email || authPayload.fullName) {
    const { accessToken, refreshToken, token, ...rest } = authPayload;
    return rest;
  }

  return null;
};

const normalizeSellerStatus = (status) =>
  status ? String(status).toUpperCase() : null;

const normalizeSessionUser = (userSource, previousUser = null) => {
  if (!userSource) return previousUser;

  const id = userSource.id ?? userSource.userId ?? previousUser?.id ?? previousUser?.userId;
  const role =
    userSource.role ??
    userSource.roles?.[0] ??
    previousUser?.role ??
    'BUYER';

  return {
    ...previousUser,
    ...userSource,
    id,
    fullName: userSource.fullName ?? userSource.name ?? previousUser?.fullName ?? '',
    email: userSource.email ?? previousUser?.email ?? '',
    phone: userSource.phone ?? userSource.phoneNumber ?? previousUser?.phone ?? '',
    username:
      userSource.username ??
      userSource.email?.split('@')[0] ??
      previousUser?.username ??
      '',
    role,
    roles: userSource.roles ?? previousUser?.roles,
    sellerStatus: normalizeSellerStatus(
      userSource.sellerStatus ?? previousUser?.sellerStatus
    ),
    currentMode: userSource.currentMode ?? previousUser?.currentMode ?? 'BUYER',
    isEmailVerified:
      userSource.isEmailVerified ??
      userSource.emailVerified ??
      previousUser?.isEmailVerified ??
      false,
    isPhoneVerified:
      userSource.isPhoneVerified ??
      userSource.phoneVerified ??
      previousUser?.isPhoneVerified ??
      false,
  };
};

const saveSession = (payload) => {
  const authPayload = unwrapAuthPayload(payload);
  if (!authPayload) return null;

  const previousUser = readStoredUser();
  const userSource = extractUserSource(authPayload);
  const user = normalizeSessionUser(userSource, previousUser);

  const accessToken = authPayload.accessToken ?? authPayload.token;
  const refreshToken = authPayload.refreshToken;

  if (user?.id) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  }

  if (accessToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  }

  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  localStorage.setItem(EXPIRES_AT_KEY, String(Date.now() + SESSION_DURATION_MS));

  return user;
};

export const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(EXPIRES_AT_KEY);
};

export const isSessionValid = () => {
  const expiresAt = localStorage.getItem(EXPIRES_AT_KEY);
  if (!expiresAt) return false;
  return Date.now() < Number(expiresAt);
};

export const hadStoredSession = () => {
  return Boolean(
    localStorage.getItem(EXPIRES_AT_KEY) ||
      localStorage.getItem(ACCESS_TOKEN_KEY) ||
      localStorage.getItem(SESSION_KEY)
  );
};

export const login = async (loginValue, password) => {
  // 1. Log in
  const { data } = await api.post("/auth/login", {
    emailOrPhone: loginValue,
    password,
  });

  if (!data?.data?.accessToken) {
    throw new Error("Đăng nhập thất bại");
  }

  // 2. Save accessToken, refreshToken, expiresAt
  saveSession(data);

  // 3. Call the API to fetch user info
  const { data: me } = await api.get("/users/me");

  if (!me) {
    throw new Error("Không lấy được thông tin người dùng");
  }

  // 4. Save user info
  const user = saveSession(me);

  if (!user?.id) {
    throw new Error("Không nhận được thông tin người dùng");
  }

  // 5. Lấy trạng thái seller (User Service /users/me thường không kèm sellerStatus)
  return (await enrichSellerStatus()) ?? user;
};

// Gọi /sellers/me để đồng bộ sellerStatus vào session (dùng cho SellerRoute).
const enrichSellerStatus = async () => {
  try {
    const { data } = await api.get("/sellers/me");
    const seller = data?.data ?? data;
    const status = seller?.status ?? seller?.sellerStatus;
    if (status) {
      const upper = String(status).toUpperCase();
      const updates = { sellerStatus: upper };
      // Seller đã duyệt → mặc định vào chế độ Người bán (vẫn đổi lại được)
      if (upper === "APPROVED") updates.currentMode = "SELLER";
      return updateSessionUser(updates);
    }
  } catch {
    /* 404 = chưa đăng ký seller → giữ nguyên */
  }
  return null;
};
//registerOtp
export const register = async ({ fullName, email, phone, password }) => {
  const { data } = await api.post('/auth/register', {
    fullName,
    email,
    phoneNumber: phone,
    password,
  });

  return data;
};

export const verifyEmail = async ({ email, otp }) => {
  const { data } = await api.post('/auth/verify-email', {
    email,
    otpCode: otp,
  });

  return data;
};

export const resendEmailOtp = async (email) => {
  const { data } = await api.post('/auth/verify-email', {
    email,
    otpCode: '',
  });

  return data;
};
// forgotOtp not implemented yet


export const getGoogleLoginUrl = () => `${api.defaults.baseURL}/auth/google/login`;

export const exchangeCode = async (code) => {
  const { data } = await api.post('/auth/exchange-code', { code });

  if (!data) {
    throw new Error('Đăng nhập Google thất bại');
  }

  const user = saveSession(data);

  if (!user?.id) {
    throw new Error('Đăng nhập Google thất bại');
  }

  return user;
};

export const refreshToken = async () => {
  const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!storedRefreshToken) {
    throw new Error('Refresh token không tồn tại');
  }

  const { data } = await api.post('/auth/refresh-token', {
    refreshToken: storedRefreshToken,
  });

  if (data) {
    saveSession(data);
  }

  return data;
};

export const logout = async () => {
  const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

  clearSession();

  if (!storedRefreshToken) {
    return;
  }

  try {
    await api.post('/auth/logout', { refreshToken: storedRefreshToken });
  } catch {
    /* session already cleared locally */
  }
};

export const getCurrentUser = () => {
  if (!isSessionValid()) {
    return null;
  }

  return readStoredUser();
};

export const updateSessionUser = (updates) => {
  const current = getCurrentUser() ?? readStoredUser();
  if (!current) return null;

  const updated = normalizeSessionUser({ ...current, ...updates }, current);
  localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
  return updated;
};

export const switchAccountMode = async (mode) => {
  const current = getCurrentUser();
  if (!current) throw new Error('Chưa đăng nhập');

  if (mode === 'SELLER' && current.sellerStatus !== 'APPROVED') {
    throw new Error('Chế độ Người bán chưa khả dụng');
  }

  return updateSessionUser({ currentMode: mode });
};
