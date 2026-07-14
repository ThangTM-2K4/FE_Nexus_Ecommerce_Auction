// Quy tắc & tính độ mạnh mật khẩu, dùng chung cho trang Đăng ký / Đặt lại mật khẩu.

// Danh sách yêu cầu, mỗi mục có hàm test riêng để hiển thị checklist.
export const PASSWORD_RULES = [
  { key: "length", label: "Tối thiểu 8 ký tự", test: (v) => v.length >= 8 },
  {
    key: "case",
    label: "Có chữ viết hoa và viết thường",
    test: (v) => /[a-z]/.test(v) && /[A-Z]/.test(v),
  },
  { key: "number", label: "Có ít nhất 1 chữ số", test: (v) => /\d/.test(v) },
  {
    key: "symbol",
    label: "Có ít nhất 1 ký tự đặc biệt",
    test: (v) => /[^A-Za-z0-9]/.test(v),
  },
];

// Trả về mảng key của các quy tắc đã đạt.
export const getPassedRules = (password = "") =>
  PASSWORD_RULES.filter((rule) => rule.test(password)).map((rule) => rule.key);

// Mật khẩu hợp lệ khi đạt toàn bộ quy tắc.
export const isPasswordValid = (password = "") =>
  getPassedRules(password).length === PASSWORD_RULES.length;

// Mức độ mạnh dựa trên số quy tắc đạt được (0 → 4).
// Trả về nhãn tiếng Việt + màu + phần trăm để vẽ thanh tiến độ.
export const getPasswordStrength = (password = "") => {
  const score = getPassedRules(password).length;
  const levels = [
    { label: "", color: "#e5e7eb" },
    { label: "Rất yếu", color: "#ef4444" },
    { label: "Yếu", color: "#f97316" },
    { label: "Khá", color: "#eab308" },
    { label: "Rất mạnh", color: "#22c55e" },
  ];
  return {
    score,
    percent: (score / PASSWORD_RULES.length) * 100,
    label: levels[score].label,
    color: levels[score].color,
  };
};
