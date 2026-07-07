import { mockDelay } from './mockDelay';
import { shippingSettingsOptions } from '../data/sellerMockData';

const shippingKey = (userId) => `mockSellerShipping_${userId}`;

export const getShippingSettings = async (userId) => {
  await mockDelay();
  const raw = localStorage.getItem(shippingKey(userId));
  if (!raw) return shippingSettingsOptions;
  try {
    const saved = JSON.parse(raw);
    return shippingSettingsOptions.map((base) => {
      const override = saved.find((s) => s.id === base.id);
      return override ? { ...base, enabled: override.enabled } : base;
    });
  } catch {
    return shippingSettingsOptions;
  }
};

export const saveShippingSettings = async (userId, options) => {
  await mockDelay(500);
  localStorage.setItem(shippingKey(userId), JSON.stringify(options));
  return options;
};
