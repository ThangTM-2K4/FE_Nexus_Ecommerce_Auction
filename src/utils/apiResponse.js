export const unwrapData = (payload) => {
  if (payload == null) return null;
  if (typeof payload !== "object") return payload;
  if (payload.data !== undefined) return payload.data;
  if (payload.result !== undefined) return payload.result;
  return payload;
};

export const unwrapPagedList = (payload) => {
  const data = unwrapData(payload);

  if (Array.isArray(data)) {
    return { items: data, total: data.length, page: 1, pageSize: data.length || 20 };
  }

  const items = data?.items ?? data?.results ?? data?.content ?? data?.data ?? [];
  return {
    items: Array.isArray(items) ? items : [],
    total: data?.totalCount ?? data?.total ?? data?.count ?? (Array.isArray(items) ? items.length : 0),
    page: data?.page ?? data?.pageNumber ?? 1,
    pageSize: data?.pageSize ?? data?.limit ?? 20,
  };
};

export const getApiErrorMessage = (error, fallback = "Đã xảy ra lỗi, vui lòng thử lại") => {
  const data = error?.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  if (data?.message) return data.message;
  if (data?.error) return data.error;
  if (Array.isArray(data?.errors) && data.errors[0]?.message) return data.errors[0].message;
  return error?.message || fallback;
};

