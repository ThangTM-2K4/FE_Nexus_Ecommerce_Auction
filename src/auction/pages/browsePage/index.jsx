import { useNavigate } from "react-router-dom";
import AuctionLayout from "../../components/AuctionLayout";
import AuctionCard from "../../components/AuctionCard";
import { ongoingAuctions, watchlistItems } from "../../data/mockData";
import { auctionImages } from "../../data/images";
import AuctionImage from "../../components/AuctionImage";
import "./index.scss";

export default function AuctionBrowsePage() {
  const navigate = useNavigate();

  return (
    <AuctionLayout
      activeTab="buying"
      sidebarActive="watchlist"
      showCategories
    >
      <div className="auc-browse">
        <section
          className="auc-browse__hero"
          style={{ backgroundImage: `url(${auctionImages.hero})` }}
        >
          <div className="auc-browse__hero-overlay" />
          <div className="auc-browse__hero-content">
            <span className="auc-browse__badge">SỰ KIỆN ĐẶC BIỆT</span>
            <h2>Đồng Hồ Sang Trọng & Trang Sức Quý</h2>
            <p>
              Khám phá bộ sưu tập đồng hồ cao cấp và trang sức quý hiếm từ các
              thương hiệu hàng đầu thế giới.
            </p>
            <div className="auc-browse__hero-actions">
              <button
                type="button"
                className="primary"
                onClick={() => navigate("/auction/detail/101")}
              >
                KHÁM PHÁ NGAY
              </button>
              <button type="button" className="ghost">
                XEM LỊCH TRÌNH
              </button>
            </div>
          </div>
        </section>

        <section className="auc-browse__section">
          <div className="auc-browse__section-header">
            <div>
              <h2>Đang Diễn Ra</h2>
              <p>Các phiên đấu giá hot nhất hiện tại</p>
            </div>
            <a href="#">Xem tất cả →</a>
          </div>
          <div className="auc-browse__grid">
            {ongoingAuctions.map((a) => (
              <AuctionCard key={a.id} auction={a} />
            ))}
          </div>
        </section>

        <div className="auc-browse__bottom">
          <section className="auc-browse__cta">
            <h3>Bạn Có Vật Phẩm Muốn Bán?</h3>
            <p>Đăng sản phẩm và bắt đầu đấu giá ngay hôm nay</p>
            <button type="button" onClick={() => navigate("/auction/seller")}>
              BẮT ĐẦU BÁN NGAY
            </button>
          </section>

          <section className="auc-browse__watchlist">
            <h3>ĐANG THEO DÕI</h3>
            <ul>
              {watchlistItems.map((item) => (
                <li key={item.id}>
                  <AuctionImage src={item.image} alt={item.title} />
                  <div>
                    <span className="title">{item.title}</span>
                    <span className={`status status--${item.statusType}`}>
                      {item.status}
                    </span>
                  </div>
                  <span className="price">{item.price}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </AuctionLayout>
  );
}
