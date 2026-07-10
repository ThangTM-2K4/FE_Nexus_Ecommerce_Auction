import { useCart } from '@/context/CartContext';
import Checkbox from '@/components/common/checkbox';
import CartItem from '../cartItem';
import './index.scss';

export default function CartShopGroup({ shopId, shopName, items, onRemoveRequest }) {
  const { toggleSelectShop } = useCart();

  const allSelected = items.length > 0 && items.every((i) => i.selected);

  const handleShopChange = (checked) => {
    toggleSelectShop(shopId, checked);
  };

  return (
    <section className="cart-shop-group">
      <header className="cart-shop-group__head">
        <Checkbox
          id={`cart-shop-${shopId}`}
          checked={allSelected}
          onChange={handleShopChange}
          label={shopName}
        />
      </header>
      <div className="cart-shop-group__items">
        {items.map((item) => (
          <CartItem key={item.id} item={item} onRemoveRequest={onRemoveRequest} />
        ))}
      </div>
    </section>
  );
}
