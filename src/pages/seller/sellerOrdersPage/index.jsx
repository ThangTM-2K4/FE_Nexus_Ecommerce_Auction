import { useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import PageHeader from "../../../components/sellerdashboard/sellerPageHeader";
import KpiCard from "../../../components/sellerdashboard/sellerKpiCard";
import SellerOrderBoard from "../../../components/sellerdashboard/sellerOrderBoard";
import { orderStats as mockOrderStats, sellerOrders as mockSellerOrders, formatCurrency } from "../../../data/sellerMockData";
import { getSellerOrders } from "../../../services/sellerOrderService";

// Điểm vào từ sidebar quyết định tab mặc định.
const TAB_BY_PATH = {
  "orders-cancelled": "cancelled",
  "orders-returns": "returns",
};

export default function OrdersPage() {
  const { pathname } = useLocation();
  const segment = pathname.split("/").filter(Boolean).pop();
  const initialTab = TAB_BY_PATH[segment] ?? "all";

  const [orders, setOrders] = useState(mockSellerOrders);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    setLoading(true);
    const apiOrders = await getSellerOrders();
    if (Array.isArray(apiOrders) && apiOrders.length > 0) {
      setOrders(apiOrders);
    } else {
      setOrders(mockSellerOrders);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const stats = useMemo(() => {
    if (!orders || orders.length === 0) return mockOrderStats;

    const total = orders.length;
    const completed = orders.filter((o) => o.status === "Completed" || o.status === "Delivered").length;
    const cancelled = orders.filter((o) => o.status === "Cancelled").length;

    const completionRate = Math.round((completed / total) * 100 * 10) / 10;
    const cancelRate = Math.round((cancelled / total) * 100 * 10) / 10;

    const totalRevenue = orders.reduce((sum, o) => sum + (o.amount || 0), 0);
    const aovNum = total > 0 ? Math.round(totalRevenue / total) : 0;

    return {
      total,
      completionRate,
      cancelRate,
      aov: formatCurrency(aovNum),
    };
  }, [orders]);

  return (
    <div className="slr-page">
      <PageHeader
        title="Quản lý đơn hàng"
        subtitle="Theo dõi và thống kê mọi trạng thái đơn hàng, kể cả đơn huỷ và trả hàng/hoàn tiền."
      />

      <section className="slr-section">
        <div className="slr-metrics-grid slr-metrics-grid--4">
          <KpiCard label="Tổng đơn hàng" value={stats.total} delay={0} />
          <KpiCard label="Tỷ lệ hoàn thành" value={`${stats.completionRate}%`} delay={80} />
          <KpiCard label="Tỷ lệ huỷ" value={`${stats.cancelRate}%`} delay={160} />
          <KpiCard
            label="AOV (Giá trị TB đơn)"
            value={stats.aov}
            hint="Tổng doanh thu / Tổng đơn hàng"
            highlight
            delay={240}
          />
        </div>

        <div className="slr-panel-card">
          <SellerOrderBoard
            orders={orders}
            exportName="don-hang"
            initialTab={initialTab}
            loading={loading}
            onRefresh={loadOrders}
          />
        </div>
      </section>
    </div>
  );
}

