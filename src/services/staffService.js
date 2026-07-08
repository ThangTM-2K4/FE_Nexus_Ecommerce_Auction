import { mockDelay } from './mockDelay';
import {
  sellerApplications as mockApplications,
  flaggedAuctions as mockFlaggedAuctions,
  openDisputes as mockDisputes,
} from '../data/staffMockData';

const applicationKey = (userId) => `mockSellerApplication_${userId}`;

const readLocalApplication = (userId) => {
  const raw = localStorage.getItem(applicationKey(userId));
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const mapLocalApplication = (app) => ({
  applicationId: app.applicationId,
  userId: app.userId,
  fullName: app.fullName || app.shopName || 'Người dùng',
  email: app.email || '—',
  phone: app.phone || app.phoneNumber || '—',
  shopName: app.shopName || '—',
  category: app.category || app.businessCategory || '—',
  submittedAt: app.submittedAt
    ? new Date(app.submittedAt).toLocaleString('vi-VN')
    : '—',
  status: app.status,
  documents: app.documents || ['CMND/CCCD'],
  source: 'local',
});

export const getPendingSellerApplications = async () => {
  await mockDelay();
  const localApps = [];

  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (!key?.startsWith('mockSellerApplication_')) continue;
    const app = readLocalApplication(key.replace('mockSellerApplication_', ''));
    if (app?.status === 'PENDING') {
      localApps.push(mapLocalApplication(app));
    }
  }

  const mockPending = mockApplications.filter((a) => a.status === 'PENDING');
  const merged = [...localApps];

  mockPending.forEach((mock) => {
    if (!merged.some((a) => a.applicationId === mock.applicationId)) {
      merged.push({ ...mock, source: 'mock' });
    }
  });

  return merged;
};

export const approveSellerApplication = async (userId) => {
  await mockDelay(800);
  const { simulateAdminApproval } = await import('./sellerService');
  return simulateAdminApproval(userId);
};

export const rejectSellerApplication = async (userId, reason, adminNote) => {
  await mockDelay(800);
  const { simulateAdminRejection } = await import('./sellerService');
  return simulateAdminRejection(userId, reason, adminNote);
};

const PRODUCTS_PREFIX = 'mockSellerProducts_';

export const getPendingProducts = async () => {
  await mockDelay();
  const pending = [];

  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (!key?.startsWith(PRODUCTS_PREFIX)) continue;

    const userId = key.replace(PRODUCTS_PREFIX, '');
    const raw = localStorage.getItem(key);
    let products = [];
    try {
      products = JSON.parse(raw) || [];
    } catch {
      products = [];
    }

    products
      .filter((p) => p.status === 'PENDING')
      .forEach((p) => pending.push({ ...p, userId }));
  }

  return pending.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const approveProduct = async (userId, productId) => {
  await mockDelay(600);
  const { updateProductStatus } = await import('./productService');
  return updateProductStatus(userId, productId, 'APPROVED');
};

export const rejectProduct = async (userId, productId, reason) => {
  await mockDelay(600);
  const { updateProductStatus } = await import('./productService');
  return updateProductStatus(userId, productId, 'REJECTED', reason);
};

export const getFlaggedAuctions = async () => {
  await mockDelay();
  return mockFlaggedAuctions;
};

export const getOpenDisputes = async () => {
  await mockDelay();
  return mockDisputes;
};

export const resolveAuctionFlag = async (auctionId, action, note) => {
  await mockDelay(600);
  return { auctionId, action, note, resolvedAt: new Date().toISOString() };
};

export const updateDisputeStatus = async (disputeId, status, note) => {
  await mockDelay(600);
  return { disputeId, status, note, updatedAt: new Date().toISOString() };
};
