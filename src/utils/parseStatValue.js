export function parseStatValue(value) {
  if (typeof value === "number") {
    if (value >= 1000000) {
      return { num: value, type: "currency" };
    }
    if (!Number.isInteger(value)) {
      return { num: value, type: "decimal", decimals: 1 };
    }
    return { num: value, type: "number", useLocale: true };
  }

  const str = String(value).trim();

  if (str.includes("%")) {
    const num = parseFloat(str.replace("%", "").replace(",", "."));
    return { num: Number.isNaN(num) ? 0 : num, type: "percent", decimals: 1 };
  }

  if (str.includes("đ")) {
    const num = parseInt(str.replace(/[^\d]/g, ""), 10);
    return { num: Number.isNaN(num) ? 0 : num, type: "currency" };
  }

  const plain = str.replace(/\./g, "").replace(/,/g, "");
  const num = parseFloat(plain);
  if (!Number.isNaN(num)) {
    return { num, type: "number", useLocale: str.includes(".") || str.includes(",") };
  }

  return { num: 0, type: "text", fallback: str };
}

export function formatAnimatedValue(parsed, current) {
  if (parsed.type === "text") return parsed.fallback;

  if (parsed.type === "percent") {
    return `${current.toFixed(parsed.decimals ?? 1)}%`;
  }

  if (parsed.type === "decimal") {
    return current.toFixed(parsed.decimals ?? 1);
  }

  if (parsed.type === "currency") {
    return `${new Intl.NumberFormat("vi-VN").format(Math.round(current))}đ`;
  }

  if (parsed.useLocale) {
    return new Intl.NumberFormat("vi-VN").format(Math.round(current));
  }

  return String(Math.round(current));
}
