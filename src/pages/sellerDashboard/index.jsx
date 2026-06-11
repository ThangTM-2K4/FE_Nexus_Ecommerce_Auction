import Header from '../../components/header';
import Footer from '../../components/footer';
import { useAuth } from '../../context/AuthContext';
import './index.scss';

function SellerDashboard() {
  const { user } = useAuth();

  return (
    <div className="seller-dashboard">
      <Header />
      <main className="seller-dashboard-main">
        <div className="seller-dashboard-hero">
          <span className="seller-dashboard-badge">✓ Người bán đã xác minh</span>
          <h1>Seller Dashboard</h1>
          <p>Chào mừng, {user?.fullName}. Quản lý cửa hàng và phiên đấu giá của bạn.</p>
        </div>

        <div className="seller-dashboard-grid">
          <div className="seller-dashboard-card">
            <h3>Phiên đấu giá</h3>
            <p className="seller-dashboard-stat">3</p>
            <small>Đang diễn ra</small>
          </div>
          <div className="seller-dashboard-card">
            <h3>Đơn hàng</h3>
            <p className="seller-dashboard-stat">12</p>
            <small>Tháng này</small>
          </div>
          <div className="seller-dashboard-card">
            <h3>Doanh thu</h3>
            <p className="seller-dashboard-stat">45.2M</p>
            <small>VND (mock)</small>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default SellerDashboard;
