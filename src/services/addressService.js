import { mockDelay } from './mockDelay';
import { USE_MOCK_ADDRESSES, MOCK_ADDRESSES } from '../data/mockAddresses';

const key = (userId) => `mockAddresses_${userId}`;

const getStored = (userId) => {
  const raw = localStorage.getItem(key(userId));
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      /* fall through */
    }
  }
  const initial = USE_MOCK_ADDRESSES ? [...MOCK_ADDRESSES] : [];
  localStorage.setItem(key(userId), JSON.stringify(initial));
  return initial;
};

const save = (userId, list) => {
  localStorage.setItem(key(userId), JSON.stringify(list));
};

export const getAddresses = async (userId) => {
  await mockDelay(300);
  return getStored(userId);
};

export const addAddress = async (userId, address) => {
  await mockDelay(300);
  const list = getStored(userId);
  const newItem = { ...address, id: `addr-${Date.now()}` };
  let updated = [...list, newItem];
  if (newItem.isDefault) {
    updated = updated.map((a) => ({ ...a, isDefault: a.id === newItem.id }));
  }
  save(userId, updated);
  return updated;
};

export const updateAddress = async (userId, id, data) => {
  await mockDelay(300);
  let list = getStored(userId).map((a) => (a.id === id ? { ...a, ...data, id } : a));
  if (data.isDefault) {
    list = list.map((a) => ({ ...a, isDefault: a.id === id }));
  }
  save(userId, list);
  return list;
};

export const deleteAddress = async (userId, id) => {
  await mockDelay(300);
  let list = getStored(userId).filter((a) => a.id !== id);
  if (list.length && !list.some((a) => a.isDefault)) {
    list[0] = { ...list[0], isDefault: true };
  }
  save(userId, list);
  return list;
};

export const setDefaultAddress = async (userId, id) => {
  await mockDelay(200);
  const list = getStored(userId).map((a) => ({ ...a, isDefault: a.id === id }));
  save(userId, list);
  return list;
};
