export const RANK_LABELS_VN = {
  Silver: 'Đồng',
  Gold: 'Bạc',
  Platinum: 'Vàng',
  Diamond: 'Kim Cương',
};

export const getRankLabelVn = (rank) => RANK_LABELS_VN[rank] || rank;

export const RANK_CLASS = {
  Silver: 'rank-silver',
  Gold: 'rank-gold',
  Platinum: 'rank-platinum',
  Diamond: 'rank-diamond',
};
