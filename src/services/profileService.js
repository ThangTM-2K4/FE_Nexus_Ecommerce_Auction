import { mockDelay } from './mockDelay';
import { mockUsers, updateSessionUser } from './authService';

const profileKey = (userId) => `mockProfile_${userId}`;

const defaultProfiles = {
  1: {
    avatar: null,
    fullName: 'Admin User',
    username: 'admin',
    email: 'admin@gmail.com',
    phone: '0000000001',
    dateOfBirth: '1990-01-15',
    gender: 'male',
    address: '123 Admin Street, Hà Nội',
    isEmailVerified: true,
    isPhoneVerified: true,
    isNationalIdVerified: true,
    bankAccount: {
      bankName: 'Vietcombank',
      accountNumber: '0123456789',
      accountHolder: 'Admin User',
    },
  },
  2: {
    avatar: null,
    fullName: 'Staff User',
    username: 'staff',
    email: 'staff@gmail.com',
    phone: '0000000002',
    dateOfBirth: '1992-06-20',
    gender: 'female',
    address: '456 Staff Avenue, TP.HCM',
    isEmailVerified: true,
    isPhoneVerified: true,
    isNationalIdVerified: true,
    bankAccount: null,
  },
  3: {
    avatar: null,
    fullName: 'Verified Seller',
    username: 'verifiedseller',
    email: 'seller@gmail.com',
    phone: '0000000003',
    dateOfBirth: '1988-03-10',
    gender: 'male',
    address: '789 Seller Road, Đà Nẵng',
    isEmailVerified: true,
    isPhoneVerified: true,
    isNationalIdVerified: true,
    bankAccount: {
      bankName: 'Techcombank',
      accountNumber: '9876543210',
      accountHolder: 'Verified Seller',
    },
  },
  4: {
    avatar: null,
    fullName: 'John Doe',
    username: 'johndoe',
    email: 'buyer@gmail.com',
    phone: '0000000004',
    dateOfBirth: '1995-11-25',
    gender: 'male',
    address: '12 Buyer Lane, Hà Nội',
    isEmailVerified: true,
    isPhoneVerified: false,
    isNationalIdVerified: false,
    bankAccount: null,
  },
};

const getStoredProfile = (userId) => {
  const raw = localStorage.getItem(profileKey(userId));
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      /* fall through */
    }
  }
  return defaultProfiles[userId] || null;
};

const saveProfile = (userId, profile) => {
  localStorage.setItem(profileKey(userId), JSON.stringify(profile));
};

export const getProfile = async (userId) => {
  await mockDelay();
  const localUsers = JSON.parse(localStorage.getItem('mockUsers')) || [];
  const allUsers = [...mockUsers, ...localUsers];
  const baseUser = allUsers.find((u) => u.id === userId);
  const stored = getStoredProfile(userId);

  if (stored) return stored;

  if (baseUser) {
    const profile = {
      avatar: null,
      fullName: baseUser.fullName,
      username: baseUser.username,
      email: baseUser.email,
      phone: baseUser.phone,
      dateOfBirth: '',
      gender: '',
      address: '',
      isEmailVerified: baseUser.isEmailVerified,
      isPhoneVerified: baseUser.isPhoneVerified,
      isNationalIdVerified: false,
      bankAccount: null,
    };
    saveProfile(userId, profile);
    return profile;
  }

  throw new Error('Không tìm thấy hồ sơ người dùng');
};

export const updateProfile = async (userId, data) => {
  await mockDelay();
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

export const verifyEmail = async (userId) => {
  await mockDelay(1200);
  return updateProfile(userId, { isEmailVerified: true });
};

export const verifyPhone = async (userId) => {
  await mockDelay(1200);
  return updateProfile(userId, { isPhoneVerified: true });
};

export const verifyNationalId = async (userId) => {
  await mockDelay(1200);
  return updateProfile(userId, { isNationalIdVerified: true });
};

export const saveBankAccount = async (userId, bankAccount) => {
  await mockDelay();
  return updateProfile(userId, { bankAccount });
};

export const removeBankAccount = async (userId) => {
  await mockDelay();
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
  await mockDelay();
  return mockActivity;
};
