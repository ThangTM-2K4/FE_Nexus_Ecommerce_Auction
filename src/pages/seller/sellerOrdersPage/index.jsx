import { useLocation } from "react-router-dom";
import PageHeader from "../../../components/sellerdashboard/sellerPageHeader";
import KpiCard from "../../../components/sellerdashboard/sellerKpiCard";
import SellerOrderBoard from "../../../components/sellerdashboard/sellerOrderBoard";
import { orderStats, sellerOrders } from "../../../data/sellerMockData";

// Điểm vào từ sidebar quyết định tab mặc định.
const TAB_BY_PATH = {
  "orders-cancelled": "cancelled",
  "orders-returns": "returns",
};

export default function OrdersPage() {
  const { pathname } = useLocation();
  const segment = pathname.split("/").filter(Boolean).pop();
  const initialTab = TAB_BY_PATH[segment] ?? "all";

  return (
    <div className="slr-page">
      <PageHeader
        title="Quản lý đơn hàng"
        subtitle="Theo dõi và thống kê mọi trạng thái đơn hàng, kể cả đơn huỷ và trả hàng/hoàn tiền."
      />

      <section className="slr-section">
        <div className="slr-metrics-grid slr-metrics-grid--4">
          <KpiCard label="Tổng đơn hàng" value={orderStats.total} delay={0} />
          <KpiCard label="Tỷ lệ hoàn thành" value={`${orderStats.completionRate}%`} delay={80} />
          <KpiCard label="Tỷ lệ huỷ" value={`${orderStats.cancelRate}%`} delay={160} />
          <KpiCard
            label="AOV (Giá trị TB đơn)"
            value={orderStats.aov}
            hint="Tổng doanh thu / Tổng đơn hàng"
            highlight
            delay={240}
          />
        </div>

        <div className="slr-panel-card">
          <SellerOrderBoard orders={sellerOrders} exportName="don-hang" initialTab={initialTab} />
        </div>
      </section>
    </div>
  );
}
