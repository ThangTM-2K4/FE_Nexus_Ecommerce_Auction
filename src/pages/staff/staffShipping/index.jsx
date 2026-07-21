import { useEffect, useMemo, useState } from "react";
import StaffPageHeader from "../../../components/staff/staffPageHeader";
import {
  getStaffShipments,
  getStaffShippingZones,
  getShippingQuote,
} from "../../../services/staffService";
import Select from "../../../components/common/select";
import "./index.scss";

const formatVnd = (n) => `${Number(n).toLocaleString("vi-VN")}đ`;

const StaffShipping = () => {
  const [shipments, setShipments] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [zoneId, setZoneId] = useState("");
  const [weightKg, setWeightKg] = useState("1");
  const [quote, setQuote] = useState(null);
  const [quoting, setQuoting] = useState(false);

  useEffect(() => {
    Promise.all([getStaffShipments(), getStaffShippingZones()]).then(([s, z]) => {
      setShipments(s);
      setZones(z);
      if (z.length) setZoneId(z[0].id);
      setLoading(false);
    });
  }, []);

  const zoneOptions = useMemo(
    () => zones.map((z) => ({ value: z.id, label: `${z.name} — ${formatVnd(z.baseFee)}` })),
    [zones]
  );

  const stats = useMemo(
    () => ({
      total: shipments.length,
      delivering: shipments.filter((s) => s.status === "Đang giao").length,
      delivered: shipments.filter((s) => s.status === "Đã giao").length,
    }),
    [shipments]
  );

  const handleQuote = async () => {
    if (!zoneId) return;
    setQuoting(true);
    const result = await getShippingQuote({ zoneId, weightKg: Number(weightKg) || 1 });
    setQuote(result);
    setQuoting(false);
  };

  return (
    <div className="stf-shipping">
      <StaffPageHeader
        kicker="Tra cứu"
        title="Vận chuyển"
        subtitle="Xem thông tin lô hàng và báo giá shipping — không được tạo hoặc cập nhật shipment."
      />

      <section className="stf-shipping__quote">
        <h3>Báo giá Shipping</h3>
        <div className="stf-shipping__quote-form">
          <Select
            label="Khu vực"
            value={zoneId}
            onChange={(e) => setZoneId(e.target.value)}
            options={zoneOptions}
            placeholder="Chọn khu vực"
          />
          <label>
            Khối lượng (kg)
            <input type="number" min="0.1" step="0.1" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} />
          </label>
          <button type="button" onClick={handleQuote} disabled={quoting}>
            {quoting ? "Đang tính..." : "Tính phí"}
          </button>
        </div>
        {quote && (
          <div className="stf-shipping__quote-result">
            <p><strong>{quote.zone}</strong> · Giao {quote.estimatedDays}</p>
            <ul>
              <li>Phí cơ bản: {formatVnd(quote.baseFee)}</li>
              <li>Phí khối lượng: {formatVnd(quote.weightFee)}</li>
              <li><strong>Tổng: {formatVnd(quote.totalFee)}</strong></li>
            </ul>
          </div>
        )}
      </section>

      <section className="stf-shipping__list">
        <header>
          <h3>Danh sách Shipment</h3>
          <span>{stats.total} lô · {stats.delivering} đang giao · {stats.delivered} đã giao</span>
        </header>

        {loading ? (
          <p className="stf-shipping__empty">Đang tải...</p>
        ) : (
          <div className="stf-shipping__table-wrap">
            <table className="stf-shipping__table">
              <thead>
                <tr>
                  <th>Mã SHP</th>
                  <th>Đơn hàng</th>
                  <th>Đơn vị VC</th>
                  <th>Mã vận đơn</th>
                  <th>Từ → Đến</th>
                  <th>Phí</th>
                  <th>Trạng thái</th>
                  <th>Dự kiến giao</th>
                </tr>
              </thead>
              <tbody>
                {shipments.map((s) => (
                  <tr key={s.id}>
                    <td><code>{s.id}</code></td>
                    <td>{s.orderId}</td>
                    <td>{s.carrier}</td>
                    <td>{s.trackingCode}</td>
                    <td><small>{s.from} → {s.to}</small></td>
                    <td>{formatVnd(s.fee)}</td>
                    <td><span className="stf-shipping__status">{s.status}</span></td>
                    <td>{s.estimatedDelivery}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default StaffShipping;
