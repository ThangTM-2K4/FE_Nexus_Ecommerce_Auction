import { mockDelay } from "./mockDelay";
import { getCurrentUser } from "./authService";
import * as profileService from "./profileService";
import { getSellerApplication } from "./sellerService";
import { resolveBankLabel } from "./bankService";

const accountsKey = (userId) => `sellerBankAccounts_${userId}`;

export const maskAccountNumber = (accountNumber) => {
  const digits = String(accountNumber || "").replace(/\s/g, "");
  if (digits.length <= 4) return digits;
  return `****${digits.slice(-4)}`;
};

const normalizeAccount = (raw) => {
  const bankName = raw.bankName || raw.bank || "";
  return {
    id: raw.id,
    type: raw.type === "business" ? "business" : "personal",
    bankName,
    bank: resolveBankLabel(bankName),
    accountNumber: String(raw.accountNumber || "").trim(),
    accountNumberMasked: maskAccountNumber(raw.accountNumber),
    accountName: raw.accountHolder || raw.accountName || "",
    accountHolder: raw.accountHolder || raw.accountName || "",
    source: raw.source || "manual",
    isDefault: Boolean(raw.isDefault),
    createdAt: raw.createdAt || new Date().toISOString(),
  };
};

const readStoredAccounts = (userId) => {
  const raw = localStorage.getItem(accountsKey(userId));
  if (!raw) return [];
  try {
    return JSON.parse(raw).map(normalizeAccount);
  } catch {
    return [];
  }
};

const writeStoredAccounts = (userId, accounts) => {
  localStorage.setItem(accountsKey(userId), JSON.stringify(accounts));
};

const accountFromApplication = (application) => {
  if (!application?.accountNumber || !application?.bankName) return null;

  return normalizeAccount({
    id: `seller-reg-${application.applicationId || application.userId}`,
    type: application.businessType === "business" ? "business" : "personal",
    bankName: application.bankName,
    accountNumber: application.accountNumber,
    accountHolder: application.accountHolder,
    source: "seller_registration",
    isDefault: true,
    createdAt: application.submittedAt || new Date().toISOString(),
  });
};

const accountFromProfile = (profile, type = "personal") => {
  if (!profile?.bankAccount?.accountNumber) return null;

  return normalizeAccount({
    id: `profile-${profile.bankAccount.accountNumber}`,
    type,
    bankName: profile.bankAccount.bankName,
    accountNumber: profile.bankAccount.accountNumber,
    accountHolder: profile.bankAccount.accountHolder,
    source: "profile",
    isDefault: false,
    createdAt: new Date().toISOString(),
  });
};

const isDuplicate = (accounts, accountNumber, excludeId) => {
  const normalized = String(accountNumber).replace(/\s/g, "");
  return accounts.some(
    (a) => a.id !== excludeId && a.accountNumber.replace(/\s/g, "") === normalized
  );
};

const mergeAccounts = (...lists) => {
  const map = new Map();
  lists.flat().filter(Boolean).forEach((acc) => {
    const key = acc.accountNumber.replace(/\s/g, "");
    if (!map.has(key)) map.set(key, acc);
  });
  return Array.from(map.values());
};

export const syncBankFromSellerApplication = async (userId, application) => {
  const account = accountFromApplication(application);
  if (!account) return null;

  await profileService.saveBankAccount(userId, {
    bankName: account.bankName,
    accountNumber: account.accountNumber,
    accountHolder: account.accountHolder,
  });

  const existing = readStoredAccounts(userId);
  const withoutDup = existing.filter(
    (a) => a.accountNumber.replace(/\s/g, "") !== account.accountNumber.replace(/\s/g, "")
  );
  const updated = [
    account,
    ...withoutDup.map((a) => ({ ...a, isDefault: false })),
  ];
  writeStoredAccounts(userId, updated);
  return account;
};

const bootstrapAccounts = async (userId) => {
  const stored = readStoredAccounts(userId);

  const [application, profile] = await Promise.all([
    getSellerApplication(userId),
    profileService.getProfile(userId).catch(() => null),
  ]);

  const fromApp = accountFromApplication(application);
  const fromProfile = accountFromProfile(
    profile,
    fromApp?.type === "business" ? "personal" : "personal"
  );

  const merged = mergeAccounts(stored, fromApp ? [fromApp] : [], fromProfile ? [fromProfile] : []);

  if (merged.length > 0 && !merged.some((a) => a.isDefault)) {
    const reg = merged.find((a) => a.source === "seller_registration");
    (reg || merged[0]).isDefault = true;
  }

  const changed =
    merged.length !== stored.length ||
    merged.some((acc, i) => acc.id !== stored[i]?.id);

  if (changed) {
    writeStoredAccounts(userId, merged);
  }

  return merged;
};

export const getSellerBankAccounts = async (userId) => {
  await mockDelay(200);
  const accounts = await bootstrapAccounts(userId);
  return accounts.map(normalizeAccount);
};

export const addSellerBankAccount = async (userId, { type, bankName, accountNumber, accountHolder }) => {
  await mockDelay(400);

  const bank = String(bankName || "").trim();
  const number = String(accountNumber || "").trim();
  const holder = String(accountHolder || "").trim();

  if (!bank || !number || !holder) {
    throw new Error("Vui lòng điền đầy đủ thông tin ngân hàng");
  }
  if (!/^\d{6,20}$/.test(number.replace(/\s/g, ""))) {
    throw new Error("Số tài khoản không hợp lệ (6–20 chữ số)");
  }

  const existing = await bootstrapAccounts(userId);
  if (isDuplicate(existing, number)) {
    throw new Error("Tài khoản ngân hàng này đã được liên kết");
  }

  const account = normalizeAccount({
    id: `bank-${Date.now()}`,
    type: type === "business" ? "business" : "personal",
    bankName: bank,
    accountNumber: number,
    accountHolder: holder,
    source: "manual",
    isDefault: existing.length === 0,
    createdAt: new Date().toISOString(),
  });

  writeStoredAccounts(userId, [...existing, account]);
  return account;
};

export const getCurrentUserBankAccounts = async () => {
  const user = getCurrentUser();
  if (!user?.id) return [];
  return getSellerBankAccounts(user.id);
};

export const getBankAccounts = getSellerBankAccounts;

export const addBankAccount = async (userId, formData) => {
  await addSellerBankAccount(userId, {
    type: "personal",
    bankName: formData.bankCode || formData.bankName || "",
    accountNumber: formData.accountNumber,
    accountHolder: formData.accountHolder,
  });
  return getSellerBankAccounts(userId);
};
