import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Header from '@/components/homepage/header';

import Footer from '@/components/homepage/footer';
import ProductGrid from '@/components/homepage/productGrid';
import Breadcrumb from '@/components/products/Breadcrumb';
import ProductGallery from '@/components/products/ProductGallery';
import ProductInfoPanel from '@/components/products/ProductInfoPanel';
import ShopInfoCard from '@/components/products/ShopInfoCard';
import ProductDetailTable from '@/components/products/ProductDetailTable';
import ReviewList from '@/components/products/ReviewList';
import { getProductDetail } from '@/data/mockProductDetail';
import {
  mapProductDetailToUi,
  getSellerBusinessName,
  resolveProductId,
  productIdsMatch,
  buildRelatedProductLists,
} from '@/services/catalogService';

import { getPublicProductDetail, getProducts } from '@/services/ecommerceProductService';
import { useProductNavigate } from '@/hooks/useProductNavigate';
import './index.scss';

export default function ProductDetailPage() {
  const { id: routeId } = useParams();
  const location = useLocation();
  const { handleProductClick } = useProductNavigate();

  const id = decodeURIComponent(routeId || '').trim();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const applyProduct = (raw) => {
      if (cancelled || !raw) return false;
      try {
        const mapped = mapProductDetailToUi(raw);
        if (!mapped || (!mapped.id && !mapped.title)) return false;
        setProduct(mapped);
        return true;
      } catch (err) {
        console.error('[ProductDetailPage] mapProductDetailToUi failed', err, raw);
        return false;
      }
    };

    const finishNotFound = (message) => {
      if (cancelled) return;
      setLoadError(message);
      setNotFound(true);
    };

    async function fetchDetail() {
      setLoading(true);
      setNotFound(false);
      setLoadError(null);
      setProduct(null);

      try {
        if (!id || id === 'undefined' || id === 'null') {
          finishNotFound('Không xác định được sản phẩm');
          return;
        }

        const preview = location.state?.productPreview;
        const isGuid = typeof id === 'string' && id.includes('-') && id.length > 20;

        // 1. Gọi API chi tiết sản phẩm đơn công khai
        try {
          const result = await getPublicProductDetail(id);
          if (cancelled) return;

          if (result.ok && result.data && applyProduct(result.data)) {
            return;
          }
        } catch (err) {
          console.warn('[ProductDetailPage] getPublicProductDetail failed', err);
        }

        // 2. Tìm sản phẩm từ API danh sách sản phẩm sàn
        try {
          const listRes = await getProducts({ pageSize: 100 });
          if (cancelled) return;

          if (listRes.ok && Array.isArray(listRes.items) && listRes.items.length > 0) {
            const matched = listRes.items.find((item) => productIdsMatch(resolveProductId(item), id));
            if (matched && applyProduct(matched)) {
              return;
            }
          }
        } catch (err) {
          console.warn('[ProductDetailPage] getProducts fallback failed', err);
        }

        // 3. Dùng dữ liệu preview từ trang trước (HomePage / Search)
        if (preview && productIdsMatch(resolveProductId(preview), id) && applyProduct(preview)) {
          return;
        }

        // 4. Kiểm tra localStorage seller_created_products
        try {
          const localList = JSON.parse(localStorage.getItem('seller_created_products') || '[]');
          const localMatch = localList.find((p) => productIdsMatch(resolveProductId(p), id));
          if (localMatch && applyProduct(localMatch)) {
            return;
          }
        } catch (err) {
          console.warn('[ProductDetailPage] localStorage lookup failed', err);
        }

        // 5. GUID thật nhưng không tìm thấy
        if (isGuid) {
          finishNotFound('Sản phẩm không tồn tại hoặc chưa được duyệt hiển thị công khai');
          return;
        }

        // 6. Fallback mock legacy id (p-1, p-2, ...)
        const fallbackLocal = getProductDetail(id);
        if (fallbackLocal && productIdsMatch(fallbackLocal.id, id)) {
          if (!cancelled) {
            setProduct(fallbackLocal);
          }
          return;
        }

        finishNotFound('Không tìm thấy chi tiết sản phẩm này');
      } catch (err) {
        console.error('[ProductDetailPage] fetchDetail unexpected error', err);
        finishNotFound('Không tải được chi tiết sản phẩm');
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchDetail();

    return () => {
      cancelled = true;
    };
  }, [id, location.state?.productPreview]);


  const [shopProducts, setShopProducts] = useState([]);
  const [similarProducts, setSimilarProducts] = useState([]);

  useEffect(() => {
    if (!product) return;

    let active = true;
    const currentSellerId = product.sellerUserId || product.shop?.id;

    if (currentSellerId && currentSellerId !== 'shop-1') {
      getSellerBusinessName(currentSellerId).then((realBusinessName) => {
        if (!active) return;
        if (realBusinessName) {
          setProduct((prev) => (prev ? {
            ...prev,
            shop: {
              ...prev.shop,
              name: realBusinessName,
            },
          } : prev));
        }
      });
    }

    getProducts({ pageSize: 100 })
      .then((res) => {
        if (!active) return;

        if (res.ok && Array.isArray(res.items) && res.items.length > 0) {
          const { shop, similar } = buildRelatedProductLists(res.items, product);
          setShopProducts(shop);
          setSimilarProducts(similar);
          return;
        }

        setShopProducts([]);
        setSimilarProducts([]);
      })
      .catch(() => {
        if (!active) return;
        setShopProducts([]);
        setSimilarProducts([]);
      });

    return () => {
      active = false;
    };
  }, [product?.id, product?.sellerUserId, product?.shop?.id, product?.categoryId]);

  if (notFound) {
    return (
      <>
        <Header />
        <main className="product-detail-page">
          <div className="product-detail-page__shell">
            <p style={{ textAlign: 'center', padding: '3rem 1rem', color: '#666' }}>
              {loadError || 'Không tìm thấy sản phẩm này.'}
            </p>
          </div>
        </main>
        <Footer />
      </>
    );
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

          {shopProducts.length > 0 && (
            <ProductGrid
              key={`shop-products-${product.id}`}
              products={shopProducts}
              title="CÁC SẢN PHẨM KHÁC CỦA SHOP"
              columns={6}
              rows={2}
              onProductClick={handleProductClick}
            />
          )}

          {similarProducts.length > 0 && (
            <ProductGrid
              key={`similar-products-${product.id}`}
              products={similarProducts}
              title="SẢN PHẨM LIÊN QUAN"
              columns={6}
              rows={2}
              onProductClick={handleProductClick}
            />
          )}
        </div>
      </main>


      <Footer />
    </>
  );
}
