import api from '../config/api';
import { unwrapData, unwrapPagedList, getApiErrorMessage } from '../utils/apiResponse';
import { mockWithdrawals, mockWallets } from '../data/adminEntities';

export { getApiErrorMessage };

/**
 * Lấy danh sách yêu cầu rút tiền /api/v1/admin/withdrawals (fallback sang mock)
 */
export async function getAdminWithdrawals(params = {}) {
  try {
    const { data } = await api.get('/admin/withdrawals', { params });
    const paged = unwrapPagedList(data);
    if (paged.items && paged.items.length > 0) {
      return paged;
    }
    return { items: mockWithdrawals, total: mockWithdrawals.length };
  } catch {
    return { items: mockWithdrawals, total: mockWithdrawals.length };
  }
}

/**
 * Chi tiết rút tiền /api/v1/admin/withdrawals/{withdrawalId}
 */
export async function getAdminWithdrawalById(withdrawalId) {
  try {
    const { data } = await api.get(`/admin/withdrawals/${withdrawalId}`);
    return unwrapData(data);
  } catch {
    return mockWithdrawals.find(w => w.id === withdrawalId) || null;
  }
}

/**
 * Duyệt yêu cầu rút tiền /api/v1/admin/withdrawals/{withdrawalId}/approve
 */
export async function approveAdminWithdrawal(withdrawalId) {
  const { data } = await api.post(`/admin/withdrawals/${withdrawalId}/approve`);
  return unwrapData(data);
}

/**
 * Từ chối yêu cầu rút tiền /api/v1/admin/withdrawals/{withdrawalId}/reject
 */
export async function rejectAdminWithdrawal(withdrawalId, reason) {
  const { data } = await api.post(`/admin/withdrawals/${withdrawalId}/reject`, { reason });
  return unwrapData(data);
}

/**
 * Đánh dấu đang xử lý /api/v1/admin/withdrawals/{withdrawalId}/processing
 */
export async function markAdminWithdrawalProcessing(withdrawalId) {
  const { data } = await api.post(`/admin/withdrawals/${withdrawalId}/processing`);
  return unwrapData(data);
}

/**
 * Đánh dấu đã chuyển khoản thành công /api/v1/admin/withdrawals/{withdrawalId}/mark-paid
 */
export async function markAdminWithdrawalPaid(withdrawalId, payload = {}) {
  const { data } = await api.post(`/admin/withdrawals/${withdrawalId}/mark-paid`, payload);
  return unwrapData(data);
}

/**
 * Danh sách Ví người dùng /api/v1/admin/wallets
 */
export async function getAdminWallets(params = {}) {
  try {
    const { data } = await api.get('/admin/wallets', { params });
    const paged = unwrapPagedList(data);
    if (paged.items && paged.items.length > 0) return paged;
    return { items: mockWallets, total: mockWallets.length };
  } catch {
    return { items: mockWallets, total: mockWallets.length };
  }
}

/**
 * Sổ cái giao dịch ví /api/v1/admin/wallet-ledger
 */
export async function getAdminWalletLedger(params = {}) {
  try {
    const { data } = await api.get('/admin/wallet-ledger', { params });
    return unwrapPagedList(data);
  } catch {
    return { items: [], total: 0 };
  }
}

/**
 * Danh sách nạp tiền /api/v1/admin/top-ups
 */
export async function getAdminTopUps(params = {}) {
  try {
    const { data } = await api.get('/admin/top-ups', { params });
    return unwrapPagedList(data);
  } catch {
    return { items: [], total: 0 };
  }
}
