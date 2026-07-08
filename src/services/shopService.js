import { mockDelay } from './mockDelay';
import { safeSetItem } from '../utils/safeSetItem';

const shopKey = (userId) => `mockSellerShopProfile_${userId}`;

const defaultProfile = (user) => ({
  shopName: user?.fullName ? `${user.fullName}'s Shop` : '',
  logo: null,
  cover: null,
  description: '',
  taxCode: '',
  businessAddress: '',
  businessType: 'individual',
  identityNumber: '',
  identityUpdatedAt: null,
});

export const getShopProfile = async (userId, user) => {
  await mockDelay();
  const raw = localStorage.getItem(shopKey(userId));
  if (!raw) return defaultProfile(user);
  try {
    return { ...defaultProfile(user), ...JSON.parse(raw) };
  } catch {
    return defaultProfile(user);
  }
};

export const saveShopProfile = async (userId, profileData) => {
  await mockDelay(800);
  safeSetItem(shopKey(userId), JSON.stringify(profileData));
  return profileData;
};
