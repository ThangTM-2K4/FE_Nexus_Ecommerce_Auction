import { mockDelay } from "./mockDelay";
import {
  walletStats as defaultWalletStats,
  transactions as defaultTransactions,
  withdrawals as defaultWithdrawals,
} from "../data/sellerMockData";

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

export const getWalletState = async () => {
  await mockDelay(300);
  return readState();
};

export const requestWithdrawal = async ({ amount, accountId, accountType, accountName, bank }) => {
  await mockDelay(800);

  const state = readState();
  const { availableBalance } = state.walletStats;

  if (amount < 100_000) {
    throw new Error("Số tiền rút tối thiểu là 100.000đ");
  }
  if (amount > availableBalance) {
    throw new Error("Số dư khả dụng không đủ để rút");
  }
  if (amount > 500_000_000) {
    throw new Error("Số tiền rút tối đa mỗi lần là 500.000.000đ");
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
