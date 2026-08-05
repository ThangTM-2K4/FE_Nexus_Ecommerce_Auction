import { useCallback, useEffect, useState } from 'react';
import Header from '../../../components/homepage/header';
import Footer from '../../../components/homepage/footer';
import HeroSection from '../../../components/homepage/heroSection';
import CategoryGrid from '../../../components/homepage/categoryGrid';
import ProductGrid from '../../../components/homepage/productGrid';
import { bannerLeftImages, bannerRightImages } from '../../../data/mockBanners';
import { mockCategories } from '../../../data/mockCategories';
import { getCategoryTree, getHomeProductDiscovery } from '../../../services/catalogService';
import { useProductNavigate } from '../../../hooks/useProductNavigate';
import './index.scss';

const INITIAL_PAGE_SIZE = 48;
const LOAD_MORE_SIZE = 12;

export default function HomePage() {
  const { handleProductClick } = useProductNavigate();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [extraProducts, setExtraProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadInitial() {
      setLoading(true);
      try {
        const [categoryData, productData] = await Promise.all([
          getCategoryTree().catch(() => mockCategories),
          getHomeProductDiscovery({ page: 1, pageSize: INITIAL_PAGE_SIZE }).catch(() => ({ items: [] })),
        ]);
        if (cancelled) return;
        setCategories(categoryData.length ? categoryData : mockCategories);
        setProducts(productData.items || []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadInitial();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLoadMore = useCallback(async () => {
    const nextPage = page + 1;
    try {
      const res = await getHomeProductDiscovery({ page: nextPage, pageSize: LOAD_MORE_SIZE });
      setExtraProducts((prev) => [...prev, ...(res.items || [])]);
      setPage(nextPage);
    } catch {
      /* giữ nguyên danh sách hiện có */
    }
  }, [page]);

  return (
    <>
      <Header />

      <main className="home-page">
        <div className="home-page__shell">
          <HeroSection
            leftImages={bannerLeftImages}
            rightImages={bannerRightImages}
            autoPlayInterval={3000}
          />

          <CategoryGrid
            categories={categories.length ? categories : mockCategories}
            title="DANH MỤC NỔI BẬT"
          />

          {loading ? (
            <p style={{ textAlign: 'center', padding: '2rem 0' }}>Đang tải sản phẩm...</p>
          ) : (
            <ProductGrid
              products={products}
              extraProducts={extraProducts}
              title="GỢI Ý HÔM NAY"
              columns={6}
              rows={8}
              onLoadMore={handleLoadMore}
              onProductClick={handleProductClick}
            />
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
