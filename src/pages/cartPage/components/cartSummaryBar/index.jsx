import { formatPrice } from '@/utils/formatPrice';
import Checkbox from '@/components/common/checkbox';
import Button from '@/components/common/button';
import './index.scss';

export default function CartSummaryBar({
  allSelected,
  onToggleAll,
  selectedCount,
  totalPrice,
  onCheckout,
}) {
  return (
    <div className="cart-summary-bar">
      <div className="cart-summary-bar__inner">
        <Checkbox
          id="cart-select-all"
          label="Chọn Tất Cả"
          checked={allSelected}
          onChange={onToggleAll}
        />

        <div className="cart-summary-bar__total">
          <span className="cart-summary-bar__total-label">Tổng thanh toán:</span>
          <strong className="cart-summary-bar__total-value">{formatPrice(totalPrice)}</strong>
        </div>

        <Button
          variant="accent"
          disabled={selectedCount === 0}
          onClick={onCheckout}
          className="cart-summary-bar__checkout-btn"
        >
          Mua Hàng ({selectedCount})
        </Button>
      </div>
    </div>
  );
}
