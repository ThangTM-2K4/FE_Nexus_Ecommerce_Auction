import { formatPrice } from '@/utils/formatPrice';
import './index.scss';

const STATUS_LABELS = {
  cho_xac_nhan: 'Chờ xác nhận',
  pending_payment: 'Chờ thanh toán',
  shipping: 'Vận chuyển',
  delivering: 'Chờ giao hàng',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
  return: 'Trả hàng/Hoàn tiền',
};

export default function OrderCard({ order }) {
  const firstProduct = order.products?.[0];
  const extraCount = Math.max(0, (order.products?.length || 0) - 1);

  return (
    <article className="account-order-card">
      <header className="account-order-card__head">
        <div>
          <span className="account-order-card__shop">{order.shopName}</span>
          <span className="account-order-card__id">#{order.id}</span>
        </div>
        <span className={`account-order-card__status account-order-card__status--${order.status}`}>
          {STATUS_LABELS[order.status] || order.status}
        </span>
      </header>

      <div className="account-order-card__body">
        {firstProduct && (
          <div className="account-order-card__product">
            <div className="account-order-card__thumb">
              {firstProduct.image ? (
                <img src={firstProduct.image} alt={firstProduct.name} />
              ) : (
                <span aria-hidden="true">📦</span>
              )}
            </div>
            <div className="account-order-card__info">
              <p className="account-order-card__name">{firstProduct.name}</p>
              <p className="account-order-card__qty">x{firstProduct.quantity}</p>
              {extraCount > 0 && (
                <p className="account-order-card__more">+{extraCount} sản phẩm khác</p>
              )}
            </div>
            <div className="account-order-card__price">{formatPrice(order.total)}</div>
          </div>
        )}
      </div>

      <footer className="account-order-card__foot">
        <time>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</time>
        <div className="account-order-card__actions">
          <button type="button" className="account-order-card__btn">
            Xem chi tiết
          </button>
        </div>
      </footer>
    </article>
  );
}
