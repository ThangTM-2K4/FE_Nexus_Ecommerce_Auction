import { useEffect, useState } from "react";

// Danh sách ngân hàng lấy từ API thật VietQR (thay cho mock BANK_OPTIONS cũ).
// https://api.vietqr.io/v2/banks
const VIETQR_BANKS_URL = "https://api.vietqr.io/v2/banks";
const CACHE_KEY = "vietqrBanks";
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24h

let memoryCache = null; // [{ value, label, code, bin, shortName, name, logo }]
let inflight = null;

const normalizeBank = (b) => ({
  value: b.code, // dùng mã ngân hàng làm value (VCB, TCB...)
  label: b.shortName || b.short_name || b.name,
  code: b.code,
  bin: b.bin,
  shortName: b.shortName || b.short_name || b.name,
  name: b.name,
  logo: b.logo || "",
});

const readCache = () => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { at, banks } = JSON.parse(raw);
    if (!Array.isArray(banks) || Date.now() - at > CACHE_TTL) return null;
    return banks;
  } catch {
    return null;
  }
};

const writeCache = (banks) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), banks }));
  } catch {
    /* localStorage đầy → bỏ qua */
  }
};

// Lấy danh sách ngân hàng (memory → localStorage → API). Trả về mảng đã chuẩn hoá.
export const getBanks = async () => {
  if (memoryCache) return memoryCache;

  const cached = readCache();
  if (cached) {
    memoryCache = cached;
    return cached;
  }

  if (!inflight) {
    inflight = (async () => {
      const res = await fetch(VIETQR_BANKS_URL);
      if (!res.ok) throw new Error("Không tải được danh sách ngân hàng");
      const json = await res.json();
      const banks = (json?.data || []).map(normalizeBank);
      memoryCache = banks;
      writeCache(banks);
      return banks;
    })().finally(() => {
      inflight = null;
    });
  }
  return inflight;
};

// Đồng bộ: đọc nhãn ngân hàng từ cache (nếu đã tải). Không có → trả nguyên value.
export const resolveBankLabel = (bankValue) => {
  if (!bankValue) return "";
  const list = memoryCache || readCache() || [];
  const found = list.find(
    (b) => b.value === bankValue || b.code === bankValue || b.shortName === bankValue || b.name === bankValue
  );
  return found ? found.label : bankValue;
};

// Hook tiện dùng trong component: trả { banks, loading, error }.
export function useBanks() {
  const [banks, setBanks] = useState(() => memoryCache || readCache() || []);
  const [loading, setLoading] = useState(!banks.length);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    if (banks.length) {
      setLoading(false);
      return;
    }
    getBanks()
      .then((list) => {
        if (alive) {
          setBanks(list);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (alive) {
          setError(err);
          setLoading(false);
        }
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { banks, loading, error };
}
