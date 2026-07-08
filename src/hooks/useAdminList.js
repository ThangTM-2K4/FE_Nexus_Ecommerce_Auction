import { useCallback, useMemo, useState } from "react";

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
        result = result.filter((item) => item[key] === value);
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
