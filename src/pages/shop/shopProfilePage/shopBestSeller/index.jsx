import { FiChevronRight } from 'react-icons/fi';
import { formatPrice } from '@/utils/formatPrice';
import './index.scss';

const RANK_LABELS = ['Top 1', 'Top 2', 'Top 3', 'Top 4', 'Top 5', 'Top 6'];

export default function ShopBestSeller({ products, onProductClick, onViewAll }) {
  return (
    <section className="shop-best-seller" aria-label="Sản Phẩm Bán Chạy">
      <div className="shop-best-seller__header">
        <h2 className="shop-best-seller__title">SẢN PHẨM BÁN CHẠY</h2>
        <button type="button" className="shop-best-seller__view-all" onClick={onViewAll}>
          Xem Tất Cả
          <FiChevronRight aria-hidden="true" />
        </button>
      </div>

      <div className="shop-best-seller__grid">
        {products.map((product, index) => (
          <article
            key={product.id}
            className="shop-best-seller__card"
            onClick={() => onProductClick?.(product.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onProductClick?.(product.id);
              }
            }}
            role="button"
            tabIndex={0}
          >
            <span
              className={`shop-best-seller__rank ${
                index < 3 ? 'shop-best-seller__rank--top' : 'shop-best-seller__rank--normal'
              }`}
            >
              {RANK_LABELS[index]}
            </span>
            <div className="shop-best-seller__image-wrap">
              <img src={product.image} alt={product.title} loading="lazy" />
            </div>
            <h3 className="shop-best-seller__name">{product.title}</h3>
            <p className="shop-best-seller__price">{formatPrice(product.price)}</p>
            <p className="shop-best-seller__sold">{product.monthlySold} đã bán</p>
          </article>
        ))}
      </div>
    </section>
  );
}
