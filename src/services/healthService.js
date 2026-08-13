import api from '../config/api';
import { unwrapData } from '../utils/apiResponse';

/** GET /api/health — kiểm tra backend sống */
export async function getHealthStatus() {
  const { data } = await api.get('/health', { skipErrorRedirect: true });
  return unwrapData(data) ?? data;
}
