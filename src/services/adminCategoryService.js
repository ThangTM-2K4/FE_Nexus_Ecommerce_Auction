import api from '../config/api';
import { unwrapData, unwrapPagedList, getApiErrorMessage } from '../utils/apiResponse';

export { getApiErrorMessage };

/**
 * Đảm bảo dữ liệu danh mục luôn tuân theo cấu trúc 2 tầng (category tree)
 */
export function ensureCategoryTree(items) {
  if (!Array.isArray(items)) return [];
  if (items.some(i => Array.isArray(i.children))) {
    return items.map((cat, idx) => ({
      id: cat.categoryId ?? cat.id ?? `cat-${idx}`,
      name: cat.name || cat.categoryName || 'Danh mục',
      icon: cat.icon || '📦',
      status: cat.status || 'Hoạt động',
      productCount: cat.productCount ?? 0,
      children: Array.isArray(cat.children) ? cat.children.map((c, cIdx) => ({
        id: c.categoryId ?? c.id ?? `cat-${idx}-${cIdx}`,
        name: c.name || c.categoryName || 'Danh mục con',
        status: c.status || 'Hoạt động',
        productCount: c.productCount ?? 0,
      })) : [],
    }));
  }
  const parents = items.filter(i => !i.parentId);
  if (parents.length > 0) {
    return parents.map(p => ({
      id: p.categoryId ?? p.id,
      name: p.name,
      icon: p.icon || '📦',
      status: p.status || 'Hoạt động',
      productCount: p.productCount ?? 0,
      children: items.filter(c => c.parentId === (p.categoryId ?? p.id)).map(c => ({
        id: c.categoryId ?? c.id,
        name: c.name,
        status: c.status || 'Hoạt động',
        productCount: c.productCount ?? 0,
      })),
    }));
  }
  return [];
}

/** 
 * Lấy danh sách danh mục sản phẩm từ backend /api/v1/categories
 */
export async function getCategories(params = {}) {
  const { data } = await api.get('/categories', { params });
  const raw = data?.data ?? data;
  const nodes = Array.isArray(raw?.tree) ? raw.tree : unwrapPagedList(data).items || [];
  return ensureCategoryTree(nodes);
}

/**
 * Tạo danh mục sản phẩm mới /api/v1/categories
 */
export async function createCategory(payload) {
  const { data } = await api.post('/categories', payload);
  return unwrapData(data);
}

/**
 * Cập nhật danh mục sản phẩm /api/v1/categories/{categoryId}
 */
export async function updateCategory(categoryId, payload) {
  const { data } = await api.put(`/categories/${categoryId}`, payload);
  return unwrapData(data);
}

/**
 * Xóa danh mục sản phẩm /api/v1/categories/{categoryId}
 */
export async function deleteCategory(categoryId) {
  const { data } = await api.delete(`/categories/${categoryId}`);
  return unwrapData(data);
}
