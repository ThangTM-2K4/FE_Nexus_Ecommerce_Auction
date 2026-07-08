import api from '../config/api';
import { getCurrentUser, updateSessionUser } from './authService';

const profileKey = (userId) => `profile_${userId}`;

const getStoredProfile = (userId) => {
  const raw = localStorage.getItem(profileKey(userId));
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      /* fall through */
    }
  }
  return null;
};

const saveProfile = (userId, profile) => {
  localStorage.setItem(profileKey(userId), JSON.stringify(profile));
};

const buildProfileFromUser = (user) => ({
  avatar: user.avatar || null,
  fullName: user.fullName || '',
  username: user.username || '',
  email: user.email || '',
  phone: user.phone || user.phoneNumber || '',
  dateOfBirth: user.dateOfBirth || '',
  gender: user.gender || '',
  address: user.address || '',
  isEmailVerified: user.isEmailVerified ?? false,
  isPhoneVerified: user.isPhoneVerified ?? false,
  isNationalIdVerified: user.isNationalIdVerified ?? false,
  bankAccount: user.bankAccount || null,
});

export const getProfile = async (userId) => {
  const stored = getStoredProfile(userId);
  if (stored) return stored;

  const sessionUser = getCurrentUser();
  const sessionUserId = sessionUser?.id ?? sessionUser?.userId;

  if (sessionUser && sessionUserId === userId) {
    const profile = buildProfileFromUser(sessionUser);
    saveProfile(userId, profile);
    return profile;
  }

  throw new Error('Không tìm thấy hồ sơ người dùng');
};

export const updateProfile = async (userId, data) => {
  const current = await getProfile(userId);
  const updated = { ...current, ...data };
  saveProfile(userId, updated);

  updateSessionUser({
    fullName: updated.fullName,
    username: updated.username,
    email: updated.email,
    phone: updated.phone,
    isEmailVerified: updated.isEmailVerified,
    isPhoneVerified: updated.isPhoneVerified,
  });

  return updated;
};

export const requestEmailVerification = async (userId) => {
  // Connect to the real API when the backend is ready; mocked for now to test the local seller flow:
  // const profile = await getProfile(userId);
  // await api.post('/auth/verify-email', {
  //   email: profile.email,
  //   otpCode: '',
  // });
  // return profile;

  return updateProfile(userId, { isEmailVerified: true });
};

export const verifyPhone = async (userId) => {
  return updateProfile(userId, { isPhoneVerified: true });
};

export const verifyNationalId = async (userId) => {
  return updateProfile(userId, { isNationalIdVerified: true });
};

export const saveBankAccount = async (userId, bankAccount) => {
  return updateProfile(userId, { bankAccount });
};

export const removeBankAccount = async (userId) => {
  return updateProfile(userId, { bankAccount: null });
};

const mockActivity = {
  auctions: [
    { id: 1, title: 'iPhone 16 Pro Max', status: 'Won', amount: 24500000, date: '2026-05-20' },
    { id: 2, title: 'MacBook Air M3', status: 'Lost', amount: 28900000, date: '2026-05-15' },
    { id: 3, title: 'Sony WH-1000XM5', status: 'Active', amount: 5200000, date: '2026-06-01' },
  ],
  bids: [
    { id: 1, auction: 'Tai nghe Bluetooth Pro X2', bidAmount: 1290000, date: '2026-06-08', status: 'Leading' },
    { id: 2, auction: 'Đồng hồ Urban Fit', bidAmount: 1890000, date: '2026-06-07', status: 'Outbid' },
    { id: 3, auction: 'Balo laptop 15.6"', bidAmount: 690000, date: '2026-06-05', status: 'Won' },
  ],
  purchases: [
    { id: 1, product: 'Tai nghe Bluetooth Pro X2', price: 1290000, date: '2026-05-28', status: 'Delivered' },
    { id: 2, product: 'Balo laptop đa năng', price: 690000, date: '2026-05-10', status: 'Delivered' },
  ],
  transactions: [
    { id: 1, type: 'Deposit', amount: 5000000, date: '2026-05-01', status: 'Completed' },
    { id: 2, type: 'Bid Hold', amount: -500000, date: '2026-06-01', status: 'Completed' },
    { id: 3, type: 'Purchase', amount: -1290000, date: '2026-05-28', status: 'Completed' },
  ],
};

export const getActivityHistory = async () => {
  return mockActivity;
};
