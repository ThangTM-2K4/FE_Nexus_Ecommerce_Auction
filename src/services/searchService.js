import api from '../config/api';
import { unwrapData, unwrapPagedList } from '../utils/apiResponse';
import { getProducts } from './ecommerceProductService';

/**
 * Search sellers — GET /api/v1/sellers/search?keyword={keyword}&page=1&pageSize=20
 */
export async function searchSellers(keyword, page = 1, pageSize = 20) {
  if (!keyword || !keyword.trim()) {
    return { items: [], totalCount: 0, page: 1, pageSize };
  }
  try {
    const { data } = await api.get('/sellers/search', {
      params: { keyword: keyword.trim(), page, pageSize },
      skipErrorRedirect: true,
    });
    const payload = unwrapData(data) || data;
    if (payload?.items && Array.isArray(payload.items)) {
      return {
        items: payload.items,
        totalCount: payload.totalCount ?? payload.total ?? payload.items.length,
        page: payload.page ?? page,
        pageSize: payload.pageSize ?? pageSize,
      };
    }
    const rawItems = Array.isArray(payload) ? payload : [];
    return {
      items: rawItems,
      totalCount: rawItems.length,
      page,
      pageSize,
    };
  } catch (error) {
    console.warn('searchSellers error:', error);
    return { items: [], totalCount: 0, page: 1, pageSize };
  }
}

/**
 * Search products — GET /api/v1/ecommerce/products?search={keyword}
 */
export async function searchProducts(keyword, pageNumber = 1, pageSize = 20, extraFilters = {}) {
  try {
    const res = await getProducts({
      search: keyword ? keyword.trim() : undefined,
      pageNumber,
      pageSize,
      ...extraFilters,
    });
    return res;
  } catch (error) {
    console.warn('searchProducts error:', error);
    return { items: [], total: 0, pageNumber: 1, pageSize: 20 };
  }
}
