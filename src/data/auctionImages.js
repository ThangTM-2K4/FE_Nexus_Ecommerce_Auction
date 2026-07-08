const AVATAR = "/images/avatars";
const BANNER = "/images/banners";
const CATEGORY = "/images/categories";
const WATCH = "/images/products/watches";
const ELECTRONIC = "/images/products/electronics";
const COLLECTIBLE = "/images/products/collectibles";
const ARTWORK = "/images/products/artworks";
const COMMON = "/images/common";

export const auctionImages = {
  // Banner
  hero: `${BANNER}/hero.jpg`,
  createBg: `${BANNER}/create-bg.jpg`,

  // Avatar
  avatars: {
    main: `${AVATAR}/avatar-main.jpg`,

    review1: `${AVATAR}/avatar-1.jpg`,
    review2: `${AVATAR}/avatar-2.jpg`,
    review3: `${AVATAR}/avatar-3.jpg`,

    bidder1: `${AVATAR}/avatar-4.jpg`,
    bidder2: `${AVATAR}/avatar-5.jpg`,
    bidder3: `${AVATAR}/avatar-6.jpg`,

    // Added for compatibility with sellerMockData.js
    bidder4: `${AVATAR}/avatar-4.jpg`,
    bidder5: `${AVATAR}/avatar-5.jpg`,
    bidder6: `${AVATAR}/avatar-6.jpg`,

    seller: `${AVATAR}/avatar-seller.jpg`,
  },

  // Products
  products: {
    // Watches
    rolexSub: `${WATCH}/rolex.jpg`,
    rolexDatejust: `${WATCH}/rolex-datejust.jpg`,
    omega: `${WATCH}/omega.jpg`,
    patek1: `${WATCH}/patek-1.jpg`,
    patek2: `${WATCH}/patek-2.jpg`,
    patek3: `${WATCH}/patek-3.jpg`,
    patek4: `${WATCH}/patek-4.jpg`,
    patek5: `${WATCH}/patek-5.jpg`,

    // Electronics
    iphone: `${ELECTRONIC}/iphone.jpg`,
    ipad: `${ELECTRONIC}/ipad.jpg`,
    macbook: `${ELECTRONIC}/macbook.jpg`,

    // Collectibles
    pokemon: `${COLLECTIBLE}/pokemon.jpg`,
    leica: `${COLLECTIBLE}/leica.jpg`,

    // Artworks
    painting: `${ARTWORK}/painting.jpg`,
  },

  // Categories
  categories: {
    art: `${CATEGORY}/cat-art.jpg`,
    tech: `${CATEGORY}/cat-tech.jpg`,
    fashion: `${CATEGORY}/cat-fashion.jpg`,
    car: `${CATEGORY}/cat-car.jpg`,
  },

  // Fallback
  fallback: `${COMMON}/fallback.jpg`,
};