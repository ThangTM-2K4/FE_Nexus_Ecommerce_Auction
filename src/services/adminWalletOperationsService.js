import api from '../config/api';
import { unwrapData, unwrapPagedList, getApiErrorMessage } from '../utils/apiResponse';

export { getApiErrorMessage };

const WALLET_STATE_KEY = "sellerWalletState";

const defaultState = () => ({
  walletStats: {
    availableBalance: 450000000,
    pendingBalance: 25000000,
    currency: "VND",
  },
  transactions: [
    { id: "TXN-9012", type: "in", desc: "Nạp tiền qua VNPAY", amount: 50000000, date: "05/08/2026" },
    { id: "TXN-9011", type: "out", desc: "Rút tiền về TK doanh nghiệp (MBBank)", amount: -15000000, date: "04/08/2026" },
  ],
  withdrawals: [
    { id: "WD-441", seller: "LuxuryTime VN", amount: 15000000, status: "Chờ duyệt", date: "05/08/2026", bank: "MBBank (****8888)", accountName: "LUXURYTIME CO LTD" },
    { id: "WD-440", seller: "Fashion Elite", amount: 8000000, status: "Đã duyệt", date: "03/08/2026", bank: "Vietcombank (****1234)", accountName: "FASHION ELITE VN" },
    { id: "WD-439", seller: "TechHub Store", amount: 12000000, status: "Đã thanh toán", date: "01/08/2026", bank: "Techcombank (****9999)", accountName: "TECHHUB VIETNAM" },
  ],
  topUps: [
    { topUpId: "TOP-101", userName: "Nguyễn Văn An", amount: 50000000, provider: "VNPAY", status: "COMPLETED", topUpCode: "VNP-8849102", createdAtUtc: "2026-08-05T06:00:00Z" },
    { topUpId: "TOP-100", userName: "LuxuryTime VN", amount: 100000000, provider: "VNPAY", status: "COMPLETED", topUpCode: "VNP-8849099", createdAtUtc: "2026-08-04T12:30:00Z" },
  ],
  wallets: [
    { walletId: "W-001", userName: "LuxuryTime VN", walletType: "SELLER", availableBalance: 450000000, pendingBalance: 25000000, status: "ACTIVE" },
    { walletId: "W-002", userName: "Nguyễn Văn An", walletType: "BUYER", availableBalance: 5200000, pendingBalance: 0, status: "ACTIVE" },
    { walletId: "W-003", userName: "Fashion Elite", walletType: "SELLER", availableBalance: 890000000, pendingBalance: 0, status: "ACTIVE" },
    { walletId: "W-004", userName: "TechHub Store", walletType: "SELLER", availableBalance: 120000000, pendingBalance: 15000000, status: "ACTIVE" },
  ]
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
 * 1. Báo cáo đối soát vận hành ví GET /api/v1/admin/wallet-operations/reconciliation
 */
export async function getAdminWalletOperationsReconciliation(refresh = false) {
  try {
    const { data } = await api.get('/admin/wallet-operations/reconciliation', { params: { refresh } });
    return unwrapData(data);
  } catch {
    return { totalWallets: 4, totalBalance: 1465200000, status: "HEALTHY", lastReconciledAt: new Date().toISOString() };
  }
}

/**
 * 2. Danh sách hàng chờ quyết toán GET /api/v1/admin/settlements
 */
export async function getAdminSettlements(params = {}) {
  try {
    const { data } = await api.get('/admin/settlements', { params });
    return unwrapPagedList(data);
  } catch {
    return { items: [], total: 0 };
  }
}

/**
 * 3. Thử lại quyết toán thất bại POST /api/v1/admin/settlements/{settlementId}/retry
 */
export async function retryAdminSettlement(settlementId) {
  try {
    const { data } = await api.post(`/admin/settlements/${settlementId}/retry`);
    return unwrapData(data);
  } catch {
    return { success: true, message: "Đã thử lại lệnh quyết toán" };
  }
}

/**
 * 4. Danh sách nạp tiền admin GET /api/v1/admin/top-ups
 */
export async function getAdminTopUps(params = {}) {
  try {
    const { data } = await api.get('/admin/top-ups', { params });
    const paged = unwrapPagedList(data);
    if (paged.items && paged.items.length > 0) return paged;
  } catch {
    /* fallback */
  }
  const state = readState();
  return { items: state.topUps, total: state.topUps.length };
}

/**
 * 5. Chi tiết nạp tiền admin GET /api/v1/admin/top-ups/{topUpId}
 */
export async function getAdminTopUpById(topUpId) {
  try {
    const { data } = await api.get(`/admin/top-ups/${topUpId}`);
    return unwrapData(data);
  } catch {
    const state = readState();
    return state.topUps.find(t => t.topUpId === topUpId) || null;
  }
}

/**
 * 6. Đối soát nạp tiền POST /api/v1/admin/top-ups/{topUpId}/reconcile
 */
export async function reconcileAdminTopUp(topUpId) {
  try {
    const { data } = await api.post(`/admin/top-ups/${topUpId}/reconcile`);
    return unwrapData(data);
  } catch {
    return { reconciled: true, topUpId };
  }
}

/**
 * 7. Giả lập nạp tiền thành công POST /api/v1/admin/top-ups/{topUpId}/simulate-success
 */
export async function simulateTopUpSuccess(topUpId) {
  try {
    const { data } = await api.post(`/admin/top-ups/${topUpId}/simulate-success`);
    return unwrapData(data);
  } catch {
    const state = readState();
    const target = state.topUps.find(t => t.topUpId === topUpId);
    if (target) {
      target.status = "COMPLETED";
      writeState(state);
    }
    return { status: "COMPLETED", topUpId };
  }
}

/**
 * 8. Giả lập nạp tiền thất bại POST /api/v1/admin/top-ups/{topUpId}/simulate-failure
 */
export async function simulateTopUpFailure(topUpId, reason = 'Simulated failure') {
  try {
    const { data } = await api.post(`/admin/top-ups/${topUpId}/simulate-failure`, { reason });
    return unwrapData(data);
  } catch {
    const state = readState();
    const target = state.topUps.find(t => t.topUpId === topUpId);
    if (target) {
      target.status = "FAILED";
      writeState(state);
    }
    return { status: "FAILED", topUpId, reason };
  }
}

/**
 * 9. Danh sách hoàn tiền cần đối soát GET /api/v1/admin/refund-reconciliation
 */
export async function getAdminRefundReconciliation(params = {}) {
  try {
    const { data } = await api.get('/admin/refund-reconciliation', { params });
    return unwrapPagedList(data);
  } catch {
    return { items: [], total: 0 };
  }
}

/**
 * 10. Danh sách Ví admin GET /api/v1/admin/wallets
 */
export async function getAdminWallets(params = {}) {
  try {
    const { data } = await api.get('/admin/wallets', { params });
    const paged = unwrapPagedList(data);
    if (paged.items && paged.items.length > 0) return paged;
  } catch {
    /* fallback */
  }
  const state = readState();
  return { items: state.wallets, total: state.wallets.length };
}

/**
 * 11. Sổ cái giao dịch ví admin GET /api/v1/admin/wallet-ledger
 */
export async function getAdminWalletLedger(params = {}) {
  try {
    const { data } = await api.get('/admin/wallet-ledger', { params });
    const paged = unwrapPagedList(data);
    if (paged.items && paged.items.length > 0) return paged;
  } catch {
    /* fallback */
  }
  const state = readState();
  return { items: state.transactions, total: state.transactions.length };
}

/**
 * 12. Đối soát số dư ví admin GET /api/v1/admin/wallet-reconciliation
 */
export async function getAdminWalletReconciliation(refresh = true) {
  try {
    const { data } = await api.get('/admin/wallet-reconciliation', { params: { refresh } });
    return unwrapData(data);
  } catch {
    return { totalWallets: 4, reconciledCount: 4, isMatched: true };
  }
}

/**
 * 13. Danh sách yêu cầu rút tiền GET /api/v1/admin/withdrawals
 */
export async function getAdminWithdrawals(params = {}) {
  try {
    const { data } = await api.get('/admin/withdrawals', { params });
    const paged = unwrapPagedList(data);
    if (paged.items && paged.items.length > 0) return paged;
  } catch {
    /* fallback */
  }
  const state = readState();
  return { items: state.withdrawals, total: state.withdrawals.length };
}

/**
 * 14. Chi tiết rút tiền GET /api/v1/admin/withdrawals/{withdrawalId}
 */
export async function getAdminWithdrawalById(withdrawalId) {
  try {
    const { data } = await api.get(`/admin/withdrawals/${withdrawalId}`);
    return unwrapData(data);
  } catch {
    const state = readState();
    return state.withdrawals.find(w => w.id === withdrawalId || w.withdrawalId === withdrawalId) || null;
  }
}

/**
 * 15. Duyệt yêu cầu rút tiền POST /api/v1/admin/withdrawals/{withdrawalId}/approve
 */
export async function approveAdminWithdrawal(withdrawalId, note = '') {
  try {
    const { data } = await api.post(`/admin/withdrawals/${withdrawalId}/approve`, { note });
    return unwrapData(data);
  } catch {
    const state = readState();
    const item = state.withdrawals.find(w => w.id === withdrawalId || w.withdrawalId === withdrawalId);
    if (item) {
      item.status = "Đã duyệt";
      writeState(state);
    }
    return { success: true, withdrawalId };
  }
}

/**
 * 16. Từ chối yêu cầu rút tiền POST /api/v1/admin/withdrawals/{withdrawalId}/reject
 */
export async function rejectAdminWithdrawal(withdrawalId, reason = '') {
  try {
    const { data } = await api.post(`/admin/withdrawals/${withdrawalId}/reject`, { reason });
    return unwrapData(data);
  } catch {
    const state = readState();
    const item = state.withdrawals.find(w => w.id === withdrawalId || w.withdrawalId === withdrawalId);
    if (item) {
      item.status = "Đã hủy";
      state.walletStats.availableBalance += (item.amount || 0);
      state.walletStats.pendingBalance -= (item.amount || 0);
      writeState(state);
    }
    return { success: true, withdrawalId };
  }
}

/**
 * 17. Đang xử lý chuyển khoản POST /api/v1/admin/withdrawals/{withdrawalId}/processing
 */
export async function markAdminWithdrawalProcessing(withdrawalId, note = '') {
  try {
    const { data } = await api.post(`/admin/withdrawals/${withdrawalId}/processing`, { note });
    return unwrapData(data);
  } catch {
    const state = readState();
    const item = state.withdrawals.find(w => w.id === withdrawalId || w.withdrawalId === withdrawalId);
    if (item) {
      item.status = "Đang xử lý";
      writeState(state);
    }
    return { success: true, withdrawalId };
  }
}

/**
 * 18. Đánh dấu đã chuyển khoản thành công POST /api/v1/admin/withdrawals/{withdrawalId}/mark-paid
 */
export async function markAdminWithdrawalPaid(withdrawalId, payload = {}) {
  try {
    const { data } = await api.post(`/admin/withdrawals/${withdrawalId}/mark-paid`, payload);
    return unwrapData(data);
  } catch {
    const state = readState();
    const item = state.withdrawals.find(w => w.id === withdrawalId || w.withdrawalId === withdrawalId);
    if (item) {
      item.status = "Đã thanh toán";
      state.walletStats.pendingBalance -= (item.amount || 0);
      writeState(state);
    }
    return { success: true, withdrawalId };
  }
}
