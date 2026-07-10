export const displayValue = (value) => {
  if (value == null || value === "") return "—";
  if (typeof value === "boolean") return value ? "Có" : "Không";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "—";
  return String(value);
};

export const formatDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("vi-VN");
};

export const normalizeEnum = (value) => String(value ?? "").trim().toUpperCase();
