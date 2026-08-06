import { formatPrice } from '@/utils/formatPrice';
import styles from './index.module.scss';

/**
 * Thẻ sản phẩm — tỉ lệ khung ~200:308, badge giảm giá, tag, tên, giá, đã bán.
 */
export default function ProductCard({
  id,
  image,
  title,
  name,
  price,
  discountPercent = 10,
  soldCount = "1.2k",
  rating = 4.9,
  tags = [],
  onClick,
}) {
  const displayTitle = title || name || "Sản phẩm";
  const displayRating = rating ?? 4.9;
  const displaySoldCount = soldCount ?? "1.2k";

  const handleClick = () => {
    onClick?.(id);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <article
      className={styles.card}
      data-product-id={id}
      onClick={onClick ? handleClick : undefined}
      onKeyDown={onClick ? handleKeyDown : undefined}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className={styles.imageWrap}>
        {image ? (
          <img src={image} alt={displayTitle} className={styles.image} loading="lazy" />
        ) : (
          <div className={styles.noImg}>📦</div>
        )}

        <span className={styles.cornerTag}>Mall</span>

        <div className={styles.hoverOverlay}>
          <span>Tìm sản phẩm tương tự</span>
        </div>
      </div>

      <div className={styles.body}>
        <h3 className={styles.title} title={displayTitle}>{displayTitle}</h3>

        <div className={styles.priceRow}>
          <span className={styles.price}>{formatPrice(price)}</span>
          <span className={styles.discountBadge}>-{discountPercent}%</span>
        </div>

        <div className={styles.footer}>
          <span className={styles.rating}>
            <span className={styles.ratingStar} aria-hidden="true">★</span>
            {displayRating}
          </span>
          <span className={styles.sold}>Đã bán {displaySoldCount}</span>
        </div>
      </div>
    </article>
  );
}
