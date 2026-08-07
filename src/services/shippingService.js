import api from '../config/api';
import { unwrapData } from '../utils/apiResponse';
import { mockDelay } from './mockDelay';
import { shippingSettingsOptions } from '../data/sellerMockData';

const shippingKey = (userId) => `mockSellerShipping_${userId}`;

export const DEFAULT_SHIPPING_METHODS = [
  {
    id: 'ghn',
    name: 'Giao Hàng Nhanh (GHN)',
    fee: 30000,
    eta: 'Dự kiến giao 2 - 3 ngày',
  },
  {
    id: 'ghtk',
    name: 'Giao Hàng Tiết Kiệm (GHTK)',
    fee: 22000,
    eta: 'Dự kiến giao 3 - 5 ngày',
  },
  {
    id: 'viettelpost',
    name: 'Viettel Post',
    fee: 25000,
    eta: 'Dự kiến giao 2 - 4 ngày',
  },
  {
    id: 'express',
    name: 'Hỏa Tốc (GrabExpress / Be)',
    fee: 45000,
    eta: 'Giao ngay trong 2 giờ',
  },
];

/**
 * Lấy danh sách phương thức vận chuyển khả dụng từ API backend GET /api/v1/shipping/methods hoặc /api/v1/admin/carriers/performance
 */
export const getAvailableShippingMethods = async () => {
  try {
    const { data } = await api.get('/shipping/methods');
    const result = unwrapData(data);
    if (Array.isArray(result) && result.length > 0) {
      return result.map((item) => ({
        id: item.id || item.code || item.carrierCode,
        name: item.name || item.carrierName || item.serviceName || item.carrierCode,
        fee: Number(item.fee || item.shippingFee || item.price || 30000),
        eta: item.eta || item.estimatedDelivery || 'Dự kiến giao 2 - 4 ngày',
      }));
    }
  } catch {
    try {
      const { data } = await api.get('/admin/carriers/performance');
      const result = unwrapData(data);
      const items = result?.items || (Array.isArray(result) ? result : []);
      if (items.length > 0) {
        return items.map((c, idx) => ({
          id: c.carrierCode?.toLowerCase() || `carrier-${idx}`,
          name: c.carrierCode === 'GHTK' ? 'Giao Hàng Tiết Kiệm (GHTK)' : (c.carrierCode === 'GHN' ? 'Giao Hàng Nhanh (GHN)' : c.carrierCode),
          fee: c.carrierCode === 'GHTK' ? 22000 : 30000,
          eta: 'Dự kiến giao 2 - 3 ngày',
        }));
      }
    } catch {
      /* ignore */
    }
  }

  return DEFAULT_SHIPPING_METHODS;
};

export const getShippingSettings = async (userId) => {
  await mockDelay();
  const raw = localStorage.getItem(shippingKey(userId));
  if (!raw) return shippingSettingsOptions;
  try {
    const saved = JSON.parse(raw);
    return shippingSettingsOptions.map((base) => {
      const override = saved.find((s) => s.id === base.id);
      return override ? { ...base, enabled: override.enabled } : base;
    });
  } catch {
    return shippingSettingsOptions;
  }
};

export const saveShippingSettings = async (userId, options) => {
  await mockDelay(500);
  localStorage.setItem(shippingKey(userId), JSON.stringify(options));
  return options;
};

