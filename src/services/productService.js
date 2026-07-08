import { mockDelay } from './mockDelay';
import { safeSetItem } from '../utils/safeSetItem';

const productsKey = (userId) => `mockSellerProducts_${userId}`;

export const getMyProducts = async (userId) => {
  await mockDelay();
  const raw = localStorage.getItem(productsKey(userId));
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

export const createProduct = async (userId, productData) => {
  await mockDelay(1000);
  const existing = await getMyProducts(userId);

  const product = {
    id: `PRD-${Date.now()}`,
    userId,
    status: productData.hidden ? 'DRAFT' : 'PENDING',
    createdAt: new Date().toISOString(),
    ...productData,
  };

  const updated = [product, ...existing];
  safeSetItem(productsKey(userId), JSON.stringify(updated));

  return product;
};

export const updateProduct = async (userId, productId, patch) => {
  const existing = await getMyProducts(userId);
  const updated = existing.map((p) => (p.id === productId ? { ...p, ...patch } : p));
  safeSetItem(productsKey(userId), JSON.stringify(updated));
  return updated.find((p) => p.id === productId);
};

export const updateProductStatus = async (userId, productId, status, reason) => {
  await mockDelay(600);
  return updateProduct(userId, productId, {
    status,
    ...(reason !== undefined && { rejectReason: reason }),
    reviewedAt: new Date().toISOString(),
  });
};

export const updateProductCategory = async (userId, productId, category) => {
  await mockDelay(400);
  return updateProduct(userId, productId, { category });
};
