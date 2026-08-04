import api from '../config/api';
import { unwrapData, getApiErrorMessage } from '../utils/apiResponse';

export { getApiErrorMessage };

/**
 * Lấy lịch sử điểm uy tín của 1 User /api/v1/admin/reputation/users/{userId}
 */
export async function getUserReputationHistory(userId) {
  try {
    const { data } = await api.get(`/admin/reputation/users/${userId}`);
    return unwrapData(data);
  } catch {
    return null;
  }
}

/**
 * Điều chỉnh điểm uy tín thủ công /api/v1/admin/reputation/adjustments
 */
export async function adjustUserReputation({ userId, scoreChange, reason }) {
  const { data } = await api.post('/admin/reputation/adjustments', { userId, scoreChange, reason });
  return unwrapData(data);
}

/**
 * Đảo ngược lịch sử điểm uy tín /api/v1/admin/reputation/entries/{entryId}/reverse
 */
export async function reverseReputationEntry(entryId, reason) {
  const { data } = await api.post(`/admin/reputation/entries/${entryId}/reverse`, { reason });
  return unwrapData(data);
}

/**
 * Gỡ bỏ hạn chế tài khoản /api/v1/admin/reputation/restrictions/clear
 */
export async function clearReputationRestriction(userId) {
  const { data } = await api.post('/admin/reputation/restrictions/clear', { userId });
  return unwrapData(data);
}
