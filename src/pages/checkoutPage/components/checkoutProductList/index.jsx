import { formatPrice } from '@/utils/formatPrice';
import { useCart } from '@/context/CartContext';
import { FiTrash2 } from 'react-icons/fi';
import './index.scss';

export default function CheckoutProductList({ items }) {
  const { updateQuantity, removeItem } = useCart();

  return (
    <section className="checkout-cart-card">
      <h2 className="checkout-cart-card__title">Giỏ hàng</h2>
      <div className="checkout-cart-card__items">
        {items.map((item) => (
          <div key={item.id} className="checkout-cart-item">
            <div className="checkout-cart-item__thumb">
              {item.image ? (
                <img src={item.image} alt={item.name} />
              ) : (
                <span aria-hidden="true">🛍️</span>
              )}
            </div>

            <div className="checkout-cart-item__content">
              <div className="checkout-cart-item__top">
                <span className="checkout-cart-item__name">{item.name}</span>
                <button
                  type="button"
                  className="checkout-cart-item__delete-btn"
                  onClick={() => removeItem(item.id)}
                  title="Xóa sản phẩm"
                >
                  <FiTrash2 />
                </button>
              </div>

              {item.variant && (
                <div className="checkout-cart-item__variant-pill">
                  <span>{item.variant}</span>
                  <span className="checkout-cart-item__arrow">&gt;</span>
                </div>
              )}

              <div className="checkout-cart-item__bottom">
                <span className="checkout-cart-item__price">
                  {formatPrice(item.price * item.quantity)}
                </span>
                <div className="checkout-cart-item__stepper">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

