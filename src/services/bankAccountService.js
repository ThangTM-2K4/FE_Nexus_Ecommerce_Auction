import { mockDelay } from "./mockDelay";
import { getCurrentUser } from "./authService";
import * as profileService from "./profileService";
import { getSellerApplication } from "./sellerService";
import { resolveBank, resolveBankLabel } from "./bankService";

const accountsKey = (userId) => `sellerBankAccounts_${userId}`;
const removedKey = (userId) => `sellerBankAccountsRemoved_${userId}`;

const normalizeNumber = (accountNumber) => String(accountNumber || "").replace(/\s/g, "");

// Tài khoản suy ra từ đơn đăng ký seller / hồ sơ sẽ được bootstrap dựng lại mỗi
// lần tải. Không có bia mộ này thì tài khoản vừa xoá sẽ hiện lại ngay sau đó.
const readRemoved = (userId) => {
  try {
    const raw = localStorage.getItem(removedKey(userId));
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
};

const addRemoved = (userId, accountNumber) => {
  const removed = readRemoved(userId);
  removed.add(normalizeNumber(accountNumber));
  localStorage.setItem(removedKey(userId), JSON.stringify([...removed]));
};

const clearRemoved = (userId, accountNumber) => {
  const removed = readRemoved(userId);
  removed.delete(normalizeNumber(accountNumber));
  localStorage.setItem(removedKey(userId), JSON.stringify([...removed]));
};

export const maskAccountNumber = (accountNumber) => {
  const digits = String(accountNumber || "").replace(/\s/g, "");
  if (digits.length <= 4) return digits;
  return `****${digits.slice(-4)}`;
};

const normalizeAccount = (raw) => {
  const bankName = raw.bankName || raw.bank || "";
  // bankName thường lưu MÃ ngân hàng (VD "HDB") — tra ngược ra tên + logo để hiển thị.
  const bankRecord = resolveBank(bankName);
  return {
    id: raw.id,
    type: raw.type === "business" ? "business" : "personal",
    bankName,
    bank: resolveBankLabel(bankName),
    bankCode: bankRecord?.code || bankName,
    bankLogo: raw.bankLogo || bankRecord?.logo || "",
    accountNumber: String(raw.accountNumber || "").trim(),
    accountNumberMasked: maskAccountNumber(raw.accountNumber),
    accountName: raw.accountHolder || raw.accountName || "",
    accountHolder: raw.accountHolder || raw.accountName || "",
    nationalId: String(raw.nationalId || "").trim(),
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

  const removed = readRemoved(userId);
  const merged = mergeAccounts(
    stored,
    fromApp ? [fromApp] : [],
    fromProfile ? [fromProfile] : []
  ).filter((a) => !removed.has(normalizeNumber(a.accountNumber)));

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

export const addSellerBankAccount = async (
  userId,
  { type, bankName, accountNumber, accountHolder, nationalId, isDefault }
) => {
  await mockDelay(400);

  const bank = String(bankName || "").trim();
  const number = String(accountNumber || "").trim();
  const holder = String(accountHolder || "").trim();

  // Nêu đích danh ô nào còn thiếu, thay vì báo chung chung "điền đầy đủ".
  const missing = [];
  if (!bank) missing.push("Tên ngân hàng");
  if (!number) missing.push("Số tài khoản");
  if (!holder) missing.push("Tên đầy đủ");
  if (missing.length) {
    throw new Error(`Vui lòng nhập: ${missing.join(", ")}`);
  }
  if (!/^\d{6,20}$/.test(number.replace(/\s/g, ""))) {
    throw new Error("Số tài khoản không hợp lệ (chỉ gồm 6–20 chữ số)");
  }

  const existing = await bootstrapAccounts(userId);
  if (isDuplicate(existing, number)) {
    throw new Error("Tài khoản ngân hàng này đã được liên kết");
  }

  // Tài khoản đầu tiên luôn là mặc định; ngoài ra tôn trọng ô "Đặt làm mặc định"
  // người dùng tick (trước đây bị bỏ qua). Caller không truyền -> giữ hành vi cũ.
  const makeDefault = existing.length === 0 || isDefault === true;

  const account = normalizeAccount({
    id: `bank-${Date.now()}`,
    type: type === "business" ? "business" : "personal",
    bankName: bank,
    accountNumber: number,
    accountHolder: holder,
    nationalId,
    source: "manual",
    isDefault: makeDefault,
    createdAt: new Date().toISOString(),
  });

  // Chỉ được 1 tài khoản mặc định
  const others = makeDefault
    ? existing.map((a) => ({ ...a, isDefault: false }))
    : existing;

  writeStoredAccounts(userId, [...others, account]);
  clearRemoved(userId, number); // thêm lại số đã xoá trước đó -> gỡ bia mộ
  return account;
};

/** Đặt 1 tài khoản làm mặc định; các tài khoản còn lại bị bỏ cờ mặc định. */
export const setDefaultBankAccount = async (userId, accountId) => {
  await mockDelay(200);

  const existing = await bootstrapAccounts(userId);
  if (!existing.some((a) => a.id === accountId)) {
    throw new Error("Không tìm thấy tài khoản ngân hàng");
  }

  const updated = existing.map((a) => ({ ...a, isDefault: a.id === accountId }));
  writeStoredAccounts(userId, updated);
  return updated.map(normalizeAccount);
};

export const updateBankAccount = async (userId, accountId, formData) => {
  await mockDelay(400);

  const existing = await bootstrapAccounts(userId);
  const current = existing.find((a) => a.id === accountId);
  if (!current) throw new Error("Không tìm thấy tài khoản ngân hàng");

  const bank = String(formData.bankCode || formData.bankName || "").trim();
  const number = String(formData.accountNumber || "").trim();
  const holder = String(formData.accountHolder || "").trim();

  const missing = [];
  if (!bank) missing.push("Tên ngân hàng");
  if (!number) missing.push("Số tài khoản");
  if (!holder) missing.push("Tên đầy đủ");
  if (missing.length) throw new Error(`Vui lòng nhập: ${missing.join(", ")}`);

  if (!/^\d{6,20}$/.test(number.replace(/\s/g, ""))) {
    throw new Error("Số tài khoản không hợp lệ (chỉ gồm 6–20 chữ số)");
  }
  if (isDuplicate(existing, number, accountId)) {
    throw new Error("Tài khoản ngân hàng này đã được liên kết");
  }

  const makeDefault = formData.isDefault === true || current.isDefault;

  const updated = existing.map((a) => {
    if (a.id !== accountId) {
      return makeDefault ? { ...a, isDefault: false } : a;
    }
    return normalizeAccount({
      ...a,
      bankName: bank,
      accountNumber: number,
      accountHolder: holder,
      nationalId: formData.nationalId ?? a.nationalId,
      isDefault: makeDefault,
    });
  });

  writeStoredAccounts(userId, updated);
  clearRemoved(userId, number);
  return updated.map(normalizeAccount);
};

export const deleteBankAccount = async (userId, accountId) => {
  await mockDelay(300);

  const existing = await bootstrapAccounts(userId);
  const target = existing.find((a) => a.id === accountId);
  if (!target) throw new Error("Không tìm thấy tài khoản ngân hàng");

  const remaining = existing.filter((a) => a.id !== accountId);

  // Xoá tài khoản mặc định thì đẩy cờ mặc định sang tài khoản còn lại đầu tiên,
  // tránh ví seller rơi vào trạng thái không có TK nhận tiền nào được chọn.
  if (target.isDefault && remaining.length > 0) {
    remaining[0] = { ...remaining[0], isDefault: true };
  }

  writeStoredAccounts(userId, remaining);
  addRemoved(userId, target.accountNumber);
  return remaining.map(normalizeAccount);
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
    nationalId: formData.nationalId,
    isDefault: formData.isDefault,
  });
  return getSellerBankAccounts(userId);
};
