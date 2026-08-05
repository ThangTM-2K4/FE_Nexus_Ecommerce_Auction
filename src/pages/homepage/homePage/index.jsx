import { useCallback, useEffect, useState } from 'react';
import Header from '../../../components/homepage/header';
import Footer from '../../../components/homepage/footer';
import HeroSection from '../../../components/homepage/heroSection';
import CategoryGrid from '../../../components/homepage/categoryGrid';
import ProductGrid from '../../../components/homepage/productGrid';
import { bannerLeftImages, bannerRightImages } from '../../../data/mockBanners';
import { mockCategories } from '../../../data/mockCategories';
import { getCategoryTree, mapProductListItem } from '../../../services/catalogService';
import { getProducts } from '../../../services/ecommerceProductService';
import { useProductNavigate } from '../../../hooks/useProductNavigate';
import './index.scss';

const INITIAL_PAGE_SIZE = 48;
const LOAD_MORE_SIZE = 12;

export default function HomePage() {
  const { handleProductClick } = useProductNavigate();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [extraProducts, setExtraProducts] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadInitial() {
      setLoading(true);
      setLoadError(null);

      const [categoryResult, productResult] = await Promise.all([
        getCategoryTree().catch(() => mockCategories),
        getProducts({ pageNumber: 1, pageSize: INITIAL_PAGE_SIZE }),
      ]);

      if (cancelled) return;

      setCategories(Array.isArray(categoryResult) && categoryResult.length ? categoryResult : mockCategories);

      if (productResult.ok) {
        setProducts((productResult.items || []).map(mapProductListItem).filter(Boolean));
      } else {
        setProducts([]);
        setLoadError(productResult.error || 'Không tải được sản phẩm');
      }

      setLoading(false);
    }

    loadInitial();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLoadMore = useCallback(async () => {
    const nextPage = pageNumber + 1;
    const res = await getProducts({ pageNumber: nextPage, pageSize: LOAD_MORE_SIZE });

    if (res.ok) {
      setExtraProducts((prev) => [
        ...prev,
        ...(res.items || []).map(mapProductListItem).filter(Boolean),
      ]);
      setPageNumber(nextPage);
    }
  }, [pageNumber]);

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
          ) : loadError && products.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '2rem 0', color: '#666' }}>
              {loadError}. Vui lòng thử lại sau.
            </p>
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
