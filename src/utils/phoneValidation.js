/**
 * Kiểm tra số điện thoại Việt Nam hợp lệ:
 * - 10 chữ số bắt đầu bằng 0 (ví dụ: 0912345678)
 * - 11 chữ số bắt đầu bằng 84 (ví dụ: 84912345678)
 */
export function isValidVietnamesePhone(phone) {
  if (!phone) return false;
  const cleanPhone = String(phone).trim().replace(/[\s\-\.]/g, "");
  return /^(0\d{9}|84\d{9})$/.test(cleanPhone);
}
