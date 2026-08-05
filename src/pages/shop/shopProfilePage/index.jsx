import { useCallback, useMemo, useRef, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
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
  shopProducts,
} from '../../../data/shopProfileMock';
import ShopBestSeller from './shopBestSeller';
import ShopCatalog from './shopCatalog';
import ShopHeader from './shopHeader';
import ShopNavTabs from './shopNavTabs';
import './index.scss';

const PAGE_SIZE = 15;

export default function ShopProfilePage() {
  const { shopId } = useParams();
  const { handleProductClick } = useProductNavigate();
  const { openChat } = useChat();
  const catalogRef = useRef(null);
  const tabsRef = useRef(null);

  const shop = getShopById(shopId);
  const categories = getShopCategories();

  const [activeTab, setActiveTab] = useState('browse');
  const [activeCategory, setActiveCategory] = useState(null);
  const [sortBy, setSortBy] = useState('popular');
  const [priceFilter, setPriceFilter] = useState('all');
  const [page, setPage] = useState(1);

  const suggested = useMemo(() => getSuggestedProducts(shopId), [shopId]);
  const bestSellers = useMemo(() => getBestSellerProducts(shopId), [shopId]);

  const filteredProducts = useMemo(
    () => filterShopProducts(shopProducts, { categoryId: activeCategory, sortBy, priceFilter }),
    [activeCategory, sortBy, priceFilter],
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

  const handleCategoryChange = useCallback(
    (categoryId) => {
      setActiveCategory(categoryId);
      setActiveTab(categoryId ? categoryId : 'all');
      setPage(1);
    },
    [],
  );

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

  if (!shop) {
    return <Navigate to="/404" replace />;
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
