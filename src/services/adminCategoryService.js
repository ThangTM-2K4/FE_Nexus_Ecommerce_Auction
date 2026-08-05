import api from '../config/api';
import { unwrapData, unwrapPagedList, getApiErrorMessage } from '../utils/apiResponse';

export { getApiErrorMessage };

/**
 * Đảm bảo dữ liệu danh mục luôn tuân theo cấu trúc 2 tầng (category tree)
 */
export function ensureCategoryTree(raw) {
  if (!raw) return [];
  const items = Array.isArray(raw)
    ? raw
    : raw?.tree || raw?.items || raw?.page?.items || [];
  if (!Array.isArray(items)) return [];

  if (items.some(i => Array.isArray(i.children))) {
    return items.map((cat, idx) => ({
      id: cat.categoryId || cat.id || `cat-${idx}`,
      categoryId: cat.categoryId || cat.id,
      name: cat.name || cat.categoryName || 'Danh mục',
      slug: cat.slug || '',
      description: cat.description || '',
      icon: cat.icon || '📦',
      status: cat.isActive !== undefined ? (cat.isActive ? 'Hoạt động' : 'Tắt') : (cat.status || 'Hoạt động'),
      isActive: cat.isActive ?? true,
      rowVersion: cat.rowVersion || null,
      parentCategoryId: cat.parentCategoryId || cat.parentId || null,
      sortOrder: cat.sortOrder ?? 0,
      productCount: cat.productCount ?? 0,
      children: Array.isArray(cat.children) ? cat.children.map((c, cIdx) => ({
        id: c.categoryId || c.id || `cat-${idx}-${cIdx}`,
        categoryId: c.categoryId || c.id,
        name: c.name || c.categoryName || 'Danh mục con',
        slug: c.slug || '',
        description: c.description || '',
        status: c.isActive !== undefined ? (c.isActive ? 'Hoạt động' : 'Tắt') : (c.status || 'Hoạt động'),
        isActive: c.isActive ?? true,
        rowVersion: c.rowVersion || null,
        parentCategoryId: c.parentCategoryId || c.parentId || cat.categoryId || cat.id,
        sortOrder: c.sortOrder ?? 0,
        productCount: c.productCount ?? 0,
      })) : [],
    }));
  }
  const parents = items.filter(i => !(i.parentCategoryId || i.parentId));
  const listToUse = parents.length > 0 ? parents : items;
  return listToUse.map((p, idx) => {
    const pId = p.categoryId || p.id;
    return {
      id: pId || `cat-${idx}`,
      categoryId: pId,
      name: p.name || p.categoryName || 'Danh mục',
      slug: p.slug || '',
      description: p.description || '',
      icon: p.icon || '📦',
      status: p.isActive !== undefined ? (p.isActive ? 'Hoạt động' : 'Tắt') : (p.status || 'Hoạt động'),
      isActive: p.isActive ?? true,
      rowVersion: p.rowVersion || null,
      parentCategoryId: p.parentCategoryId || p.parentId || null,
      sortOrder: p.sortOrder ?? 0,
      productCount: p.productCount ?? 0,
      children: items.filter(c => (c.parentCategoryId || c.parentId) === pId).map((c, cIdx) => ({
        id: c.categoryId || c.id || `cat-${idx}-${cIdx}`,
        categoryId: c.categoryId || c.id,
        name: c.name || c.categoryName || 'Danh mục con',
        slug: c.slug || '',
        description: c.description || '',
        status: c.isActive !== undefined ? (c.isActive ? 'Hoạt động' : 'Tắt') : (c.status || 'Hoạt động'),
        isActive: c.isActive ?? true,
        rowVersion: c.rowVersion || null,
        parentCategoryId: c.parentCategoryId || c.parentId || pId,
        sortOrder: c.sortOrder ?? 0,
        productCount: c.productCount ?? 0,
      })),
    };
  });
}

/**
 * Lấy danh sách danh mục sản phẩm từ backend GET /api/v1/categories
 */
export async function getCategories(params = {}) {
  try {
    const queryParams = {
      view: 'tree',
      includeInactive: true,
      sortBy: 'name',
      sortDirection: 'asc',
      pageNumber: 1,
      pageSize: 100,
      ...params,
    };
    const { data } = await api.get('/categories', { params: queryParams });
    const payloadData = unwrapData(data) || data?.data || data;
    return ensureCategoryTree(payloadData);
  } catch (err) {
    console.error('Failed to fetch categories:', err);
    return [];
  }
}

/**
 * Chi tiết danh mục GET /api/v1/categories/{categoryId}
 * Dùng scope 'admin' hoặc không truyền scope để lấy thông tin danh mục cả khi Tắt (INACTIVE)
 */
export async function getCategoryById(categoryId, scope = 'admin') {
  try {
    const params = scope ? { scope } : {};
    const { data } = await api.get(`/categories/${categoryId}`, { params });
    return unwrapData(data);
  } catch {
    try {
      const { data } = await api.get(`/categories/${categoryId}`);
      return unwrapData(data);
    } catch {
      return null;
    }
  }
}

/**
 * Tạo danh mục sản phẩm mới POST /api/v1/categories
 */
export async function createCategory(payload) {
  const name = payload.name?.trim() || '';
  const cleanSlug = (payload.slug || name.toLowerCase()).trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
  const body = {
    name,
    slug: cleanSlug || 'danh-muc',
    description: payload.description || '',
    imageUrl: payload.imageUrl || payload.image || '',
    parentCategoryId: payload.parentCategoryId || payload.parentId || null,
    sortOrder: payload.sortOrder ?? 0,
    isActive: payload.isActive ?? true,
  };
  const { data } = await api.post('/categories', body);
  return unwrapData(data);
}

/**
 * Cập nhật danh mục sản phẩm PUT /api/v1/categories/{categoryId}
 */
export async function updateCategory(categoryId, payload) {
  let rowVersion = payload.rowVersion;

  // Lấy rowVersion mới nhất từ Server bằng GET /categories/{id} nếu chưa có
  if (!rowVersion) {
    try {
      const detail = await getCategoryById(categoryId, 'admin');
      if (detail?.rowVersion) {
        rowVersion = detail.rowVersion;
      }
    } catch {
      // ignore
    }
  }

  // Nếu vẫn chưa tìm thấy rowVersion, lấy danh mục từ getCategories()
  if (!rowVersion) {
    try {
      const allCats = await getCategories({ includeInactive: true });
      const found = allCats.find(c => c.id === categoryId || c.categoryId === categoryId)
        || allCats.flatMap(c => c.children || []).find(c => c.id === categoryId || c.categoryId === categoryId);
      if (found?.rowVersion) {
        rowVersion = found.rowVersion;
      }
    } catch {
      // ignore
    }
  }

  const body = {
    name: payload.name,
    slug: payload.slug || payload.name?.toLowerCase?.().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-'),
    description: payload.description || '',
    imageUrl: payload.imageUrl || payload.image || '',
    parentCategoryId: payload.parentCategoryId || payload.parentId || null,
    sortOrder: payload.sortOrder ?? 0,
    isActive: payload.isActive ?? true,
    ...(rowVersion ? { rowVersion } : {}),
  };

  const headers = {};
  if (rowVersion) {
    headers['If-Match'] = rowVersion;
  }

  const { data } = await api.put(`/categories/${categoryId}`, body, { headers });
  return unwrapData(data);
}

/**
 * Xóa danh mục sản phẩm DELETE /api/v1/categories/{categoryId}?reason=...
 */
export async function deleteCategory(categoryId, reason = 'Xóa bởi Admin') {
  let rowVersion;
  try {
    const detail = await getCategoryById(categoryId, 'admin');
    rowVersion = detail?.rowVersion;
  } catch {
    // ignore
  }

  if (!rowVersion) {
    try {
      const allCats = await getCategories({ includeInactive: true });
      const found = allCats.find(c => c.id === categoryId || c.categoryId === categoryId)
        || allCats.flatMap(c => c.children || []).find(c => c.id === categoryId || c.categoryId === categoryId);
      if (found?.rowVersion) {
        rowVersion = found.rowVersion;
      }
    } catch {
      // ignore
    }
  }

  const headers = {};
  if (rowVersion) {
    headers['If-Match'] = rowVersion;
  }

  const { data } = await api.delete(`/categories/${categoryId}`, {
    params: { reason },
    headers,
  });
  return unwrapData(data);
}
