import { mockDelay } from './mockDelay';

const SESSION_KEY = 'user';

export const mockUsers = [
  {
    id: 1,
    email: 'admin@gmail.com',
    phone: '0000000001',
    password: '123456',
    role: 'ADMIN',
    fullName: 'Admin User',
    username: 'admin',
    isEmailVerified: true,
    isPhoneVerified: true,
    sellerStatus: null,
    currentMode: 'BUYER',
  },
  {
    id: 2,
    email: 'staff@gmail.com',
    phone: '0000000002',
    password: '123456',
    role: 'STAFF',
    fullName: 'Staff User',
    username: 'staff',
    isEmailVerified: true,
    isPhoneVerified: true,
    sellerStatus: null,
    currentMode: 'BUYER',
  },
  {
  id: 3,
  email: 'seller@gmail.com',
  phone: '0000000003',
  password: '123456',
  role: 'SELLER',
  fullName: 'Verified Seller',
  username: 'verifiedseller',
  isEmailVerified: true,
  isPhoneVerified: true,
  sellerStatus: 'APPROVED',
  currentMode: 'SELLER',
  bankAccount: {
    bankName: 'Vietcombank',
    accountNumber: '123456789',
  },
},
  {
    id: 4,
    email: 'buyer@gmail.com',
    phone: '0000000004',
    password: '123456',
    role: 'BUYER',
    fullName: 'John Doe',
    username: 'johndoe',
    isEmailVerified: true,
    isPhoneVerified: false,
    sellerStatus: null,
    currentMode: 'BUYER',
  },
];

const toSessionUser = (user) => {
  const { password, ...session } = user;
  return session;
};

export const login = async (loginValue, password) => {
  await mockDelay(800);

  const localUsers = JSON.parse(localStorage.getItem('mockUsers')) || [];
  const allUsers = [...mockUsers, ...localUsers];

  const user = allUsers.find(
    (u) =>
      (u.phone === loginValue || u.email === loginValue) &&
      u.password === password
  );

  if (!user) {
    throw new Error('Tên đăng nhập hoặc mật khẩu không chính xác');
  }

  const sessionUser = toSessionUser(user);
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
  return sessionUser;
};

export const register = async (userData) => {
  await mockDelay(800);

  const localUsers = JSON.parse(localStorage.getItem('mockUsers')) || [];
  const allUsers = [...mockUsers, ...localUsers];

  const existedUser = allUsers.find(
    (u) => u.email === userData.email || u.phone === userData.phone
  );

  if (existedUser) {
    throw new Error('Email hoặc số điện thoại đã tồn tại');
  }

  const newUser = {
    id: Date.now(),
    fullName: userData.fullName,
    email: userData.email,
    phone: userData.phone,
    password: userData.password,
    role: userData.role || 'BUYER',
    username: userData.email.split('@')[0],
    isEmailVerified: false,
    isPhoneVerified: false,
    sellerStatus: null,
    currentMode: 'BUYER',
  };

  localUsers.push(newUser);
  localStorage.setItem('mockUsers', JSON.stringify(localUsers));

  return toSessionUser(newUser);
};

export const logout = async () => {
  await mockDelay(200);
  localStorage.removeItem(SESSION_KEY);
};

export const getCurrentUser = () => {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const updateSessionUser = (updates) => {
  const current = getCurrentUser();
  if (!current) return null;

  const updated = { ...current, ...updates };
  localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
  return updated;
};

export const switchAccountMode = async (mode) => {
  await mockDelay(200);
  const current = getCurrentUser();
  if (!current) throw new Error('Chưa đăng nhập');

  if (mode === 'SELLER' && current.sellerStatus !== 'APPROVED') {
    throw new Error('Chế độ Người bán chưa khả dụng');
  }

  return updateSessionUser({ currentMode: mode });
};

export const syncUserFromStorage = (userId) => {
  const localUsers = JSON.parse(localStorage.getItem('mockUsers')) || [];
  const allUsers = [...mockUsers, ...localUsers];
  const stored = allUsers.find((u) => u.id === userId);
  if (!stored) return getCurrentUser();

  const sessionUser = toSessionUser(stored);
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
  return sessionUser;
};
