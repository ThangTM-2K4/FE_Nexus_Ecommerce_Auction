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
 * Chuyển đổi tên tiếng Việt có dấu thành chuỗi Slug chuẩn SEO chuẩn hóa ASCII
 * Ví dụ: "Đồng Hồ" -> "dong-ho", "Thời Trang Nam" -> "thoi-trang-nam", "Máy Tính & Laptop" -> "may-tinh-and-laptop"
 */
export function toVietnameseSlug(str) {
  if (!str) return '';

  let slug = str.toString().toLowerCase().trim();

  // Chuyển đổi các ký tự tiếng Việt có dấu thành không dấu
  slug = slug.replace(/á|à|ả|ã|ạ|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/g, 'a');
  slug = slug.replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/g, 'e');
  slug = slug.replace(/í|ì|ỉ|ĩ|ị/g, 'i');
  slug = slug.replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/g, 'o');
  slug = slug.replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/g, 'u');
  slug = slug.replace(/ý|ỳ|ỷ|ỹ|ỵ/g, 'y');
  slug = slug.replace(/đ/g, 'd');

  // Đổi ký tự & thành and
  slug = slug.replace(/&/g, '-and-');

  // Loại bỏ các ký tự không hợp lệ trừ a-z0-9 và dấu gạch ngang
  slug = slug.replace(/[^a-z0-9\s-]/g, '');

  // Đổi khoảng trắng thành dấu gạch ngang và loại bỏ gạch ngang dư thừa
  slug = slug.replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');

  return slug;
}

/**
 * Chi tiết danh mục quản trị GET /api/v1/management/categories/{categoryId} hoặc GET /api/v1/categories/{categoryId}
 * Lấy danh mục bằng API Management dành riêng cho Admin để lấy rowVersion mới nhất (kể cả khi bị INACTIVE)
 */
export async function getCategoryById(categoryId, scope = 'admin') {
  try {
    const { data } = await api.get(`/management/categories/${categoryId}`);
    return unwrapData(data);
  } catch {
    try {
      const params = scope ? { scope } : {};
      const { data } = await api.get(`/categories/${categoryId}`, { params });
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
  const cleanSlug = payload.slug ? toVietnameseSlug(payload.slug) : toVietnameseSlug(name);
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

  // Lấy rowVersion mới nhất từ Server bằng GET /management/categories/{id} nếu chưa có
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

  const name = payload.name?.trim() || '';
  const cleanSlug = payload.slug ? toVietnameseSlug(payload.slug) : toVietnameseSlug(name);

  const body = {
    name,
    slug: cleanSlug || 'danh-muc',
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
