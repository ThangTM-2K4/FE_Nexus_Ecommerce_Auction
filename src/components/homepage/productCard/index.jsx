import { formatPrice } from '@/utils/formatPrice';
import styles from './index.module.scss';

/**
 * Thẻ sản phẩm — tỉ lệ khung ~200:308, badge giảm giá, tag, tên, giá, đã bán.
 */
export default function ProductCard({
  id,
  image,
  title,
  price,
  discountPercent,
  soldCount,
  tags = [],
  onClick,
}) {
  const cornerTag = tags.find((tag) => ['7.7', 'Mall', 'SALE'].includes(tag));
  const pillTags = tags.filter((tag) => !['7.7', 'Mall', 'SALE'].includes(tag));

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
        <img src={image} alt={title} className={styles.image} loading="lazy" />

        {cornerTag && <span className={styles.cornerTag}>{cornerTag}</span>}

        {discountPercent != null && discountPercent > 0 && (
          <span className={styles.discountBadge}>-{discountPercent}%</span>
        )}

        <div className={styles.hoverOverlay}>
          <span>Tìm sản phẩm tương tự</span>
        </div>
      </div>

      <div className={styles.body}>
        {pillTags.length > 0 && (
          <div className={styles.pillRow}>
            {pillTags.map((tag) => (
              <span key={tag} className={styles.pill}>
                {tag}
              </span>
            ))}
          </div>
        )}

        <h3 className={styles.title}>{title}</h3>

        <div className={styles.footer}>
          <span className={styles.price}>{formatPrice(price)}</span>
          <span className={styles.sold}>{soldCount} đã bán</span>
        </div>
      </div>
    </article>
  );
}
