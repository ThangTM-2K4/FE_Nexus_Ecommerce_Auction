import { mockDelay } from './mockDelay';
import { USE_MOCK_BANK_ACCOUNTS, MOCK_BANK_ACCOUNTS, BANK_OPTIONS } from '../data/mockBankAccounts';

const key = (userId) => `mockBankAccounts_${userId}`;

const getStored = (userId) => {
  const raw = localStorage.getItem(key(userId));
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      /* fall through */
    }
  }
  const initial = USE_MOCK_BANK_ACCOUNTS ? [...MOCK_BANK_ACCOUNTS] : [];
  localStorage.setItem(key(userId), JSON.stringify(initial));
  return initial;
};

const save = (userId, list) => {
  localStorage.setItem(key(userId), JSON.stringify(list));
};

export const getBankAccounts = async (userId) => {
  await mockDelay(300);
  return getStored(userId);
};

export const addBankAccount = async (userId, account) => {
  await mockDelay(400);
  const list = getStored(userId);
  const bankLabel = BANK_OPTIONS.find((b) => b.value === account.bankCode)?.label || account.bankName;
  const newItem = {
    ...account,
    id: `bank-${Date.now()}`,
    bankName: bankLabel,
  };
  let updated = [...list, newItem];
  if (newItem.isDefault) {
    updated = updated.map((a) => ({ ...a, isDefault: a.id === newItem.id }));
  }
  save(userId, updated);
  return updated;
};

export { BANK_OPTIONS, BRANCH_OPTIONS } from '../data/mockBankAccounts';
