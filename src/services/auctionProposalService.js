import api from '../config/api';
import { unwrapData, unwrapPagedList, getApiErrorMessage } from '../utils/apiResponse';

export { getApiErrorMessage };

/** Map FE camelCase → query PascalCase (Swagger GET /auction/proposals) */
const PROPOSAL_QUERY_KEYS = {
  scope: 'Scope',
  status: 'Status',
  categoryId: 'CategoryId',
  search: 'Search',
  createdFromUtc: 'CreatedFromUtc',
  createdToUtc: 'CreatedToUtc',
  sort: 'Sort',
  pageNumber: 'PageNumber',
  pageSize: 'PageSize',
};

const toProposalQueryParams = (params = {}) => {
  const out = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    const apiKey = PROPOSAL_QUERY_KEYS[key] ?? key;
    out[apiKey] = value;
  });
  return out;
};

/**
 * Lấy danh sách đề xuất đấu giá
 * Scope='mine'   → Seller xem proposals của mình
 * Scope='staff'  → Admin/Staff xem proposals cần duyệt
 * GET /api/v1/auction/proposals
 */
export async function getAuctionProposals(params = {}) {
  try {
    const { data } = await api.get('/auction/proposals', {
      params: toProposalQueryParams(params),
      skipErrorRedirect: true,
    });
    return unwrapPagedList(data);
  } catch {
    return { items: [], total: 0, totalCount: 0 };
  }
}

/**
 * Chi tiết đề xuất đấu giá GET /api/v1/auction/proposals/{id}
 */
export async function getAuctionProposalById(id) {
  const { data } = await api.get(`/auction/proposals/${id}`, { skipErrorRedirect: true });
  return unwrapData(data);
}

/**
 * Build multipart/form-data theo Swagger POST /auction/proposals/applications
 */
export function buildAuctionApplicationFormData({
  title,
  description,
  condition,
  categoryId,
  brand,
  startPrice,
  reservePrice,
  bidIncrement,
  startDate,
  endDate,
  agreeRules = true,
  images = [],
  documents = [],
}) {
  const fd = new FormData();
  const startNum = Number(startPrice) || 0;
  const reserveNum = Number(reservePrice);
  const resolvedReserve =
    reservePrice != null && String(reservePrice).trim() !== '' && reserveNum > 0
      ? Math.max(reserveNum, startNum)
      : startNum;

  fd.append('Title', String(title || '').trim());
  fd.append('Description', String(description || '').trim());
  fd.append('Condition', condition || 'GOOD');
  fd.append('CategoryId', String(categoryId || ''));
  fd.append('Brand', String(brand || '').trim());
  fd.append('StartPrice', String(startNum));
  fd.append('ReservePrice', String(resolvedReserve));
  fd.append('BidIncrement', String(Number(bidIncrement) || 0));
  if (startDate) fd.append('StartDate', new Date(startDate).toISOString());
  if (endDate) fd.append('EndDate', new Date(endDate).toISOString());
  fd.append('AgreeRules', agreeRules ? 'true' : 'false');

  images.forEach((file) => {
    if (file instanceof File) fd.append('Images', file);
  });
  documents.forEach((file) => {
    if (file instanceof File) fd.append('Documents', file);
  });

  return fd;
}

/**
 * Seller nộp hồ sơ đấu giá mới (multipart/form-data)
 * POST /api/v1/auction/proposals/applications
 */
export async function createAuctionApplication(formData) {
  const { data } = await api.post('/auction/proposals/applications', formData, {
    skipErrorRedirect: true,
  });
  return unwrapData(data);
}

/**
 * @deprecated Dùng buildAuctionApplicationFormData() + createAuctionApplication()
 */
export async function createAuctionProposal(payload) {
  try {
    const fd = new FormData();
    Object.entries(payload).forEach(([k, v]) => {
      if (v !== undefined && v !== null) fd.append(k, v);
    });
    return await createAuctionApplication(fd);
  } catch {
    return null;
  }
}

/**
 * Seller xuất bản Proposal đã được Admin duyệt → tạo Auction SCHEDULED
 * POST /api/v1/auction/proposals/{id}/publish
 * Body: { expectedRowVersion: string }
 */
export async function publishProposal(id, { expectedRowVersion, rowVersion } = {}) {
  const { data } = await api.post(
    `/auction/proposals/${id}/publish`,
    { expectedRowVersion: expectedRowVersion ?? rowVersion ?? '' },
    { skipErrorRedirect: true },
  );
  return unwrapData(data);
}
