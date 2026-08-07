import { useMemo, useState } from 'react';
import { FiChevronRight, FiChevronDown } from 'react-icons/fi';
import ProductCard from '../productCard';
import styles from './index.module.scss';

/**
 * Lưới sản phẩm gợi ý — 6 cột, hiển thị linh hoạt với nút Xem thêm sản phẩm.
 */
export default function ProductGrid({
  products = [],
  title = 'TẤT CẢ SẢN PHẨM',
  columns = 6,
  rows = 3,
  isLoggedIn = false,
  onLoadMore,
  onRequireLogin,
  onProductClick,
  extraProducts = [],
  viewAllLabel,
  onViewAll,
}) {
  const initialPageSize = columns * rows; // Default 18 products
  const [visibleCount, setVisibleCount] = useState(initialPageSize);

  const allProducts = useMemo(
    () => [...products, ...extraProducts],
    [products, extraProducts],
  );

  const visibleProducts = allProducts.slice(0, visibleCount);

  const handleLoadMore = () => {
    if (visibleCount < allProducts.length) {
      setVisibleCount((prev) => prev + 18);
    }
    if (onLoadMore) {
      onLoadMore();
    }
  };

  return (
    <section className={styles.section} aria-label={title}>
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        {viewAllLabel && (
          <button type="button" className={styles.viewAll} onClick={onViewAll}>
            {viewAllLabel}
            <FiChevronRight className={styles.viewAllIcon} aria-hidden="true" />
          </button>
        )}
      </div>

      <div className={styles.grid} style={{ '--product-columns': columns }}>
        {visibleProducts.map((product) => (
          <ProductCard key={product.id} {...product} onClick={onProductClick} />
        ))}
      </div>

      <div className={styles.actions} style={{ display: 'flex', justifyContent: 'center', marginTop: '24px', marginBottom: '16px' }}>
        <button
          type="button"
          className={styles.btnLoadMore}
          onClick={handleLoadMore}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            minWidth: '240px',
            padding: '12px 36px',
            borderRadius: '8px',
            border: '1.5px solid #6b3ba7',
            background: '#ffffff',
            color: '#6b3ba7',
            fontSize: '0.95rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(107, 59, 167, 0.08)',
            transition: 'all 0.25s ease',
          }}
        >
          <span>Xem thêm sản phẩm</span>
          <FiChevronDown style={{ fontSize: '1.1rem' }} />
        </button>
      </div>
    </section>
  );
}
