import { useCallback, useState } from 'react';
import Header from '../../../components/homepage/header';
import Footer from '../../../components/homepage/footer';
import HeroSection from '../../../components/homepage/heroSection';
import CategoryGrid from '../../../components/homepage/categoryGrid';
import ProductGrid from '../../../components/homepage/productGrid';
import { bannerLeftImages, bannerRightImages } from '../../../data/mockBanners';
import { mockCategories } from '../../../data/mockCategories';
import { generateMoreProducts, mockProducts } from '../../../data/mockProducts';
import { useProductNavigate } from '../../../hooks/useProductNavigate';
import './index.scss';

export default function HomePage() {
  const { isAuthenticated, handleProductClick, handleRequireLogin } = useProductNavigate();
  const [extraProducts, setExtraProducts] = useState([]);

  const handleLoadMore = useCallback(() => {
    setExtraProducts((prev) => [
      ...prev,
      ...generateMoreProducts(mockProducts.length + prev.length, 12),
    ]);
  }, []);

  return (
    <>
      <Header />

      <main className="home-page">
        <div className="home-page__shell">
          {/* 1. Banner: slider trái + 2 banner phải */}
          <HeroSection
            leftImages={bannerLeftImages}
            rightImages={bannerRightImages}
            autoPlayInterval={3000}
          />

          {/* 2. Danh mục — grid 10x2, chuyển trang bằng nút › */}
          <CategoryGrid
            categories={mockCategories}
            title="DANH MỤC"
            itemsPerPage={20}
            columns={10}
          />

          {/* 3. Sản phẩm gợi ý — 6 cột, load more / đăng nhập */}
          <ProductGrid
            products={mockProducts}
            extraProducts={extraProducts}
            title="GỢI Ý HÔM NAY"
            columns={6}
            rows={8}
            isLoggedIn={isAuthenticated}
            onLoadMore={handleLoadMore}
            onRequireLogin={handleRequireLogin}
            onProductClick={handleProductClick}
          />
        </div>
      </main>

      <Footer />
    </>
  );
}
