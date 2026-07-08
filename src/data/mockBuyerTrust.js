/** Đổi USE_MOCK_DATA = false để test state rỗng */
export const USE_MOCK_BUYER_TRUST = true;

export const MOCK_BUYER_TRUST = {
  score: 78,
  maxScore: 100,
  level: 'Tốt',
  description:
    'Điểm uy tín phản ánh mức độ tin cậy khi mua hàng và tham gia đấu giá. Điểm cao giúp tăng giới hạn giao dịch và được người bán ưu tiên xử lý đơn.',
};

export const TRUST_LEVELS = [
  { min: 0, max: 39, label: 'Thấp' },
  { min: 40, max: 59, label: 'Trung bình' },
  { min: 60, max: 79, label: 'Khá' },
  { min: 80, max: 100, label: 'Tốt' },
];

export const getTrustLevel = (score, maxScore = 100) => {
  const pct = Math.round((score / maxScore) * 100);
  const found = TRUST_LEVELS.find((l) => pct >= l.min && pct <= l.max);
  return found?.label || 'Trung bình';
};
