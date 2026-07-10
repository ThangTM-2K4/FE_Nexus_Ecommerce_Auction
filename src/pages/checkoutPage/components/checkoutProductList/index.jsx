import { useMemo } from 'react';
import { formatPrice } from '@/utils/formatPrice';
import './index.scss';

export default function CheckoutProductList({ items }) {
  const shopGroups = useMemo(() => {
    const map = new Map();
    items.forEach((item) => {
      if (!map.has(item.shopId)) {
        map.set(item.shopId, { shopId: item.shopId, shopName: item.shopName, items: [] });
      }
      map.get(item.shopId).items.push(item);
    });
    return [...map.values()];
  }, [items]);

  return (
    <section className="checkout-product-list">
      <h2 className="checkout-product-list__title">Sản Phẩm Đã Chọn</h2>
      {shopGroups.map((group) => (
        <div key={group.shopId} className="checkout-product-list__shop">
          <h3 className="checkout-product-list__shop-name">{group.shopName}</h3>
          {group.items.map((item) => (
            <div key={item.id} className="checkout-product-list__item">
              <div className="checkout-product-list__thumb">
                {item.image ? (
                  <img src={item.image} alt={item.name} />
                ) : (
                  <span aria-hidden="true">📦</span>
                )}
              </div>
              <div className="checkout-product-list__info">
                <p className="checkout-product-list__name">{item.name}</p>
                {item.variant && (
                  <p className="checkout-product-list__variant">Phân loại: {item.variant}</p>
                )}
                <p className="checkout-product-list__qty">x{item.quantity}</p>
              </div>
              <p className="checkout-product-list__price">
                {formatPrice(item.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>
      ))}
    </section>
  );
}
