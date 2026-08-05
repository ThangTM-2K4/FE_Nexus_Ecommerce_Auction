import { Link } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';
import './index.scss';

export default function AuctionIntroBanner() {
  return (
    <section className="auction-intro-banner" id="how-it-works" aria-labelledby="auction-intro-title">
      <div className="auction-intro-banner__text">
        <h2 id="auction-intro-title">Bạn mới dùng đấu giá?</h2>
        <p>Tìm hiểu cách hoạt động — đặt giá, theo dõi phiên trực tiếp và nhận thông báo khi bị vượt.</p>
      </div>
      <Link to="/auction/how-it-works" className="auction-intro-banner__cta">
        Tìm hiểu cách hoạt động <FaArrowRight style={{ marginLeft: 6, fontSize: 12 }} />
      </Link>
    </section>
  );
}

