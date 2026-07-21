/**
 * Tập trung toàn bộ URL/endpoint bên ngoài vào 1 chỗ, đọc từ biến môi trường.
 *
 * LƯU Ý QUAN TRỌNG: Vite nhúng thẳng các biến VITE_* vào bundle JS lúc build.
 * Người dùng MỞ DEVTOOLS LÀ THẤY. Đây KHÔNG phải cơ chế bảo mật — nó chỉ giúp
 * đổi cấu hình giữa dev/staging/prod mà không phải sửa code.
 * Tuyệt đối không đặt secret (API key, token, DB password...) vào đây.
 */

const required = (key, value) => {
  if (!value) {
    console.warn(`[config] Thiếu biến môi trường ${key} — kiểm tra file .env`);
  }
  return value;
};

// API Gateway chính của hệ thống
export const API_BASE_URL = required('VITE_API_BASE_URL', import.meta.env.VITE_API_BASE_URL);

// OAuth Google (backend redirect)
export const GOOGLE_LOGIN_URL = required(
  'VITE_GOOGLE_LOGIN_URL',
  import.meta.env.VITE_GOOGLE_LOGIN_URL
);

// Danh sách ngân hàng — VietQR
export const VIETQR_BANKS_URL = required(
  'VITE_VIETQR_BANKS_URL',
  import.meta.env.VITE_VIETQR_BANKS_URL
);

// Địa giới hành chính VN (2 cấp: Tỉnh/Thành phố → Phường/Xã)
export const VN_LOCATION_API_URL = required(
  'VITE_VN_LOCATION_API_URL',
  import.meta.env.VITE_VN_LOCATION_API_URL
);
