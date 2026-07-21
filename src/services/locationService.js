import { useEffect, useState } from "react";
import { VN_LOCATION_API_URL as BASE } from "../config/endpoints";

// Địa giới hành chính VN mới (2 cấp: Tỉnh/Thành phố → Phường/Xã) từ API thật
// — thay cho mock PROVINCE/DISTRICT cũ.
const PROVINCES_CACHE = "vnProvinces34";
const WARDS_CACHE = (code) => `vnWards34_${code}`;
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 ngày

let provincesMemory = null;
const wardsMemory = new Map();
let provincesInflight = null;

const readCache = (key, ttl = CACHE_TTL) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { at, data } = JSON.parse(raw);
    if (!Array.isArray(data) || Date.now() - at > ttl) return null;
    return data;
  } catch {
    return null;
  }
};

const writeCache = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify({ at: Date.now(), data }));
  } catch {
    /* bỏ qua */
  }
};

// GET /api/provinces → [{ province_code, name }]
export const getProvinces = async () => {
  if (provincesMemory) return provincesMemory;

  const cached = readCache(PROVINCES_CACHE);
  if (cached) {
    provincesMemory = cached;
    return cached;
  }

  if (!provincesInflight) {
    provincesInflight = (async () => {
      const res = await fetch(`${BASE}/provinces`);
      if (!res.ok) throw new Error("Không tải được danh sách tỉnh/thành");
      const json = await res.json();
      const list = (Array.isArray(json) ? json : [])
        .map((p) => ({ value: p.province_code, label: p.name }))
        .sort((a, b) => a.label.localeCompare(b.label, "vi"));
      provincesMemory = list;
      writeCache(PROVINCES_CACHE, list);
      return list;
    })().finally(() => {
      provincesInflight = null;
    });
  }
  return provincesInflight;
};

// GET /api/wards?province_code=XX → [{ ward_code, ward_name, ... }]
export const getWards = async (provinceCode) => {
  if (!provinceCode) return [];
  if (wardsMemory.has(provinceCode)) return wardsMemory.get(provinceCode);

  const cached = readCache(WARDS_CACHE(provinceCode));
  if (cached) {
    wardsMemory.set(provinceCode, cached);
    return cached;
  }

  const res = await fetch(`${BASE}/wards?province_code=${encodeURIComponent(provinceCode)}`);
  if (!res.ok) throw new Error("Không tải được danh sách phường/xã");
  const json = await res.json();
  const list = (Array.isArray(json) ? json : [])
    .map((w) => ({ value: w.ward_code, label: w.ward_name }))
    .sort((a, b) => a.label.localeCompare(b.label, "vi"));
  wardsMemory.set(provinceCode, list);
  writeCache(WARDS_CACHE(provinceCode), list);
  return list;
};

// Hook: danh sách tỉnh/thành
export function useProvinces() {
  const [provinces, setProvinces] = useState(() => provincesMemory || []);
  const [loading, setLoading] = useState(!provincesMemory);

  useEffect(() => {
    let alive = true;
    getProvinces()
      .then((list) => alive && (setProvinces(list), setLoading(false)))
      .catch(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  return { provinces, loading };
}

// Hook: danh sách phường/xã theo tỉnh đã chọn
export function useWards(provinceCode) {
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!provinceCode) {
      setWards([]);
      return;
    }
    let alive = true;
    setLoading(true);
    getWards(provinceCode)
      .then((list) => alive && (setWards(list), setLoading(false)))
      .catch(() => alive && (setWards([]), setLoading(false)));
    return () => {
      alive = false;
    };
  }, [provinceCode]);

  return { wards, loading };
}
