/**
 * Màu thương hiệu ngân hàng.
 *
 * VietQR (/v2/banks) chỉ trả logo + tên, KHÔNG có màu thương hiệu — nên map này
 * là màu tra tay cho các ngân hàng phổ biến ở VN. Ngân hàng không có trong map
 * sẽ rơi vào fallback sinh màu theo mã (ổn định, không đổi mỗi lần render).
 *
 * Key = `code` của VietQR (VCB, ICB, TCB...).
 */
const BANK_BRAND = {
  VCB: ['#0a6b3d', '#03301b'], // Vietcombank
  ICB: ['#0072bc', '#004a7c'], // VietinBank
  BIDV: ['#005baa', '#00a94f'],
  VBA: ['#a8272c', '#6d1418'], // Agribank
  TCB: ['#ec1c24', '#8c0d12'], // Techcombank
  MB: ['#1a3668', '#0066b3'], // MBBank
  ACB: ['#003da5', '#001f54'],
  VPB: ['#00b74f', '#00612a'], // VPBank
  TPB: ['#6a1b9a', '#3a0d55'], // TPBank
  STB: ['#0066b3', '#00365f'], // Sacombank
  HDB: ['#e30613', '#f58220'], // HDBank
  SHB: ['#005baa', '#002f57'],
  EIB: ['#1b4f9c', '#0d2850'], // Eximbank
  MSB: ['#e4002b', '#7a0017'],
  OCB: ['#007a3e', '#004022'],
  SCB: ['#00539f', '#002a52'],
  VIB: ['#0066b3', '#003a66'],
  CAKE: ['#e4007c', '#7a0043'],
  VCCB: ['#0f4c9a', '#082a55'], // VietCapitalBank / BVBank
};

const FALLBACK = ['#B35A8A', '#523F77']; // raspberry → indigo (theo palette chung)

/** Sinh cặp màu ổn định từ mã ngân hàng khi không có trong map. */
const hashHue = (code) => {
  let h = 0;
  for (let i = 0; i < code.length; i += 1) h = (h * 31 + code.charCodeAt(i)) % 360;
  return h;
};

/** Trả [màu đậm, màu nhạt] để dựng gradient nền cho ngân hàng. */
export const getBankBrand = (code) => {
  if (!code) return FALLBACK;
  const hit = BANK_BRAND[String(code).toUpperCase()];
  if (hit) return hit;
  const hue = hashHue(String(code).toUpperCase());
  return [`hsl(${hue} 58% 38%)`, `hsl(${(hue + 32) % 360} 62% 22%)`];
};

export const getBankGradient = (code) => {
  const [a, b] = getBankBrand(code);
  return `linear-gradient(135deg, ${a} 0%, ${b} 100%)`;
};
