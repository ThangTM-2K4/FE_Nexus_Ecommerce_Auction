import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '../../../components/homepage/header';
import Footer from '../../../components/homepage/footer';
import ProductGrid from '../../../components/homepage/productGrid';
import { getCategoryTree, mapProductListItem } from '../../../services/catalogService';
import { getProducts } from '../../../services/ecommerceProductService';
import { useProductNavigate } from '../../../hooks/useProductNavigate';
import './index.scss';

const PAGE_SIZE = 48;
const LOAD_MORE_SIZE = 12;

export default function ProductListPage() {
  const { t } = useTranslation();
  const { handleProductClick } = useProductNavigate();
  const [searchParams] = useSearchParams();

  const searchQuery = (searchParams.get('search') || '').trim();
  const categoryId = (searchParams.get('categoryId') || '').trim();

  const [products, setProducts] = useState([]);
  const [extraProducts, setExtraProducts] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [categoryName, setCategoryName] = useState('');

  const listTitle = useMemo(() => {
    if (searchQuery) {
      return t('productList.searchResultsFor', { query: searchQuery });
    }
    if (categoryId) {
      return categoryName
        ? t('home.productsInCategory', { name: categoryName.toUpperCase() })
        : t('productList.categoryResults');
    }
    return t('productList.allProducts');
  }, [searchQuery, categoryId, categoryName, t]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setLoadError(null);
      setProducts([]);
      setExtraProducts([]);
      setPageNumber(1);

      const filters = { pageNumber: 1, pageSize: PAGE_SIZE };
      if (searchQuery) filters.search = searchQuery;
      if (categoryId) filters.categoryId = categoryId;

      const [productResult, categories] = await Promise.all([
        getProducts(filters),
        categoryId ? getCategoryTree().catch(() => []) : Promise.resolve([]),
      ]);

      if (cancelled) return;

      if (categoryId && Array.isArray(categories)) {
        const matched = categories.find((c) => String(c.id) === String(categoryId));
        setCategoryName(matched?.name || '');
      } else {
        setCategoryName('');
      }

      if (productResult.ok) {
        setProducts((productResult.items || []).map(mapProductListItem).filter(Boolean));
      } else {
        setProducts([]);
        setLoadError(productResult.error || t('productList.emptyTitle'));
      }

      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [searchQuery, categoryId, t]);

  const handleLoadMore = useCallback(async () => {
    const nextPage = pageNumber + 1;
    const filters = { pageNumber: nextPage, pageSize: LOAD_MORE_SIZE };
    if (searchQuery) filters.search = searchQuery;
    if (categoryId) filters.categoryId = categoryId;

    const res = await getProducts(filters);
    if (res.ok) {
      setExtraProducts((prev) => [
        ...prev,
        ...(res.items || []).map(mapProductListItem).filter(Boolean),
      ]);
      setPageNumber(nextPage);
    }
  }, [pageNumber, searchQuery, categoryId]);

  return (
    <>
      <Header />

      <main className="product-list-page">
        <div className="product-list-page__shell">
          {(searchQuery || categoryId) && (
            <p className="product-list-page__meta">
              {searchQuery && <>🔍 {searchQuery}</>}
              {searchQuery && categoryId && ' · '}
              {categoryId && categoryName && <>📂 {categoryName}</>}
            </p>
          )}

          {loading ? (
            <p className="product-list-page__loading">{t('productList.loading')}</p>
          ) : products.length === 0 ? (
            <div className="product-list-page__state">
              <h2>{loadError || t('productList.emptyTitle')}</h2>
              <p>{t('productList.emptyDesc')}</p>
              <Link to="/" className="product-list-page__back">
                {t('productList.backHome')}
              </Link>
            </div>
          ) : (
            <ProductGrid
              products={products}
              extraProducts={extraProducts}
              title={listTitle}
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
