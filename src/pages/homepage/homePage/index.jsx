import { useCallback, useEffect, useState, useMemo } from 'react';
import Header from '../../../components/homepage/header';
import Footer from '../../../components/homepage/footer';
import HeroSection from '../../../components/homepage/heroSection';
import CategoryGrid from '../../../components/homepage/categoryGrid';
import ProductGrid from '../../../components/homepage/productGrid';
import { bannerLeftImages, bannerRightImages } from '../../../data/mockBanners';
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
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadInitial() {
      setLoading(true);
      setLoadError(null);

      const [categoryResult, productResult] = await Promise.all([
        getCategoryTree().catch(() => []),
        getProducts({ pageNumber: 1, pageSize: INITIAL_PAGE_SIZE }),
      ]);

      if (cancelled) return;

      setCategories(Array.isArray(categoryResult) ? categoryResult : []);

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

  const handleSelectCategory = useCallback(async (cat) => {
    setSelectedCategory(cat);
    setLoading(true);
    setLoadError(null);
    try {
      const res = await getProducts({ categoryId: cat.id, pageSize: INITIAL_PAGE_SIZE });
      if (res.ok) {
        setProducts((res.items || []).map(mapProductListItem).filter(Boolean));
      } else {
        setProducts([]);
      }
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }

    const el = document.getElementById('product-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const handleResetCategory = useCallback(async () => {
    setSelectedCategory(null);
    setLoading(true);
    setLoadError(null);
    const res = await getProducts({ pageNumber: 1, pageSize: INITIAL_PAGE_SIZE });
    if (res.ok) {
      setProducts((res.items || []).map(mapProductListItem).filter(Boolean));
    }
    setLoading(false);
  }, []);

  const handleLoadMore = useCallback(async () => {
    const nextPage = pageNumber + 1;
    const params = { pageNumber: nextPage, pageSize: LOAD_MORE_SIZE };
    if (selectedCategory?.id) {
      params.categoryId = selectedCategory.id;
    }
    const res = await getProducts(params);

    if (res.ok) {
      setExtraProducts((prev) => [
        ...prev,
        ...(res.items || []).map(mapProductListItem).filter(Boolean),
      ]);
      setPageNumber(nextPage);
    }
  }, [pageNumber, selectedCategory]);

  const categoriesWithClick = useMemo(() => {
    return categories.map((cat) => ({
      ...cat,
      onClick: () => handleSelectCategory(cat),
    }));
  }, [categories, handleSelectCategory]);

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
            categories={categoriesWithClick}
            title="DANH MỤC NỔI BẬT"
          />

          <div id="product-section">
            {selectedCategory && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '20px 0 10px 0', padding: '10px 16px', background: '#f8f4ff', borderRadius: '8px', border: '1px solid #e2d5f7' }}>
                <span style={{ fontSize: '15px', color: '#5b21b6', fontWeight: 600 }}>
                  📂 Đang lọc theo danh mục: <strong>{selectedCategory.name}</strong>
                </span>
                <button
                  type="button"
                  onClick={handleResetCategory}
                  style={{ background: '#7c3aed', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
                >
                  ✕ Xem tất cả sản phẩm
                </button>
              </div>
            )}

            {loading ? (
              <p style={{ textAlign: 'center', padding: '3rem 0', color: '#666', fontSize: '15px' }}>⏳ Đang tải sản phẩm từ hệ thống...</p>
            ) : products.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#fafafa', borderRadius: '12px', margin: '20px 0', border: '1px dashed #d9d9d9' }}>
                <div style={{ fontSize: '42px', marginBottom: '12px' }}>📦</div>
                <h4 style={{ fontSize: '16px', color: '#333', marginBottom: '8px', fontWeight: 600 }}>
                  Chưa có sản phẩm nào thuộc danh mục "{selectedCategory?.name || 'này'}"
                </h4>
                <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
                  Vui lòng chọn danh mục khác hoặc xem toàn bộ danh sách sản phẩm trên hệ thống.
                </p>
                <button
                  type="button"
                  onClick={handleResetCategory}
                  style={{ background: '#7c3aed', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}
                >
                  Xem tất cả sản phẩm toàn sàn
                </button>
              </div>
            ) : (
              <ProductGrid
                products={products}
                extraProducts={extraProducts}
                title={selectedCategory ? `SẢN PHẨM: ${selectedCategory.name.toUpperCase()}` : "TẤT CẢ SẢN PHẨM"}
                columns={6}
                rows={8}
                onLoadMore={handleLoadMore}
                onProductClick={handleProductClick}
              />
            )}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
