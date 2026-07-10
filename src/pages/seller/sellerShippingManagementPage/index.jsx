import PageHeader from "../../../components/sellerdashboard/sellerPageHeader";
import KpiCard from "../../../components/sellerdashboard/sellerKpiCard";
import SellerOrderBoard from "../../../components/sellerdashboard/sellerOrderBoard";
import { sellerOrders } from "../../../data/sellerMockData";

const countBy = (statuses) => sellerOrders.filter((o) => statuses.includes(o.status)).length;

export default function ShippingManagementPage() {
  const awaiting = countBy(["Confirmed", "AwaitingPickup"]);
  const inTransit = countBy(["Shipping"]);
  const delivered = countBy(["Delivered", "Completed"]);

  return (
    <div className="slr-page">
      <PageHeader
        title="Quản lý vận chuyển"
        subtitle="Theo dõi tiến độ giao hàng từ lúc xác nhận đến khi hoàn tất — nhấn vào đơn để xem chi tiết."
      />

      <section className="slr-section">
        <div className="slr-metrics-grid slr-metrics-grid--4">
          <KpiCard label="Chờ lấy hàng" value={awaiting} delay={0} />
          <KpiCard label="Đang giao" value={inTransit} delay={80} highlight />
          <KpiCard label="Đã giao" value={delivered} delay={160} />
          <KpiCard label="Tổng đơn hàng" value={sellerOrders.length} delay={240} />
        </div>

        <div className="slr-panel-card">
          <SellerOrderBoard orders={sellerOrders} exportName="van-chuyen" initialTab="pickup" />
        </div>
      </section>
    </div>
  );
}
