import api from "../config/api";
import { unwrapData, unwrapPagedList, getApiErrorMessage } from "../utils/apiResponse";
import { mockDelay } from "./mockDelay";
import {
  walletStats as defaultWalletStats,
  transactions as defaultTransactions,
  withdrawals as defaultWithdrawals,
} from "../data/sellerMockData";

export { getApiErrorMessage };

const WALLET_STATE_KEY = "sellerWalletState";

const defaultState = () => ({
  walletStats: { ...defaultWalletStats },
  transactions: [...defaultTransactions],
  withdrawals: [...defaultWithdrawals],
});

const readState = () => {
  const raw = localStorage.getItem(WALLET_STATE_KEY);
  if (!raw) return defaultState();
  try {
    return { ...defaultState(), ...JSON.parse(raw) };
  } catch {
    return defaultState();
  }
};

const writeState = (state) => {
  localStorage.setItem(WALLET_STATE_KEY, JSON.stringify(state));
};

/**
 * 1. Lấy thông tin ví cá nhân từ GET /api/v1/wallets/me
 */
export async function getMyWallets() {
  try {
    const { data } = await api.get("/wallets/me");
    return unwrapData(data);
  } catch (err) {
    console.warn("API /wallets/me failed, falling back to mock state:", err);
    return null;
  }
}

/**
 * 2. Kích hoạt Ví GET /api/v1/wallets/activate
 */
export async function activateWallet(walletType = "BUYER", acceptedTermsVersion = "v1.0") {
  const { data } = await api.post("/wallets/activate", { walletType, acceptedTermsVersion });
  return unwrapData(data);
}

/**
 * 3. Lịch sử giao dịch sổ cái ví GET /api/v1/wallets/transactions
 */
export async function getMyWalletTransactions(params = {}) {
  try {
    const { data } = await api.get("/wallets/transactions", { params });
    return unwrapPagedList(data);
  } catch {
    const state = readState();
    return { items: state.transactions, total: state.transactions.length };
  }
}

/**
 * 4. Tạo đơn nạp tiền POST /api/v1/wallets/top-ups (cần Idempotency-Key)
 */
export async function createTopUpCheckout({ amount, provider = "VNPAY", walletType = "BUYER" }) {
  const idempotencyKey = `topup-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const { data } = await api.post(
    "/wallets/top-ups",
    { amount, provider, walletType },
    { headers: { "Idempotency-Key": idempotencyKey } }
  );
  return unwrapData(data);
}

/**
 * 5. Lấy lịch sử nạp tiền GET /api/v1/wallets/top-ups
 */
export async function getMyTopUps(params = {}) {
  const { data } = await api.get("/wallets/top-ups", { params });
  return unwrapPagedList(data);
}

/**
 * 6. Hủy đơn nạp tiền POST /api/v1/wallets/top-ups/{topUpId}/cancel
 */
export async function cancelMyTopUp(topUpId) {
  const { data } = await api.post(`/wallets/top-ups/${topUpId}/cancel`);
  return unwrapData(data);
}

/**
 * 7. Tạo yêu cầu rút tiền POST /api/v1/wallets/withdrawals (cần Idempotency-Key)
 */
export async function createWithdrawalRequest({
  walletType = "SELLER",
  amount,
  currency = "VND",
  simulatedPayoutProvider = "VNPAY",
  simulatedPayoutAccountReference = "",
  simulatedPayoutAccountName = "",
}) {
  try {
    const idempotencyKey = `wd-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const { data } = await api.post(
      "/wallets/withdrawals",
      {
        walletType,
        amount,
        currency,
        simulatedPayoutProvider,
        simulatedPayoutAccountReference,
        simulatedPayoutAccountName,
      },
      { headers: { "Idempotency-Key": idempotencyKey } }
    );
    return unwrapData(data);
  } catch (err) {
    console.warn("API /wallets/withdrawals failed, using fallback mock:", err);
    return requestWithdrawalMock({ amount, accountId: simulatedPayoutAccountReference, accountType: "business", accountName: simulatedPayoutAccountName, bank: simulatedPayoutProvider });
  }
}

/**
 * 8. Lấy lịch sử rút tiền GET /api/v1/wallets/withdrawals
 */
export async function getMyWithdrawals(params = {}) {
  try {
    const { data } = await api.get("/wallets/withdrawals", { params });
    return unwrapPagedList(data);
  } catch {
    const state = readState();
    return { items: state.withdrawals, total: state.withdrawals.length };
  }
}

/**
 * 9. Lấy trạng thái ví đầy đủ (Tổng hợp API real + Mock fallback)
 */
export const getWalletState = async () => {
  try {
    const realWallet = await getMyWallets();
    if (realWallet?.wallets && realWallet.wallets.length > 0) {
      const buyerWd = realWallet.wallets.find((w) => w.walletType === "BUYER");
      const sellerWd = realWallet.wallets.find((w) => w.walletType === "SELLER");
      const activeWd = sellerWd || buyerWd || realWallet.wallets[0];

      const txns = await getMyWalletTransactions();
      const wds = await getMyWithdrawals();

      return {
        walletStats: {
          availableBalance: activeWd.availableBalance ?? 0,
          pendingBalance: activeWd.pendingBalance ?? 0,
          currency: activeWd.currency || "VND",
        },
        transactions: txns.items || [],
        withdrawals: wds.items || [],
      };
    }
  } catch (err) {
    console.warn("Failed to load real wallet state:", err);
  }

  await mockDelay(200);
  return readState();
};

export const requestWithdrawal = async ({ amount, accountId, accountType, accountName, bank }) => {
  return createWithdrawalRequest({
    walletType: "SELLER",
    amount,
    currency: "VND",
    simulatedPayoutProvider: bank,
    simulatedPayoutAccountReference: accountId,
    simulatedPayoutAccountName: accountName,
  });
};

const requestWithdrawalMock = async ({ amount, accountId, accountType, accountName, bank }) => {
  await mockDelay(400);
  const state = readState();
  const { availableBalance } = state.walletStats;

  if (amount < 100_000) {
    throw new Error("Số tiền rút tối thiểu là 100.000đ");
  }
  if (amount > availableBalance) {
    throw new Error("Số dư khả dụng không đủ để rút");
  }

  const now = new Date();
  const dateStr = now.toLocaleDateString("vi-VN");
  const wdId = `WD-${440 + state.withdrawals.length + 1}`;
  const txnId = `TXN-${9012 + state.transactions.length + 1}`;

  const withdrawal = {
    id: wdId,
    amount,
    status: "Đang xử lý",
    date: dateStr,
    accountId,
    accountType,
    accountName,
    bank,
  };

  const transaction = {
    id: txnId,
    type: "out",
    desc: `Rút tiền về ${accountType === "business" ? "TK doanh nghiệp" : "TK cá nhân"} (${bank})`,
    amount: -amount,
    date: dateStr,
  };

  state.walletStats.availableBalance -= amount;
  state.walletStats.pendingBalance += amount;
  state.withdrawals = [withdrawal, ...state.withdrawals];
  state.transactions = [transaction, ...state.transactions];

  writeState(state);
  return { withdrawal, walletStats: state.walletStats };
};

export const resetWalletState = () => {
  localStorage.removeItem(WALLET_STATE_KEY);
};
