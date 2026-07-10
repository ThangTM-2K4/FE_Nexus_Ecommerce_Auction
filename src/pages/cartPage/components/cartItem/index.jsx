import { formatPrice } from '@/utils/formatPrice';
import { useCart } from '@/context/CartContext';
import Checkbox from '@/components/common/checkbox';
import QuantitySelector from '@/components/products/QuantitySelector';
import './index.scss';

export default function CartItem({ item, onRemoveRequest }) {
  const { toggleSelectItem, updateQuantity } = useCart();

  return (
    <div className="cart-item">
      <Checkbox
        id={`cart-item-${item.id}`}
        checked={item.selected}
        onChange={() => toggleSelectItem(item.id)}
      />

      <div className="cart-item__thumb">
        {item.image ? (
          <img src={item.image} alt={item.name} />
        ) : (
          <span aria-hidden="true">📦</span>
        )}
      </div>

      <div className="cart-item__info">
        <p className="cart-item__name">{item.name}</p>
        {item.variant && <p className="cart-item__variant">Phân loại: {item.variant}</p>}
        <p className="cart-item__price">{formatPrice(item.price)}</p>
      </div>

      <div className="cart-item__actions">
        <QuantitySelector
          value={item.quantity}
          max={999}
          onChange={(qty) => updateQuantity(item.id, qty)}
          showLabel={false}
          showStock={false}
          className="cart-item__qty"
        />
        <button
          type="button"
          className="cart-item__remove"
          onClick={() => onRemoveRequest(item)}
          aria-label="Xóa sản phẩm"
        >
          🗑
        </button>
      </div>
    </div>
  );
}
