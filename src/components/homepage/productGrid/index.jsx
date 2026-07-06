import { useMemo, useState } from 'react';
import ProductCard from '../productCard';
import styles from './index.module.scss';

const DEFAULT_PAGE_SIZE = 48;

/**
 * Lưới sản phẩm gợi ý — 6 cột, tối đa rows * columns sản phẩm mỗi lần hiển thị.
 */
export default function ProductGrid({
  products = [],
  title = 'GỢI Ý HÔM NAY',
  columns = 6,
  rows = 8,
  isLoggedIn = false,
  onLoadMore,
  onRequireLogin,
  onProductClick,
  extraProducts = [],
  viewAllLabel,
  onViewAll,
}) {
  const pageSize = columns * rows;
  const [visibleCount, setVisibleCount] = useState(pageSize);

  const allProducts = useMemo(
    () => [...products, ...extraProducts],
    [products, extraProducts],
  );

  const visibleProducts = allProducts.slice(0, visibleCount);
  const canLoadMore = visibleCount < allProducts.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + 12, allProducts.length));
    onLoadMore?.();
  };

  return (
    <section className={styles.section} aria-label={title}>
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        {viewAllLabel && (
          <button type="button" className={styles.viewAll} onClick={onViewAll}>
            {viewAllLabel} ›
          </button>
        )}
      </div>

      <div className={styles.grid} style={{ '--product-columns': columns }}>
        {visibleProducts.map((product) => (
          <ProductCard key={product.id} {...product} onClick={onProductClick} />
        ))}
      </div>

      <div className={styles.actions}>
        {isLoggedIn ? (
          canLoadMore && (
            <button type="button" className={styles.btnLoadMore} onClick={handleLoadMore}>
              Xem thêm
            </button>
          )
        ) : (
          <button type="button" className={styles.btnLoginMore} onClick={onRequireLogin}>
            Đăng nhập để xem thêm
          </button>
        )}
      </div>
    </section>
  );
}
