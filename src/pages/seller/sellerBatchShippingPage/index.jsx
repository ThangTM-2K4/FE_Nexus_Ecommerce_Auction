import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import PageHeader from "../../../components/sellerdashboard/sellerPageHeader";
import { sellerOrders, shippingCarriers, formatCurrency } from "../../../data/sellerMockData";
import { statusLabel } from "../../../utils/sellerOrderStatus";
import { exportCsv, todayStamp } from "../../../utils/exportCsv";

// Đơn sẵn sàng xử lý loạt: đã xác nhận hoặc chờ lấy hàng.
const READY_STATUSES = ["Confirmed", "AwaitingPickup"];

const PICKUP_METHODS = [
  { id: "post-office", label: "Gửi tại bưu cục", desc: "Bạn tự mang hàng đến bưu cục của đơn vị vận chuyển." },
  { id: "pickup", label: "Shipper tới lấy hàng", desc: "Yêu cầu shipper đến địa chỉ Shop lấy toàn bộ kiện hàng." },
];

const carrierName = (code) =>
  shippingCarriers.find((c) => c.code === code)?.name ?? code ?? "—";

export default function BatchShippingPage() {
  const readyOrders = useMemo(
    () => sellerOrders.filter((o) => READY_STATUSES.includes(o.status)),
    []
  );

  const [carrierFilter, setCarrierFilter] = useState("all");
  const [pickupMethod, setPickupMethod] = useState("pickup");
  const [selectedIds, setSelectedIds] = useState([]);

  const visible = useMemo(
    () => (carrierFilter === "all" ? readyOrders : readyOrders.filter((o) => o.carrier === carrierFilter)),
    [readyOrders, carrierFilter]
  );

  const selectedOrders = readyOrders.filter((o) => selectedIds.includes(o.id));
  const allVisibleSelected = visible.length > 0 && visible.every((o) => selectedIds.includes(o.id));

  const toggleOne = (id) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const toggleAll = () => {
    if (allVisibleSelected) {
      setSelectedIds((prev) => prev.filter((id) => !visible.some((o) => o.id === id)));
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...visible.map((o) => o.id)])]);
    }
  };

  // Chỉ cho gộp các đơn cùng một đơn vị vận chuyển.
  const distinctCarriers = [...new Set(selectedOrders.map((o) => o.carrier))];
  const sameCarrier = distinctCarriers.length <= 1;

  const handleConfirm = () => {
    if (selectedOrders.length === 0) {
      toast.warn("Hãy chọn ít nhất một đơn hàng");
      return;
    }
    if (!sameCarrier) {
      toast.error("Chỉ có thể xử lý loạt các đơn cùng một đơn vị vận chuyển");
      return;
    }
    const method = PICKUP_METHODS.find((m) => m.id === pickupMethod);
    // Xuất phiếu gửi hàng loạt (giả lập in hàng loạt bằng file CSV).
    const headers = ["Mã đơn", "Khách hàng", "Địa chỉ", "Sản phẩm", "Đơn vị VC", "Mã vận đơn", "Hình thức lấy hàng"];
    const rows = selectedOrders.map((o) => [
      o.id, o.customer, o.address, o.product, carrierName(o.carrier), o.tracking, method.label,
    ]);
    exportCsv(`phieu-gui-hang-loat-${todayStamp()}.csv`, headers, rows);
    toast.success(`Đã xác nhận & in ${selectedOrders.length} phiếu — ${method.label}`);
    setSelectedIds([]);
  };

  return (
    <div className="slr-page">
      <PageHeader
        title="Giao hàng loạt"
        subtitle="Xử lý nhiều đơn cùng một đơn vị vận chuyển: xác nhận, in phiếu và chọn hình thức lấy hàng một lần."
      />

      <section className="slr-section">
        <div className="slr-panel-card">
          <div className="slr-toolbar">
            <div className="slr-filter-tabs">
              <button
                type="button"
                className={`slr-filter-tab ${carrierFilter === "all" ? "active" : ""}`}
                onClick={() => setCarrierFilter("all")}
              >
                Tất cả đơn vị
              </button>
              {shippingCarriers.map((c) => {
                const n = readyOrders.filter((o) => o.carrier === c.code).length;
                if (n === 0) return null;
                return (
                  <button
                    key={c.code}
                    type="button"
                    className={`slr-filter-tab ${carrierFilter === c.code ? "active" : ""}`}
                    onClick={() => setCarrierFilter(c.code)}
                  >
                    {c.name} <em>{n}</em>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="slr-table-wrap">
            <table className="slr-table slr-table--compact">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>
                    <input type="checkbox" checked={allVisibleSelected} onChange={toggleAll} aria-label="Chọn tất cả" />
                  </th>
                  <th>Mã đơn</th>
                  <th>Sản phẩm</th>
                  <th>Khách hàng</th>
                  <th>Đơn vị VC</th>
                  <th>Giá trị</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((o) => (
                  <tr key={o.id} className={selectedIds.includes(o.id) ? "slr-row-selected" : ""}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(o.id)}
                        onChange={() => toggleOne(o.id)}
                        aria-label={`Chọn ${o.id}`}
                      />
                    </td>
                    <td><strong>{o.id}</strong></td>
                    <td>
                      <div className="slr-product-cell">
                        <img src={o.image} alt="" />
                        <span>{o.product}</span>
                      </div>
                    </td>
                    <td>{o.customer}</td>
                    <td>{carrierName(o.carrier)}</td>
                    <td>{formatCurrency(o.amount)}</td>
                    <td><span className="slr-badge slr-badge--warning">{statusLabel(o.status)}</span></td>
                  </tr>
                ))}
                {visible.length === 0 && (
                  <tr>
                    <td colSpan={7} className="muted" style={{ textAlign: "center", padding: "24px" }}>
                      Không có đơn nào sẵn sàng giao ở đơn vị này.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="slr-panel-card">
          <h4>Hình thức lấy hàng</h4>
          <div className="slr-pickup-options">
            {PICKUP_METHODS.map((m) => (
              <label
                key={m.id}
                className={`slr-pickup-option ${pickupMethod === m.id ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name="pickup"
                  checked={pickupMethod === m.id}
                  onChange={() => setPickupMethod(m.id)}
                />
                <div>
                  <strong>{m.label}</strong>
                  <small>{m.desc}</small>
                </div>
              </label>
            ))}
          </div>

          <div className="slr-batch-footer">
            <div className="slr-batch-summary">
              <span>Đã chọn <strong>{selectedOrders.length}</strong> đơn</span>
              {!sameCarrier && (
                <em className="slr-batch-warn">Các đơn phải cùng một đơn vị vận chuyển</em>
              )}
            </div>
            <button
              type="button"
              className="slr-btn slr-btn--primary"
              onClick={handleConfirm}
              disabled={selectedOrders.length === 0 || !sameCarrier}
            >
              Xác nhận & In phiếu ({selectedOrders.length})
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
