const maskName = (name) => {
  if (name.length <= 3) return `${name[0]}***`;
  return `${name.slice(0, 2)}***${name.slice(-1)}`;
};

export const mockReviews = [
  {
    id: 'r1',
    userName: 'Nguyễn Văn A',
    avatar: '/images/avatars/avatar-1.jpg',
    rating: 5,
    date: '2025-06-12',
    variant: 'Đen',
    content: 'Tai nghe đẹp, chống ồn tốt, giao hàng nhanh. Đóng gói cẩn thận, shop tư vấn nhiệt tình.',
    images: [
      '/images/products/electronics/iphone.jpg',
      '/images/products/electronics/macbook.jpg',
    ],
    helpful: 42,
    hasMedia: true,
  },
  {
    id: 'r2',
    userName: 'Trần Thị B',
    avatar: '/images/avatars/avatar-2.jpg',
    rating: 4,
    date: '2025-06-08',
    variant: 'Trắng',
    content: 'Pin ổn, âm thanh trong, bass vừa phải. Hơi chật tai nếu đeo lâu.',
    images: [],
    helpful: 18,
    hasMedia: false,
  },
  {
    id: 'r3',
    userName: 'Lê Minh C',
    avatar: '/images/avatars/avatar-3.jpg',
    rating: 5,
    date: '2025-05-30',
    variant: 'Hồng',
    content: 'Màu hồng xinh, đúng mô tả. Rất hài lòng với chất lượng sản phẩm.',
    images: ['/images/products/electronics/ipad.jpg'],
    helpful: 27,
    hasMedia: true,
  },
  {
    id: 'r4',
    userName: 'Phạm Thu D',
    avatar: '/images/avatars/avatar-4.jpg',
    rating: 3,
    date: '2025-05-22',
    variant: 'Xanh Navy',
    content: 'Ổn trong tầm giá, micro hơi nhỏ khi gọi ngoài trời.',
    images: [],
    helpful: 5,
    hasMedia: false,
  },
  {
    id: 'r5',
    userName: 'Hoàng E',
    avatar: '/images/avatars/avatar-5.jpg',
    rating: 5,
    date: '2025-05-15',
    variant: 'Đen',
    content: 'Mua lần 2 rồi, recommend shop này. Freeship nhanh.',
    images: ['/images/products/electronics/iphone.jpg'],
    helpful: 11,
    hasMedia: true,
  },
];

export const getReviewSummary = (reviews) => {
  const total = reviews.length;
  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / total;
  const byStar = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  return {
    average: avg.toFixed(1),
    total,
    withComment: reviews.filter((r) => r.content?.length > 0).length,
    withMedia: reviews.filter((r) => r.hasMedia).length,
    byStar,
  };
};

export { maskName };
