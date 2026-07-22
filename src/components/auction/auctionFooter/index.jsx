import { Link } from 'react-router-dom';
import './index.scss';

const FOOTER_STATS = [
  { value: '2.4K+', label: 'Phiên đang mở' },
  { value: '18K+', label: 'Người tham gia' },
  { value: '100%', label: 'Minh bạch giá' },
];

export default function AuctionFooter() {
  return (
    <footer className="auction-footer" role="contentinfo">
      <div className="auction-footer__accent" aria-hidden />
      <div className="auction-footer__inner">
        <section className="auction-footer__brand">
          <Link to="/auction" className="auction-footer__logo" aria-label="BidDoubleTK — Khu đấu giá">
            <img src="/images/logo/logo.png" alt="BidDoubleTK" />
            <span>
              <strong>
                Bid<span>DoubleTK</span> <span className="auction-tag" style={{ fontSize: '10px', color: '#E8C468', marginLeft: '4px', verticalAlign: 'middle', textTransform: 'uppercase' }}>Auction</span>
              </strong>
              <small>Sàn đấu giá đa danh mục</small>
            </span>
          </Link>
          <p>
            Nền tảng đấu giá trực tuyến cho điện tử, đồng hồ, xe cộ, nghệ thuật và nhiều hơn nữa —
            minh bạch, realtime, an toàn.
          </p>
          <div className="auction-footer__stats" aria-label="Thống kê đấu giá">
            {FOOTER_STATS.map((stat) => (
              <div key={stat.label}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </section>

        <nav className="auction-footer__column" aria-labelledby="auction-footer-explore">
          <h4 id="auction-footer-explore">Khám phá</h4>
          <Link to="/auction">Phiên đang diễn ra</Link>
          <a href="#categories">Danh mục sản phẩm</a>
          <a href="#how-it-works">Hướng dẫn đấu giá</a>
          <Link to="/">Cửa hàng chính</Link>
        </nav>

        <nav className="auction-footer__column" aria-labelledby="auction-footer-support">
          <h4 id="auction-footer-support">Hỗ trợ</h4>
          <Link to="/login">Đăng nhập</Link>
          <Link to="/register">Tạo tài khoản</Link>
          <a href="mailto:auction@biddoubletk.com">auction@biddoubletk.com</a>
          <a href="tel:+84900000000">+84 900 000 000</a>
        </nav>
      </div>

      <div className="auction-footer__bottom">
        <span>© {new Date().getFullYear()} BidDoubleTK Auction. Bảo lưu mọi quyền.</span>
        <span className="auction-footer__live-badge">ĐẤU GIÁ TRỰC TIẾP</span>
      </div>
    </footer>
  );
}
