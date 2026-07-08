const CATEGORY_LABELS = ["Điện tử", "Thời trang", "Đồng hồ", "Nghệ thuật", "Khác"];
const PRODUCT_LABELS = [
  "Rolex Submariner",
  "iPhone 16 Pro",
  "Omega Speedmaster",
  "MacBook Pro M3",
  "Pokémon Charizard",
];

const PERIOD_BASE = {
  today: 8,
  week: 45,
  month: 42,
  year: 480,
};

function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

function mulberry32(seed) {
  let state = seed;
  return function next() {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededRatio(seedStr, min, max) {
  const rand = mulberry32(hashString(seedStr));
  return min + rand() * (max - min);
}

function buildBuckets(periodId, selectedDate) {
  const base = new Date(selectedDate);
  const buckets = [];

  if (periodId === "today") {
    for (let hour = 0; hour < 24; hour += 2) {
      buckets.push({ label: `${String(hour).padStart(2, "0")}:00`, key: `h${hour}` });
    }
    return buckets;
  }

  if (periodId === "week") {
    const dayLabels = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(base);
      d.setDate(d.getDate() - i);
      buckets.push({ label: dayLabels[d.getDay()], key: d.toISOString().slice(0, 10) });
    }
    return buckets;
  }

  if (periodId === "month") {
    for (let i = 29; i >= 0; i--) {
      const d = new Date(base);
      d.setDate(d.getDate() - i);
      buckets.push({ label: `${d.getDate()}/${d.getMonth() + 1}`, key: d.toISOString().slice(0, 10) });
    }
    return buckets;
  }

  for (let i = 11; i >= 0; i--) {
    const d = new Date(base);
    d.setMonth(d.getMonth() - i);
    buckets.push({ label: `T${d.getMonth() + 1}`, key: `${d.getFullYear()}-${d.getMonth()}` });
  }
  return buckets;
}

function formatShortAmount(value) {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${Math.round(value / 1_000_000)}M`;
  return `${Math.round(value / 1000)}K`;
}

export function generateRevenueData(selectedDate, periodId) {
  const buckets = buildBuckets(periodId, selectedDate);
  const base = PERIOD_BASE[periodId] ?? PERIOD_BASE.month;

  const trend = buckets.map((b) => {
    const factor = seededRatio(`${selectedDate}|${periodId}|${b.key}`, 0.55, 1.35);
    return { label: b.label, value: Math.round(base * factor * 10) / 10 };
  });

  const grossRevenue = Math.round(trend.reduce((sum, t) => sum + t.value, 0) * 1_000_000);
  const netRevenue = Math.round(grossRevenue * 0.9);
  const commissionFee = Math.round(grossRevenue * 0.07);
  const refundAmount = Math.round(grossRevenue * 0.03);
  const profit = netRevenue - commissionFee - refundAmount;

  const catWeights = CATEGORY_LABELS.map((_, i) =>
    seededRatio(`${selectedDate}|${periodId}|cat${i}`, 0.5, 1.5)
  );
  const catTotal = catWeights.reduce((a, b) => a + b, 0);
  const byCategory = CATEGORY_LABELS.map((label, i) => ({
    label,
    value: Math.round((catWeights[i] / catTotal) * 100),
    amount: formatShortAmount((catWeights[i] / catTotal) * grossRevenue),
  }));

  const byProduct = PRODUCT_LABELS.map((label, i) => ({
    label,
    value: Math.round(seededRatio(`${selectedDate}|${periodId}|prod${i}`, 20, 100)),
  })).sort((a, b) => b.value - a.value);

  return {
    summary: { grossRevenue, netRevenue, commissionFee, refundAmount, profit },
    trend,
    byCategory,
    byProduct,
  };
}
