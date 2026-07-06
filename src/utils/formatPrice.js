/** Format giá VND: 1.250.000₫ */
export const formatPrice = (value) =>
  `${new Intl.NumberFormat('vi-VN').format(value)}₫`;
