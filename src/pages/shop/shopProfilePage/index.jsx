import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Header from '../../../components/homepage/header';
import Footer from '../../../components/homepage/footer';
import ProductGrid from '../../../components/homepage/productGrid';
import { useProductNavigate } from '../../../hooks/useProductNavigate';
import { useChat } from '../../../context/ChatContext';
import {
  filterShopProducts,
  getBestSellerProducts,
  getShopById,
  getShopCategories,
  getSuggestedProducts,
  paginateProducts,
  shopProducts as mockShopProducts,
} from '../../../data/shopProfileMock';
import {
  getProducts,
  mapApiItemsToShopCatalog,
  productIdsMatch,
  resolvePublicShopProfile,
} from '../../../services/catalogService';
import ShopBestSeller from './shopBestSeller';
import ShopCatalog from './shopCatalog';
import ShopHeader from './shopHeader';
import ShopNavTabs from './shopNavTabs';
import './index.scss';

const PAGE_SIZE = 15;

export default function ShopProfilePage() {
  const { shopId: rawShopId } = useParams();
  const location = useLocation();
  const shopId = decodeURIComponent(rawShopId || '').trim();
  const { handleProductClick } = useProductNavigate();
  const { openChat } = useChat();
  const catalogRef = useRef(null);
  const tabsRef = useRef(null);

  const [shop, setShop] = useState(null);
  const [shopLoading, setShopLoading] = useState(true);
  const [shopError, setShopError] = useState(null);
  const [catalogProducts, setCatalogProducts] = useState([]);

  const categories = getShopCategories();

  const [activeTab, setActiveTab] = useState('browse');
  const [activeCategory, setActiveCategory] = useState(null);
  const [sortBy, setSortBy] = useState('popular');
  const [priceFilter, setPriceFilter] = useState('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    let active = true;

    async function loadShop() {
      setShopLoading(true);
      setShopError(null);
      setShop(null);
      setCatalogProducts([]);

      if (!shopId) {
        if (active) {
          setShopError('Không xác định được shop');
          setShopLoading(false);
        }
        return;
      }

      try {
        const profile = await resolvePublicShopProfile(shopId, getShopById);
        if (!active) return;

        if (!profile) {
          setShopError('Không tìm thấy shop này');
          setShopLoading(false);
          return;
        }

        const preview = location.state?.shopPreview;
        const mergedProfile =
          preview && productIdsMatch(preview.id, shopId)
            ? {
                ...profile,
                name: preview.name || profile.name,
                avatar: preview.avatar || profile.avatar,
              }
            : profile;

        setShop(mergedProfile);

        const mockOnly = getShopById(shopId);
        if (mockOnly) {
          setCatalogProducts(mockShopProducts);
          setShopLoading(false);
          return;
        }

        const productRes = await getProducts({ pageSize: 100 });
        if (!active) return;

        if (productRes.ok && Array.isArray(productRes.items)) {
          const mapped = mapApiItemsToShopCatalog(productRes.items, shopId);
          setCatalogProducts(mapped);
        } else {
          setCatalogProducts([]);
        }
      } catch (err) {
        console.error('[ShopProfilePage] loadShop failed', err);
        if (active) {
          setShopError('Không tải được thông tin shop');
        }
      } finally {
        if (active) {
          setShopLoading(false);
        }
      }
    }

    loadShop();

    return () => {
      active = false;
    };
  }, [shopId, location.state?.shopPreview]);

  const suggested = useMemo(
    () => getSuggestedProducts(shopId, 6, catalogProducts),
    [shopId, catalogProducts],
  );

  const bestSellers = useMemo(
    () => getBestSellerProducts(shopId, 6, catalogProducts),
    [shopId, catalogProducts],
  );

  const filteredProducts = useMemo(
    () =>
      filterShopProducts(catalogProducts, {
        shopId,
        categoryId: activeCategory,
        sortBy,
        priceFilter,
      }),
    [catalogProducts, shopId, activeCategory, sortBy, priceFilter],
  );

  const pagination = useMemo(
    () => paginateProducts(filteredProducts, page, PAGE_SIZE),
    [filteredProducts, page],
  );

  const scrollToTabs = useCallback(() => {
    tabsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const scrollToCatalog = useCallback(() => {
    catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handleTabChange = useCallback(
    (tabKey) => {
      setActiveTab(tabKey);
      if (tabKey === 'browse') {
        setActiveCategory(null);
        scrollToTabs();
        return;
      }
      setActiveCategory(tabKey === 'all' ? null : tabKey);
      setPage(1);
    },
    [scrollToTabs],
  );

  const handleCategoryChange = useCallback((categoryId) => {
    setActiveCategory(categoryId);
    setActiveTab(categoryId ? categoryId : 'all');
    setPage(1);
  }, []);

  const handleViewAllSuggested = useCallback(() => {
    setActiveTab('all');
    setActiveCategory(null);
    setPage(1);
    requestAnimationFrame(() => scrollToCatalog());
  }, [scrollToCatalog]);

  const handleViewAllBestSeller = useCallback(() => {
    setSortBy('bestselling');
    setActiveTab('all');
    setActiveCategory(null);
    setPage(1);
    requestAnimationFrame(() => scrollToCatalog());
  }, [scrollToCatalog]);

  if (shopLoading) {
    return (
      <>
        <Header />
        <main className="shop-profile-page">
          <div className="shop-profile-page__shell">
            <p style={{ textAlign: 'center', padding: '3rem 0' }}>Đang tải shop...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (shopError || !shop) {
    return (
      <>
        <Header />
        <main className="shop-profile-page">
          <div className="shop-profile-page__shell">
            <p style={{ textAlign: 'center', padding: '3rem 1rem', color: '#666' }}>
              {shopError || 'Không tìm thấy shop này.'}
            </p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const showBrowseSections = activeTab === 'browse';

  return (
    <>
      <Header />

      <main className="shop-profile-page">
        <div className="shop-profile-page__shell">
          <ShopHeader shop={shop} onChat={() => openChat(shop.id, shop)} />

          <div ref={tabsRef} className="shop-profile-page__tabs">
            <ShopNavTabs categories={categories} activeTab={activeTab} onChange={handleTabChange} />
          </div>

          {showBrowseSections && (
            <>
              <ProductGrid
                products={suggested}
                title="GỢI Ý CHO BẠN"
                columns={6}
                rows={1}
                viewAllLabel="Xem Tất Cả"
                onViewAll={handleViewAllSuggested}
                onProductClick={handleProductClick}
              />
              <ShopBestSeller
                products={bestSellers}
                onProductClick={handleProductClick}
                onViewAll={handleViewAllBestSeller}
              />
            </>
          )}

          <div ref={catalogRef} className="shop-profile-page__catalog">
            <ShopCatalog
              categories={categories}
              activeCategory={activeCategory}
              onCategoryChange={handleCategoryChange}
              sortBy={sortBy}
              onSortChange={(value) => {
                setSortBy(value);
                setPage(1);
              }}
              priceFilter={priceFilter}
              onPriceChange={(value) => {
                setPriceFilter(value);
                setPage(1);
              }}
              products={pagination.items}
              page={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
              onProductClick={handleProductClick}
            />
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
