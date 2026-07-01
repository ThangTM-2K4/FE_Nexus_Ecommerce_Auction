import PageHeader from "../../../components/sellerdashboard/sellerPageHeader";
import AnimatedValue from "../../../components/sellerdashboard/sellerAnimatedValue";
import AnimatedBar from "../../../components/sellerdashboard/sellerAnimatedBar";
import KpiCard from "../../../components/sellerdashboard/sellerKpiCard";
import { orderStats, recentOrders, ordersByDay, formatCurrency } from "../../../data/sellerMockData";
import { sellerImages } from "../../../data/sellerImages";

const statusClass = {
  Pending: "pending",
  Confirmed: "confirmed",
  Shipping: "shipping",
  Delivered: "delivered",
  Completed: "completed",
  Cancelled: "cancelled",
  Refunded: "refunded",
};

const statusTranslate = {
  Pending: "Chờ xử lý",
  Confirmed: "Đã xác nhận",
  Shipping: "Đang giao hàng",
  Delivered: "Đã giao hàng",
  Completed: "Hoàn thành",
  Cancelled: "Đã hủy",
  Refunded: "Trả hàng",
};

export default function OrdersPage() {
  const statuses = [
    { label: "Chờ xử lý", value: orderStats.pending },
    { label: "Đã xác nhận", value: orderStats.confirmed },
    { label: "Đang giao", value: orderStats.shipping },
    { label: "Đã giao", value: orderStats.delivered },
    { label: "Hoàn thành", value: orderStats.completed },
    { label: "Đã hủy", value: orderStats.cancelled },
    { label: "Trả hàng", value: orderStats.refunded },
  ];

  const maxOrders = Math.max(...ordersByDay.map((d) => d.orders));

  return (
    <div className="slr-page">
      <PageHeader title="Quản lý đơn hàng" subtitle="Theo dõi trạng thái và hiệu suất đơn hàng" />

      <section className="slr-section">
        <div className="slr-status-grid">
          {statuses.map((s, i) => (
            <div
              key={s.label}
              className="slr-order-pill"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <span>{s.label}</span>
              <strong>
                <AnimatedValue value={s.value} />
              </strong>
            </div>
          ))}
        </div>

        <div className="slr-metrics-grid slr-metrics-grid--4">
          <KpiCard label="Tổng đơn hàng" value={orderStats.total} delay={0} />
          <KpiCard
            label="Tỷ lệ hoàn thành"
            value={`${orderStats.completionRate}%`}
            delay={80}
          />
          <KpiCard label="Tỷ lệ hủy" value={`${orderStats.cancelRate}%`} delay={160} />
          <KpiCard
            label="AOV (Giá trị TB đơn)"
            value={orderStats.aov}
            hint="Tổng doanh thu / Tổng đơn hàng"
            highlight
            delay={240}
          />
        </div>

        <div className="slr-page-split">
          <div className="slr-panel-card">
            <h4>Đơn hàng gần đây</h4>
            <table className="slr-table slr-table--compact">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Sản phẩm</th>
                  <th>Khách hàng</th>
                  <th>Giá trị</th>
                  <th>Trạng thái</th>
                  <th>Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <strong>{o.id}</strong>
                    </td>
                    <td>
                      <div className="slr-product-cell">
                        <img src={o.image} alt="" />
                        <span>{o.product}</span>
                      </div>
                    </td>
                    <td>{o.customer}</td>
                    <td>{formatCurrency(o.amount)}</td>
                    <td>
                      <span className={`slr-status slr-status--${statusClass[o.status]}`}>
                        {statusTranslate[o.status] || o.status}
                      </span>
                    </td>
                    <td className="muted">{o.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <aside className="slr-aside-panel">
            <div className="slr-media-card slr-media-card--banner">
              <img src={sellerImages.createBg} alt="" />
              <div className="slr-media-card__overlay">
                <strong>254 đơn tuần này</strong>
                <span>+18% so với tuần trước</span>
              </div>
            </div>
            <div className="slr-panel-card">
              <h4>Đơn hàng theo ngày</h4>
              <div className="slr-bar-chart">
                {ordersByDay.map((d, i) => (
                  <div key={d.day} className="slr-bar-chart__item">
                    <span className="label">{d.day}</span>
                    <div className="bar-wrap">
                      <AnimatedBar percent={(d.orders / maxOrders) * 100} delay={i * 60} />
                    </div>
                    <span className="val">{d.orders}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
