import { mockDelay } from './mockDelay';
import { DEFAULT_NOTIFICATION_SETTINGS } from '../data/mockNotificationSettings';

const key = (userId) => `notificationSettings_${userId}`;

const getStored = (userId) => {
  const raw = localStorage.getItem(key(userId));
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      /* fall through */
    }
  }
  const initial = JSON.parse(JSON.stringify(DEFAULT_NOTIFICATION_SETTINGS));
  localStorage.setItem(key(userId), JSON.stringify(initial));
  return initial;
};

const save = (userId, settings) => {
  localStorage.setItem(key(userId), JSON.stringify(settings));
};

export const getNotificationSettings = async (userId) => {
  await mockDelay(300);
  return getStored(userId);
};

export const updateNotificationSettings = async (userId, settings) => {
  await mockDelay(200);
  save(userId, settings);
  return settings;
};

export const toggleGroupItem = async (userId, groupKey, itemKey, value) => {
  const settings = getStored(userId);
  const updated = {
    ...settings,
    [groupKey]: {
      ...settings[groupKey],
      items: {
        ...settings[groupKey].items,
        [itemKey]: { ...settings[groupKey].items[itemKey], enabled: value },
      },
    },
  };
  save(userId, updated);
  return updated;
};
