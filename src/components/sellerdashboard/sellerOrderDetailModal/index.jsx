import { formatCurrency, orderTimeline, shippingCarriers } from "../../../data/sellerMockData";
import { statusLabel, statusClass } from "../../../utils/sellerOrderStatus";
import "./index.scss";

const carrierName = (code) =>
  shippingCarriers.find((c) => c.code === code)?.name ?? code ?? "—";

// Chi tiết đơn hàng: thông tin người mua, tiến độ giao hàng, chi phí & doanh thu.
export default function SellerOrderDetailModal({ order, onClose }) {
  if (!order) return null;

  const timeline = orderTimeline(order.status);
  const shippingFee = order.shippingFee ?? 0;
  const subtotal = order.amount ?? 0;
  const revenue = subtotal + shippingFee;

  return (
    <div className="slr-order-overlay" onClick={onClose} role="presentation">
      <div
        className="slr-order-modal"
        role="dialog"
        aria-labelledby="order-detail-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="slr-order-modal__header">
          <div>
            <h3 id="order-detail-title">Chi tiết đơn hàng {order.id}</h3>
            <p>Đặt lúc {order.date}</p>
          </div>
          <span className={`slr-status slr-status--${statusClass(order.status)}`}>
            {statusLabel(order.status)}
          </span>
          <button type="button" className="slr-order-modal__close" onClick={onClose} aria-label="Đóng">
            ✕
          </button>
        </header>

        <div className="slr-order-modal__body">
          <div className="slr-order-detail-grid">
            <section className="slr-order-block">
              <h4>Người mua</h4>
              <dl>
                <div><dt>Khách hàng</dt><dd>{order.customer}</dd></div>
                <div><dt>Điện thoại</dt><dd>{order.phone || "—"}</dd></div>
                <div><dt>Địa chỉ</dt><dd>{order.address || "—"}</dd></div>
              </dl>
            </section>

            <section className="slr-order-block">
              <h4>Vận chuyển</h4>
              <dl>
                <div><dt>Đơn vị</dt><dd>{carrierName(order.carrier)}</dd></div>
                <div><dt>Mã vận đơn</dt><dd>{order.tracking || "—"}</dd></div>
                <div><dt>Phí vận chuyển</dt><dd>{formatCurrency(shippingFee)}</dd></div>
              </dl>
            </section>
          </div>

          <section className="slr-order-block">
            <h4>Sản phẩm</h4>
            <div className="slr-order-product">
              <img src={order.image} alt="" />
              <div>
                <strong>{order.product}</strong>
                <span>Số lượng: {order.qty ?? 1}</span>
              </div>
              <span className="slr-order-product__price">{formatCurrency(subtotal)}</span>
            </div>
          </section>

          <section className="slr-order-block">
            <h4>Tiến độ giao hàng</h4>
            <ol className="slr-order-timeline">
              {timeline.map((step) => (
                <li key={step.key} className={step.done || step.key === order.status ? "done" : ""}>
                  <span className="slr-order-timeline__dot" />
                  <span>{step.label}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className="slr-order-block slr-order-block--summary">
            <h4>Chi phí & doanh thu</h4>
            <dl>
              <div><dt>Tiền hàng</dt><dd>{formatCurrency(subtotal)}</dd></div>
              <div><dt>Phí vận chuyển</dt><dd>{formatCurrency(shippingFee)}</dd></div>
              <div className="slr-order-total"><dt>Doanh thu bạn nhận</dt><dd>{formatCurrency(revenue)}</dd></div>
            </dl>
          </section>
        </div>

        <footer className="slr-order-modal__footer">
          <button type="button" className="slr-btn slr-btn--ghost" onClick={onClose}>Đóng</button>
        </footer>
      </div>
    </div>
  );
}
