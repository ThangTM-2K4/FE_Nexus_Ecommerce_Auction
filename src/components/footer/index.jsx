import './index.scss';
import logoImage from '../../assets/Logo.png';
import { Link } from 'react-router-dom';

const FOOTER_STATS = [
  { value: '10K+', label: 'Phiên đấu giá' },
  { value: '50K+', label: 'Người dùng' },
  { value: '99%', label: 'Giao dịch an toàn' },
];

export default function Footer() {
  return (
    <footer className="footer" id="contact" role="contentinfo">
      <div className="footer-accent-bar" aria-hidden="true" />

      <div className="footer-shell footer-container">
        <section className="footer-brand" aria-labelledby="footer-brand-heading">
          <Link to="/" className="footer-logo" aria-label="Shop Auction — Trang chủ">
            <span className="footer-logo-mark">
              <img className="footer-logo-image" src={logoImage} alt="" />
            </span>
            <span className="footer-logo-text">
              <strong>
                Shop <span className="footer-logo-accent">Auction</span>
              </strong>
              <small>Đấu giá thông minh</small>
            </span>
          </Link>

          <p id="footer-brand-heading">
            Nền tảng đấu giá trực tuyến hiện đại — minh bạch, nhanh chóng và dễ sử dụng
            cho cả người mua lẫn người bán.
          </p>

          <div className="footer-stats" aria-label="Thống kê nền tảng">
            {FOOTER_STATS.map((stat) => (
              <div key={stat.label} className="footer-stat">
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </section>

        <nav className="footer-column" aria-labelledby="footer-discover-heading">
          <h4 id="footer-discover-heading">Khám phá</h4>
          <Link to="/">Trang chủ</Link>
          <a href="#featured">Sản phẩm nổi bật</a>
          <a href="#categories">Danh mục</a>
          <a href="#how-it-works">Hướng dẫn đấu giá</a>
        </nav>

        <nav className="footer-column" aria-labelledby="footer-support-heading">
          <h4 id="footer-support-heading">Hỗ trợ</h4>
          <Link to="/login">Đăng nhập</Link>
          <Link to="/register">Tạo tài khoản</Link>
          <a href="mailto:support@auction.com">support@auction.com</a>
          <a href="tel:+84900000000">+84 900 000 000</a>
        </nav>

        <section className="footer-highlight" aria-labelledby="footer-highlight-heading">
          <span className="footer-badge">🔒 Secure bidding</span>
          <h4 id="footer-highlight-heading">
            Đặt giá tự tin,<br />thắng cuộc dễ dàng.
          </h4>
          <p>
            Hệ thống đấu giá realtime, thông báo tức thì và bảo mật đa lớp
            cho mọi giao dịch.
          </p>
          <div className="footer-social" aria-label="Mạng xã hội">
            <a href="#facebook" aria-label="Facebook">f</a>
            <a href="#instagram" aria-label="Instagram">in</a>
            <a href="#tiktok" aria-label="TikTok">♪</a>
            <a href="#youtube" aria-label="YouTube">▶</a>
          </div>
        </section>
      </div>

      <div className="footer-bottom">
        <div className="footer-shell footer-bottom-shell">
          <span>© 2026 Shop Auction. Tất cả quyền được bảo lưu.</span>
          <span className="footer-regions">
            <a href="#vietnam">Việt Nam</a>
            <a href="#singapore">Singapore</a>
            <a href="#thailand">Thái Lan</a>
            <a href="#indonesia">Indonesia</a>
            <a href="#malaysia">Malaysia</a>
          </span>
        </div>
      </div>
    </footer>
  );
}
