import api, { BACKEND_BASE_URL } from '../config/api';
import { unwrapData, unwrapPagedList, getApiErrorMessage } from '../utils/apiResponse';

export { getApiErrorMessage };

const isDev = import.meta.env.DEV;

const logDev = (label, payload) => {
  if (!isDev) return;
  console.info(`[categoryService] ${label}`, payload);
};

/**
 * Backend trả { view: "tree", tree: [...] } hoặc paged list — không đoán, đọc từ response thực.
 */
const extractCategoryNodes = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload.tree)) return payload.tree;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload)) return payload;

  const paged = unwrapPagedList({ data: payload });
  if (Array.isArray(paged.items) && paged.items.length > 0) return paged.items;

  return [];
};

/**
 * Flatten cây danh mục → danh sách chọn (parent + children), id = categoryId UUID.
 */
export function flattenCategoriesForSelect(nodes, depth = 0) {
  const result = [];
  if (!Array.isArray(nodes)) return result;

  nodes.forEach((node) => {
    const id = node.categoryId ?? node.id;
    const name = node.name ?? node.categoryName ?? 'Danh mục';
    const isActive = node.isActive !== false;

    if (id && isActive) {
      const prefix = depth > 0 ? `${'— '.repeat(depth)}` : '';
      result.push({
        id,
        name,
        label: `${prefix}${name}`,
        level: node.level ?? depth + 1,
        slug: node.slug ?? '',
      });
    }

    if (Array.isArray(node.children) && node.children.length > 0) {
      result.push(...flattenCategoriesForSelect(node.children, depth + 1));
    }
  });

  return result;
}

export function toSelectOptions(categories = []) {
  return categories.map((c) => ({ value: c.id, label: c.label }));
}

export function getCategoryLabel(categories = [], categoryId) {
  if (!categoryId) return '';
  return categories.find((c) => c.id === categoryId)?.label ?? '';
}

/**
 * Danh sách category public — GET /categories
 */
export async function getCategories(params = {}) {
  const path = '/categories';
  logDev(`GET ${(BACKEND_BASE_URL || '').replace(/\/$/, '')}${path}`, params);

  try {
    const { data } = await api.get(path, { params, skipErrorRedirect: true });
    const payload = unwrapData(data);
    logDev('response', payload);

    const nodes = extractCategoryNodes(payload);
    const items = flattenCategoriesForSelect(nodes);

    return {
      ok: true,
      items,
      view: payload?.view ?? null,
    };
  } catch (error) {
    logDev('getCategories failed', error?.response?.data ?? error);
    return {
      ok: false,
      items: [],
      error: getApiErrorMessage(error, 'Không tải được danh mục'),
    };
  }
}

/**
 * Chi tiết 1 category — GET /categories/{categoryId}
 */
export async function getCategoryById(categoryId) {
  if (!categoryId) {
    return { ok: false, data: null, error: 'Thiếu categoryId' };
  }

  const path = `/categories/${categoryId}`;
  logDev(`GET ${(BACKEND_BASE_URL || '').replace(/\/$/, '')}${path}`);

  try {
    const { data } = await api.get(path, { skipErrorRedirect: true });
    const payload = unwrapData(data);
    const id = payload?.categoryId ?? payload?.id ?? categoryId;
    const name = payload?.name ?? payload?.categoryName ?? 'Danh mục';

    return {
      ok: true,
      data: { id, name, label: name, ...payload },
    };
  } catch (error) {
    logDev('getCategoryById failed', error?.response?.data ?? error);
    return {
      ok: false,
      data: null,
      error: getApiErrorMessage(error, 'Không tải được danh mục'),
      status: error?.response?.status ?? 0,
    };
  }
}
