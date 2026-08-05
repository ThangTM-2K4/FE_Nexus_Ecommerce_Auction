import { formatPrice } from '@/utils/formatPrice';
import Button from '@/components/common/button';
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
    <>
      <section className="checkout-order-summary">
        <h2 className="checkout-order-summary__title">Tổng Kết Đơn Hàng</h2>
        <div className="checkout-order-summary__row">
          <span>Tiền hàng</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="checkout-order-summary__row">
          <span>Phí vận chuyển</span>
          <span>{formatPrice(shippingFee)}</span>
        </div>
        <div className="checkout-order-summary__row checkout-order-summary__row--total">
          <span>Tổng thanh toán</span>
          <strong>{formatPrice(total)}</strong>
        </div>
      </section>

      <div className="checkout-summary-bar">
        <div className="checkout-summary-bar__inner">
          <div className="checkout-summary-bar__total">
            <span>Tổng thanh toán</span>
            <strong>{formatPrice(total)}</strong>
          </div>
          <Button
            variant="accent"
            onClick={onPlaceOrder}
            disabled={isDisabled}
            className="checkout-summary-bar__btn"
          >
            {placing ? 'Đang xử lý...' : 'Đặt Hàng'}
          </Button>
        </div>
      </div>
    </>
  );
}
