// Lightweight client-side CSV export.
// Builds a UTF-8 (BOM) CSV from an array of rows and triggers a download.
// Used by Đơn hàng / Quản lý vận chuyển / Báo cáo để "xuất file".

function escapeCell(value) {
  const str = value == null ? "" : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * @param {string} filename  e.g. "don-hang-2026-07-08.csv"
 * @param {string[]} headers column titles
 * @param {Array<Array<string|number>>} rows
 */
export function exportCsv(filename, headers, rows) {
  const lines = [headers, ...rows].map((row) => row.map(escapeCell).join(","));
  // BOM so Excel opens Vietnamese characters correctly.
  const csv = "﻿" + lines.join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function todayStamp() {
  return new Date().toISOString().slice(0, 10);
}
