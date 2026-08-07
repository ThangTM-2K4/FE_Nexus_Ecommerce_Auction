import { useCallback, useMemo, useState } from "react";

const matchesValue = (itemVal, filterVal) => {
  if (itemVal === filterVal) return true;
  if (!itemVal || !filterVal) return false;
  
  const normItem = String(itemVal).toLowerCase();
  const normFilter = String(filterVal).toLowerCase();
  
  if (normItem === normFilter) return true;
  
  if (normFilter === "hoạt động" || normFilter === "active" || normFilter === "approved") {
    return normItem === "active" || normItem === "approved" || normItem === "hoạt động";
  }
  
  if (normFilter === "chờ duyệt" || normFilter === "pending" || normFilter === "draft" || normFilter === "bản nháp") {
    return normItem.includes("chờ") || normItem.includes("pending") || normItem.includes("draft") || normItem.includes("nháp") || normItem.includes("submit");
  }

  if (normFilter === "tắt" || normFilter === "ẩn" || normFilter === "inactive") {
    return normItem === "tắt" || normItem === "ẩn" || normItem === "inactive";
  }

  if (normFilter === "đã khóa" || normFilter === "tạm khóa" || normFilter === "locked" || normFilter === "suspended") {
    return normItem.includes("khóa") || normItem.includes("lock") || normItem.includes("suspend");
  }
  
  return normItem.includes(normFilter) || normFilter.includes(normItem);
};

export const useAdminList = (initialData, searchKeys = []) => {
  const [items, setItems] = useState(initialData);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState({});

  const filtered = useMemo(() => {
    let result = [...items];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((item) =>
        searchKeys.some((key) =>
          String(item[key] ?? "").toLowerCase().includes(q)
        )
      );
    }

    Object.entries(filter).forEach(([key, value]) => {
      if (value) {
        result = result.filter((item) => matchesValue(item[key], value));
      }
    });

    return result;
  }, [items, search, filter, searchKeys]);

  const updateItem = useCallback((id, updates, idKey = "id") => {
    setItems((prev) =>
      prev.map((item) => (item[idKey] === id ? { ...item, ...updates } : item))
    );
  }, []);

  const removeItem = useCallback((id, idKey = "id") => {
    setItems((prev) => prev.filter((item) => item[idKey] !== id));
  }, []);

  const addItem = useCallback((item) => {
    setItems((prev) => [item, ...prev]);
  }, []);

  const setFilterValue = useCallback((key, value) => {
    setFilter((prev) => ({ ...prev, [key]: value }));
  }, []);

  return {
    items,
    filtered,
    search,
    setSearch,
    filter,
    setFilterValue,
    updateItem,
    removeItem,
    addItem,
    setItems,
  };
};
