import { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import api from '@/config/api';
import Header from '@/components/homepage/header';

import Footer from '@/components/homepage/footer';
import ProductGrid from '@/components/homepage/productGrid';
import Breadcrumb from '@/components/products/Breadcrumb';
import ProductGallery from '@/components/products/ProductGallery';
import ProductInfoPanel from '@/components/products/ProductInfoPanel';
import ShopInfoCard from '@/components/products/ShopInfoCard';
import ProductDetailTable from '@/components/products/ProductDetailTable';
import ReviewList from '@/components/products/ReviewList';
import {
  getShopProducts,
  getSimilarProducts,
  getProductDetail,
} from '@/data/mockProductDetail';
import { mockReviews } from '@/data/mockReviews';
import { generateMoreProducts } from '@/data/mockProducts';
import { mapProductDetailToUi, mapProductListItem } from '@/services/catalogService';
import { getPublicProductDetail, getProducts } from '@/services/ecommerceProductService';
import { useProductNavigate } from '@/hooks/useProductNavigate';
import './index.scss';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { handleProductClick } = useProductNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchDetail() {
      setLoading(true);
      setNotFound(false);
      setLoadError(null);
      setProduct(null);

      // 1. Gọi API chi tiết sản phẩm đơn công khai
      try {
        const result = await getPublicProductDetail(id);
        if (cancelled) return;

        if (result.ok && result.data) {
          setProduct(mapProductDetailToUi(result.data));
          setLoading(false);
          return;
        }
      } catch {
        // ignore
      }

      // 2. Nếu API đơn thất bại/404, tìm sản phẩm từ API danh sách sản phẩm sàn
      try {
        const listRes = await getProducts({ pageSize: 100 });
        if (cancelled) return;

        if (listRes.ok && Array.isArray(listRes.items) && listRes.items.length > 0) {
          const matched = listRes.items.find(
            (item) => String(item.id || item.productId || '').toLowerCase() === String(id).toLowerCase(),
          );

          if (matched) {
            setProduct(mapProductDetailToUi(matched));
            setLoading(false);
            return;
          }
        }
      } catch {
        // ignore
      }

      // 3. Fallback theo ID sản phẩm mẫu nếu là dữ liệu test
      if (!cancelled) {
        const fallbackLocal = getProductDetail(id);
        if (fallbackLocal && (fallbackLocal.id === id || !id)) {
          setProduct(fallbackLocal);
          setLoading(false);
          return;
        }

        setLoadError('Không tìm thấy chi tiết sản phẩm này');
        setLoading(false);
      }
    }

    fetchDetail();

    return () => {
      cancelled = true;
    };
  }, [id]);


  const [shopProducts, setShopProducts] = useState([]);
  const [similarProducts, setSimilarProducts] = useState([]);

  useEffect(() => {
    if (!product) return;

    let active = true;
    const currentSellerId = product.sellerUserId || product.shop?.id;

    // Resolving exact shop name from API or local registration
    if (currentSellerId && currentSellerId !== 'shop-1') {
      try {
        const rawLocal = localStorage.getItem(`mockSellerApplication_${currentSellerId}`);
        if (rawLocal) {
          const parsedLocal = JSON.parse(rawLocal);
          if (parsedLocal.shopName || parsedLocal.businessName) {
            const localShopName = parsedLocal.shopName || parsedLocal.businessName;
            setProduct((prev) => (prev ? {
              ...prev,
              shop: {
                ...prev.shop,
                name: localShopName,
              },
            } : prev));
          }
        }
      } catch {
        // ignore
      }

      api.get('/sellers/search', { params: { pageSize: 50 }, skipErrorRedirect: true })
        .then((sRes) => {
          if (!active) return;
          const sData = sRes.data?.data || sRes.data;
          const items = sData?.items || (Array.isArray(sData) ? sData : []);
          const matchedSeller = items.find(
            (s) => String(s.userId || s.sellerId || '').toLowerCase() === String(currentSellerId).toLowerCase(),
          );
          if (matchedSeller && (matchedSeller.shopName || matchedSeller.businessName)) {
            const realShopName = matchedSeller.shopName || matchedSeller.businessName;
            setProduct((prev) => (prev ? {
              ...prev,
              shop: {
                ...prev.shop,
                name: realShopName,
              },
            } : prev));
          }
        })
        .catch(() => {});
    }



    const currentCatId = product.categoryId || product.category?.[1]?.label;

    getProducts({ pageSize: 40 })

      .then((res) => {
        if (!active) return;
        if (res.ok && Array.isArray(res.items) && res.items.length > 0) {
          const mapped = res.items.map(mapProductListItem).filter(Boolean);

          // 1. Các sản phẩm của Seller
          const ofSeller = mapped.filter(
            (p) => (p.sellerUserId === currentSellerId || p.shopId === currentSellerId) && p.id !== product.id,
          );
          setShopProducts(ofSeller.length > 0 ? ofSeller : mapped.filter((p) => p.id !== product.id));

          // 2. Các sản phẩm liên quan cùng danh mục
          const ofCategory = mapped.filter(
            (p) =>
              (p.categoryId === currentCatId ||
                p.categoryName === currentCatId ||
                p.category === currentCatId) &&
              p.id !== product.id,
          );
          setSimilarProducts(
            ofCategory.length > 0 ? ofCategory : mapped.filter((p) => p.id !== product.id).reverse(),
          );
        } else {
          setShopProducts(getShopProducts(product.id));
          setSimilarProducts(getSimilarProducts(product.id));
        }
      })
      .catch(() => {
        if (active) {
          setShopProducts(getShopProducts(product.id));
          setSimilarProducts(getSimilarProducts(product.id));
        }
      });

    return () => {
      active = false;
    };
  }, [product]);

  const [shopExtra, setShopExtra] = useState([]);
  const [similarExtra, setSimilarExtra] = useState([]);

  const handleShopLoadMore = useCallback(() => {
    setShopExtra((prev) => [
      ...prev,
      ...generateMoreProducts(shopProducts.length + prev.length, 12),
    ]);
  }, [shopProducts.length]);

  const handleSimilarLoadMore = useCallback(() => {
    setSimilarExtra((prev) => [
      ...prev,
      ...generateMoreProducts(similarProducts.length + prev.length + 100, 12),
    ]);
  }, [similarProducts.length]);

  if (notFound) {
    return <Navigate to="/404" replace />;
  }

  if (loading) {
    return (
      <>
        <Header />
        <main className="product-detail-page">
          <div className="product-detail-page__shell">
            <p style={{ textAlign: 'center', padding: '3rem 0' }}>Đang tải chi tiết sản phẩm...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (loadError || !product) {
    return (
      <>
        <Header />
        <main className="product-detail-page">
          <div className="product-detail-page__shell">
            <p style={{ textAlign: 'center', padding: '3rem 0', color: '#666' }}>
              {loadError || 'Không tải được chi tiết sản phẩm'}. Vui lòng thử lại sau.
            </p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const descriptionParagraphs = (product.description || '').split('\n\n').filter(Boolean);

  return (
    <>
      <Header />

      <main className="product-detail-page">
        <div className="product-detail-page__shell">
          <Breadcrumb items={product.category} />

          <section className="product-detail-page__hero">
            <div className="product-detail-page__gallery">
              <ProductGallery gallery={product.gallery} likeCount={product.likeCount} />
            </div>
            <div className="product-detail-page__info">
              <ProductInfoPanel product={product} />
            </div>
          </section>

          <ShopInfoCard shop={product.shop} />

          <ProductDetailTable attributes={product.attributes} />

          <section className="product-detail-page__description">
            <h2 className="product-detail-page__section-title">MÔ TẢ SẢN PHẨM</h2>
            <div className="product-detail-page__description-body">
              {descriptionParagraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </section>

          <ReviewList reviews={product.reviews || []} />

          <ProductGrid
            products={shopProducts}
            extraProducts={shopExtra}
            title="CÁC SẢN PHẨM KHÁC CỦA SHOP"
            columns={6}
            rows={8}
            onLoadMore={handleShopLoadMore}
            onProductClick={handleProductClick}
            viewAllLabel="Xem Tất Cả"
          />

          <ProductGrid
            products={similarProducts}
            extraProducts={similarExtra}
            title="SẢN PHẨM LIÊN QUAN"
            columns={6}
            rows={8}
            onLoadMore={handleSimilarLoadMore}
            onProductClick={handleProductClick}
            viewAllLabel="Xem Tất Cả"
          />
        </div>
      </main>


      <Footer />
    </>
  );
}
