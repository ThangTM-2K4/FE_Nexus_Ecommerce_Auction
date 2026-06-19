import StatCard from "../../../components/seller/sellerStatCard";
import AnimatedValue from "../../../components/seller/sellerAnimatedValue";
import {
  overviewStats,
  revenueSummary,
  orderStats,
  productStats,
  customerStats,
} from "../../../data/sellerMockData";

export default function OverviewPage() {
  return (
    <div className="slr-page slr-dashboard">
      <div className="slr-dashboard__hero">
        <div>
          <span className="slr-dashboard__kicker">Bảng điều khiển người bán</span>
          <h1>Tổng quan kinh doanh</h1>
          <p>Theo dõi doanh thu, đơn hàng, sản phẩm và hiệu quả bán hàng theo thời gian thực.</p>
        </div>
        <div className="slr-dashboard__hero-cards">
          <div>
            <small>Doanh thu</small>
            <strong><AnimatedValue value={revenueSummary.netRevenue} /></strong>
          </div>
          <div>
            <small>Đơn hàng</small>
            <strong><AnimatedValue value={orderStats.total} /></strong>
          </div>
          <div>
            <small>Sản phẩm</small>
            <strong><AnimatedValue value={productStats.total} /></strong>
          </div>
          <div>
            <small>Khách hàng</small>
            <strong><AnimatedValue value={customerStats.total} /></strong>
          </div>
          <div>
            <small>Chuyển đổi</small>
            <strong><AnimatedValue value="4.8%" /></strong>
          </div>
        </div>
      </div>

      <section className="slr-section">
        <header className="slr-section__header">
          <div>
            <h2>Thông tin tổng quan</h2>
            <p>Các chỉ số chính của cửa hàng</p>
          </div>
        </header>
        <div className="slr-stat-grid">
          {overviewStats.map((s, i) => (
            <StatCard key={s.id} {...s} delay={i * 45} />
          ))}
        </div>
      </section>
    </div>
  );
}
