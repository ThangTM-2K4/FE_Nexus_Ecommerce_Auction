import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/homepage/header';
import Footer from '@/components/homepage/footer';
import EmptyState from '@/components/profile/emptyState';
import Button from '@/components/common/button';
import Modal from '@/components/common/modal';
import { useCart } from '@/context/CartContext';
import CartShopGroup from './components/cartShopGroup';
import CartSummaryBar from './components/cartSummaryBar';
import './index.scss';

export default function CartPage() {
  const navigate = useNavigate();
  const {
    cartItems,
    toggleSelectAll,
    removeItem,
    getTotalPrice,
    getSelectedItems,
  } = useCart();

  const [removeTarget, setRemoveTarget] = useState(null);

  const shopGroups = useMemo(() => {
    const map = new Map();
    cartItems.forEach((item) => {
      if (!map.has(item.shopId)) {
        map.set(item.shopId, { shopId: item.shopId, shopName: item.shopName, items: [] });
      }
      map.get(item.shopId).items.push(item);
    });
    return [...map.values()];
  }, [cartItems]);

  const selectedItems = getSelectedItems();
  const selectedCount = selectedItems.length;
  const totalPrice = getTotalPrice();
  const allSelected = cartItems.length > 0 && cartItems.every((i) => i.selected);

  const handleToggleAll = (checked) => {
    toggleSelectAll(checked);
  };

  const handleConfirmRemove = () => {
    if (removeTarget) {
      removeItem(removeTarget.id);
      setRemoveTarget(null);
    }
  };

  return (
    <div className="cart-page">
      <Header />

      <main className="cart-page__main">
        <div className="cart-page__shell">
          <h1 className="cart-page__title">Giỏ Hàng</h1>

          {cartItems.length === 0 ? (
            <div className="cart-page__empty">
              <EmptyState icon="🛒" title="Giỏ hàng trống" description="Hãy thêm sản phẩm yêu thích vào giỏ hàng" />
              <Button variant="accent" onClick={() => navigate('/')}>
                Về Trang Chủ
              </Button>
            </div>
          ) : (
            <div className="cart-page__list">
              {shopGroups.map((group) => (
                <CartShopGroup
                  key={group.shopId}
                  shopId={group.shopId}
                  shopName={group.shopName}
                  items={group.items}
                  onRemoveRequest={setRemoveTarget}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {cartItems.length > 0 && (
        <CartSummaryBar
          allSelected={allSelected}
          onToggleAll={handleToggleAll}
          selectedCount={selectedCount}
          totalPrice={totalPrice}
          onCheckout={() => navigate('/checkout')}
        />
      )}

      <Modal
        open={Boolean(removeTarget)}
        onClose={() => setRemoveTarget(null)}
        title="Xóa sản phẩm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setRemoveTarget(null)}>
              Hủy
            </Button>
            <Button variant="accent" onClick={handleConfirmRemove}>
              Xóa
            </Button>
          </>
        }
      >
        <p>Bạn có chắc muốn xóa &quot;{removeTarget?.name}&quot; khỏi giỏ hàng?</p>
      </Modal>

      <Footer />
    </div>
  );
}
