import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { formatCurrency, orderTimeline, shippingCarriers } from "../../../data/sellerMockData";
import { statusLabel, statusClass } from "../../../utils/sellerOrderStatus";
import { getSellerOrderDetail, confirmSellerOrder, rejectSellerOrder } from "../../../services/sellerOrderService";
import "./index.scss";

const carrierName = (code) =>
  shippingCarriers.find((c) => c.code === code)?.name ?? code ?? "—";

// Chi tiết đơn hàng: thông tin người mua, tiến độ giao hàng, chi phí & doanh thu.
export default function SellerOrderDetailModal({ order, onClose, onRefresh }) {
  const [detail, setDetail] = useState(order);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!order) return;
    setDetail(order);

    const targetId = order.rawId || order.id;
    if (targetId && String(targetId).includes('-') && targetId.length > 20) {
      setLoading(true);
      getSellerOrderDetail(targetId)
        .then((res) => {
          if (res) setDetail(res);
        })
        .finally(() => setLoading(false));
    }
  }, [order]);

  if (!order) return null;

  const currentOrder = detail || order;
  const timeline = orderTimeline(currentOrder.status);
  const shippingFee = currentOrder.shippingFee ?? 0;
  const subtotal = currentOrder.amount ?? 0;
  const revenue = subtotal + shippingFee;

  const handleConfirm = async () => {
    const targetId = currentOrder.rawId || currentOrder.id;
    setProcessing(true);
    try {
      await confirmSellerOrder(targetId);
      toast.success("Đã xác nhận đơn hàng thành công!");
      if (onRefresh) onRefresh();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.detail || err?.message || "Xác nhận đơn hàng thất bại");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    const reason = window.prompt("Nhập lý do từ chối đơn hàng:");
    if (reason === null) return;
    if (!reason.trim()) {
      toast.error("Vui lòng nhập lý do từ chối.");
      return;
    }

    const targetId = currentOrder.rawId || currentOrder.id;
    setProcessing(true);
    try {
      await rejectSellerOrder(targetId, reason.trim());
      toast.success("Đã từ chối đơn hàng thành công!");
      if (onRefresh) onRefresh();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.detail || err?.message || "Từ chối đơn hàng thất bại");
    } finally {
      setProcessing(false);
    }
  };

  const isPending = currentOrder.status === "Pending" || currentOrder.rawStatus === "PENDING";

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
            <h3 id="order-detail-title">Chi tiết đơn hàng {currentOrder.id}</h3>
            <p>Đặt lúc {currentOrder.date}</p>
          </div>
          <span className={`slr-status slr-status--${statusClass(currentOrder.status)}`}>
            {statusLabel(currentOrder.status)}
          </span>
          <button type="button" className="slr-order-modal__close" onClick={onClose} aria-label="Đóng">
            ✕
          </button>
        </header>

        <div className="slr-order-modal__body">
          {loading && <p style={{ padding: "16px", color: "#666" }}>Đang tải chi tiết đơn hàng...</p>}

          <div className="slr-order-detail-grid">
            <section className="slr-order-block">
              <h4>Người mua</h4>
              <dl>
                <div><dt>Khách hàng</dt><dd>{currentOrder.customer}</dd></div>
                <div><dt>Điện thoại</dt><dd>{currentOrder.phone || "—"}</dd></div>
                <div><dt>Địa chỉ</dt><dd>{currentOrder.address || "—"}</dd></div>
              </dl>
            </section>

            <section className="slr-order-block">
              <h4>Vận chuyển</h4>
              <dl>
                <div><dt>Đơn vị</dt><dd>{carrierName(currentOrder.carrier)}</dd></div>
                <div><dt>Mã vận đơn</dt><dd>{currentOrder.tracking || "—"}</dd></div>
                <div><dt>Phí vận chuyển</dt><dd>{formatCurrency(shippingFee)}</dd></div>
              </dl>
            </section>
          </div>

          <section className="slr-order-block">
            <h4>Sản phẩm</h4>
            {Array.isArray(currentOrder.items) && currentOrder.items.length > 0 ? (
              currentOrder.items.map((item, idx) => (
                <div key={item.id || idx} className="slr-order-product" style={{ marginBottom: "8px" }}>
                  <img src={item.image} alt="" />
                  <div>
                    <strong>{item.name}</strong>
                    {item.variant && <span style={{ display: "block", fontSize: "0.8rem", color: "#666" }}>Biến thể: {item.variant}</span>}
                    <span>Số lượng: {item.quantity ?? 1}</span>
                  </div>
                  <span className="slr-order-product__price">{formatCurrency(item.price * (item.quantity || 1))}</span>
                </div>
              ))
            ) : (
              <div className="slr-order-product">
                <img src={currentOrder.image} alt="" />
                <div>
                  <strong>{currentOrder.product}</strong>
                  <span>Số lượng: {currentOrder.qty ?? 1}</span>
                </div>
                <span className="slr-order-product__price">{formatCurrency(subtotal)}</span>
              </div>
            )}
          </section>

          <section className="slr-order-block">
            <h4>Tiến độ giao hàng</h4>
            <ol className="slr-order-timeline">
              {timeline.map((step) => (
                <li key={step.key} className={step.done || step.key === currentOrder.status ? "done" : ""}>
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

        <footer className="slr-order-modal__footer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            {isPending && (
              <>
                <button
                  type="button"
                  className="slr-btn slr-btn--primary"
                  onClick={handleConfirm}
                  disabled={processing}
                  style={{ marginRight: "8px" }}
                >
                  {processing ? "Đang xử lý..." : "Xác nhận đơn hàng"}
                </button>
                <button
                  type="button"
                  className="slr-btn slr-btn--ghost"
                  onClick={handleReject}
                  disabled={processing}
                  style={{ color: "#d9534f" }}
                >
                  Từ chối đơn
                </button>
              </>
            )}
          </div>
          <button type="button" className="slr-btn slr-btn--ghost" onClick={onClose}>
            Đóng
          </button>
        </footer>
      </div>
    </div>
  );
}

