const normalize = (value) =>
  String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

/**
 * Tìm categoryId khớp với tag (theo tên danh mục hoặc keyword).
 * @param {Array<{ id: string, name: string, label?: string }>} categories
 * @param {{ search: string, categoryKeywords?: string[] }} tag
 */
export function resolveCategoryIdForTag(categories, tag) {
  if (!Array.isArray(categories) || categories.length === 0) return null;

  const keywords = [
    ...(tag.categoryKeywords || []),
    tag.search,
  ]
    .map(normalize)
    .filter(Boolean);

  for (const cat of categories) {
    const name = normalize(cat.name || cat.label);
    if (!name) continue;
    if (keywords.some((kw) => name.includes(kw) || kw.includes(name))) {
      return cat.id;
    }
  }
  return null;
}

/**
 * @returns {{ pathname: string, search: string }}
 */
export function buildProductListUrl({ search, categoryId }) {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (categoryId) params.set('categoryId', categoryId);
  const qs = params.toString();
  return { pathname: '/products', search: qs ? `?${qs}` : '' };
}

export function navigateProductTag(navigate, categories, tag) {
  const categoryId = resolveCategoryIdForTag(categories, tag);
  if (categoryId) {
    const { pathname, search } = buildProductListUrl({ categoryId });
    navigate(`${pathname}${search}`);
    return;
  }
  const { pathname, search } = buildProductListUrl({ search: tag.search });
  navigate(`${pathname}${search}`);
}
