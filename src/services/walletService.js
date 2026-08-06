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
    const result = unwrapData(data);

    // Tự động kích hoạt ví BUYER nếu chưa kích hoạt
    if (result?.wallets) {
      const buyerWd = result.wallets.find(w => w.walletType === 'BUYER');
      if (buyerWd && buyerWd.status !== 'ACTIVE') {
        try {
          await activateWallet('BUYER');
          const { data: freshData } = await api.get("/wallets/me");
          return unwrapData(freshData);
        } catch {
          /* ignore */
        }
      }
    }
    return result;
  } catch (err) {
    console.warn("API /wallets/me failed:", err);
    return null;
  }
}

/**
 * 2. Kích hoạt Ví POST /api/v1/wallets/activate
 * Thử các định dạng phiên bản điều khoản phổ biến (1.0.0, 1.0, v1.0, v1) để tránh lỗi 400 Bad Request.
 */
export async function activateWallet(walletType = "BUYER", acceptedTermsVersion = "1.0.0") {
  const versions = Array.from(new Set([acceptedTermsVersion, "1.0.0", "1.0", "v1.0", "v1"]));
  let lastErr = null;

  for (const ver of versions) {
    try {
      const { data } = await api.post("/wallets/activate", { walletType, acceptedTermsVersion: ver });
      return unwrapData(data);
    } catch (err) {
      lastErr = err;
      const detail = err?.response?.data?.detail || err?.response?.data?.title || err?.message || '';
      if (!detail.toLowerCase().includes('terms version') && !detail.toLowerCase().includes('current')) {
        throw err;
      }
    }
  }
  throw lastErr;
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
 * Tự động gọi activateWallet nếu nhận phản hồi ví chưa kích hoạt.
 */
export async function createTopUpCheckout({ amount, provider = "VNPAY", walletType = "BUYER" }) {
  const idempotencyKey = `topup-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  try {
    const { data } = await api.post(
      "/wallets/top-ups",
      { amount, provider, walletType },
      { headers: { "Idempotency-Key": idempotencyKey } }
    );
    return unwrapData(data);
  } catch (err) {
    const errorMsg = err?.response?.data?.detail || err?.response?.data?.title || err?.message || '';
    
    // Nếu ví chưa kích hoạt -> Tự động kích hoạt ví và thử nạp tiền lại
    if (errorMsg.toLowerCase().includes('activated') || errorMsg.toLowerCase().includes('activate')) {
      try {
        await activateWallet(walletType, "1.0.0");
        const retryKey = `topup-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const { data: retryData } = await api.post(
          "/wallets/top-ups",
          { amount, provider, walletType },
          { headers: { "Idempotency-Key": retryKey } }
        );
        return unwrapData(retryData);
      } catch (activateErr) {
        throw activateErr;
      }
    }
    throw err;
  }
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

      const buyerAvailable = buyerWd?.availableBalance ?? 0;
      const buyerPending = buyerWd?.pendingBalance ?? 0;

      const sellerAvailable = sellerWd?.availableBalance ?? 0;
      const sellerPending = sellerWd?.pendingBalance ?? 0;

      const totalAvailable = buyerAvailable + sellerAvailable;
      const totalPending = buyerPending + sellerPending;

      const txns = await getMyWalletTransactions();
      const wds = await getMyWithdrawals();

      return {
        walletStats: {
          availableBalance: totalAvailable,
          pendingBalance: totalPending,
          buyerAvailable,
          buyerPending,
          sellerAvailable,
          sellerPending,
          currency: (sellerWd || buyerWd)?.currency || "VND",
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
