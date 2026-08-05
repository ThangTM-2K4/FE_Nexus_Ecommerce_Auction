import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
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
  getProductDetail,
  getShopProducts,
  getSimilarProducts,
} from '@/data/mockProductDetail';
import { mockReviews } from '@/data/mockReviews';
import { generateMoreProducts } from '@/data/mockProducts';
import { getProductDetailById, mapProductDetailToUi } from '@/services/catalogService';
import { useProductNavigate } from '@/hooks/useProductNavigate';
import './index.scss';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { handleProductClick } = useProductNavigate();

  const fallbackProduct = useMemo(() => getProductDetail(id), [id]);
  const [product, setProduct] = useState(fallbackProduct);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getProductDetailById(id)
      .then((data) => {
        if (cancelled) return;
        setProduct(mapProductDetailToUi(data, fallbackProduct));
      })
      .catch(() => {
        if (!cancelled) setProduct(fallbackProduct);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, fallbackProduct]);

  const shopProducts = useMemo(() => getShopProducts(id), [id]);
  const similarProducts = useMemo(() => getSimilarProducts(id), [id]);

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

  const descriptionParagraphs = (product.description || '').split('\n\n').filter(Boolean);

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

          <ReviewList reviews={mockReviews} />

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
            title="CÓ THỂ BẠN CŨNG THÍCH"
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
