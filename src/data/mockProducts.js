const IMAGES = [
  '/images/products/electronics/iphone.jpg',
  '/images/products/electronics/macbook.jpg',
  '/images/products/electronics/ipad.jpg',
  '/images/products/watches/rolex.jpg',
  '/images/products/watches/rolex-datejust.jpg',
  '/images/products/watches/omega.jpg',
  '/images/products/watches/patek-1.jpg',
  '/images/products/watches/patek-2.jpg',
  '/images/products/watches/patek-3.jpg',
  '/images/products/watches/patek-4.jpg',
  '/images/products/watches/patek-5.jpg',
  '/images/products/collectibles/leica.jpg',
  '/images/products/collectibles/pokemon.jpg',
  '/images/products/artworks/painting.jpg',
];

const TITLES = [
  'Tai nghe Bluetooth chống ồn chủ động Pro Max',
  'Áo thun nam cotton 100% form regular',
  'Kem dưỡng ẩm hoa hồng Hàn Quốc 50ml',
  'Balo laptop chống nước 15.6 inch',
  'Đồng hồ thông minh theo dõi sức khỏe',
  'Son môi Romand Juicy Lasting Tint',
  'Giày sneaker unisex đế cao su',
  'Máy lọc không khí mini cho phòng ngủ',
  'Ốp lưng iPhone chống sốc trong suốt',
  'Nước hoa unisex EDP 100ml',
  'Bình giữ nhiệt inox 500ml',
  'Đèn bàn học LED chống cận',
  'Túi tote canvas in hình cute',
  'Cốc sứ uống trà có nắp',
  'Bộ sticker trang trí laptop 100 miếng',
];

const TAG_POOL = [
  ['7.7'],
  ['Mall'],
  ['7.7', 'Yêu thích+'],
  ['Rẻ Vô Địch'],
  ['Mall', 'Yêu thích+'],
  [],
  ['7.7', 'Rẻ Vô Địch'],
];

const DISCOUNTS = [18, 36, 45, 12, 28, 50, 22, null, 15, 33];
const PRICES = [89000, 159000, 245000, 320000, 499000, 75000, 129000, 890000, 45000, 3200000];
const SOLD = ['150k+', '25k+', '3k+', '99+', '7k+', '45k+', '12k+', '200k+', '8k+', '1k+'];

export function getApprovedProductsForHome() {
  try {
    const raw = localStorage.getItem("seller_created_products") || "[]";
    const list = JSON.parse(raw);
    return list
      .filter((p) => {
        const mod = String(p.moderationStatus || "").toUpperCase();
        const st = String(p.status || "").toUpperCase();
        return mod === "APPROVED" || st === "APPROVED" || st === "ACTIVE" || st === "PUBLISHED";
      })
      .map((p, i) => {
        const imgSrc =
          (typeof p.images?.[0] === "string" ? p.images[0] : p.images?.[0]?.url) ||
          (typeof p.image === "string" ? p.image : p.image?.url) ||
          p.imageUrl ||
          IMAGES[i % IMAGES.length];
        return {
          id: p.id || `p-approved-${i}`,
          image: imgSrc,
          images: p.images || [imgSrc],
          title: p.name || p.title || "Sản phẩm mới",
          price: Number(p.price || 0),
          discountPercent: 0,
          soldCount: "0 đã bán",
          tags: ["Hàng Mới", "Shopee Mall"],
          stock: Number(p.stockQuantity ?? p.stock ?? 0),
        };
      });
  } catch {
    return [];
  }
}

/** 60 sản phẩm mock + sản phẩm đã duyệt — hiển thị 48/lần, load more thêm 12 */
export const baseMockProducts = Array.from({ length: 60 }, (_, i) => {
  const price = PRICES[i % PRICES.length];
  const discountPercent = DISCOUNTS[i % DISCOUNTS.length];

  return {
    id: `p-${i + 1}`,
    image: IMAGES[i % IMAGES.length],
    title: `${TITLES[i % TITLES.length]} #${i + 1}`,
    price,
    discountPercent,
    soldCount: SOLD[i % SOLD.length],
    tags: TAG_POOL[i % TAG_POOL.length],
  };
});

export const mockProducts = [...getApprovedProductsForHome(), ...baseMockProducts];

/** Tạo thêm batch sản phẩm giả khi load more */
export const generateMoreProducts = (startIndex, count = 12) =>
  Array.from({ length: count }, (_, offset) => {
    const i = startIndex + offset;
    const price = PRICES[i % PRICES.length];
    const discountPercent = DISCOUNTS[i % DISCOUNTS.length];

    return {
      id: `p-extra-${i + 1}`,
      image: IMAGES[i % IMAGES.length],
      title: `${TITLES[i % TITLES.length]} (mới) #${i + 1}`,
      price,
      discountPercent,
      soldCount: SOLD[i % SOLD.length],
      tags: TAG_POOL[i % TAG_POOL.length],
    };
  });
