import { formatPrice } from '@/utils/formatPrice';
import './index.scss';

export default function CheckoutOrderSummary({
  subtotal,
  shippingFee,
  total,
  onPlaceOrder,
  placing,
  disabled = false,
}) {
  const isDisabled = placing || disabled;

  return (
    <section className="checkout-summary-card">
      <h2 className="checkout-summary-card__title">Tóm tắt đơn hàng</h2>

      <div className="checkout-summary-card__rows">
        <div className="checkout-summary-card__row">
          <span>Tổng tiền hàng</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="checkout-summary-card__row">
          <span>Phí vận chuyển</span>
          <span>{shippingFee ? formatPrice(shippingFee) : '-'}</span>
        </div>
        <div className="checkout-summary-card__row checkout-summary-card__row--total">
          <span>Tổng thanh toán</span>
          <strong className="checkout-summary-card__total-amount">{formatPrice(total)}</strong>
        </div>
      </div>

      <button
        type="button"
        className="checkout-summary-card__submit-btn"
        onClick={onPlaceOrder}
        disabled={isDisabled}
      >
        {placing ? 'Đang xử lý...' : 'Đặt hàng'}
      </button>
    </section>
  );
}

