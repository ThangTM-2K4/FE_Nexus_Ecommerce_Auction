import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuctionLayout from "../../../components/auction/auctionLayout";
import AuctionCard from "../../../components/auction/auctionCard";
import { ongoingAuctions, watchlistItems } from "../../../data/auctionMockData";
import { auctionImages } from "../../../data/auctionImages";
import AuctionImage from "../../../components/auction/auctionImage";
import { toast } from "react-toastify";
import { useAuth } from "../../../context/AuthContext";
import "./index.scss";

export default function AuctionBrowsePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isApprovedSeller, isSellerMode, switchAccountMode } =
    useAuth();

  const sidebarActive =
    location.hash === "#watchlist" ? "watchlist" : "browse";

  useEffect(() => {
    if (location.hash !== "#watchlist") return;
    const el = document.getElementById("watchlist");
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [location.hash]);

  const handleSellerCta = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (!isApprovedSeller) {
      navigate("/profile/become-seller");
      return;
    }
    if (!isSellerMode) {
      try {
        await switchAccountMode("SELLER");
      } catch {
        toast.error("Không thể chuyển sang hồ sơ Người bán");
        return;
      }
    }
    navigate("/auction/seller");
    toast.success("Đã chuyển sang hồ sơ Người bán");
  };

  return (
    <AuctionLayout
      activeTab="buying"
      sidebarActive={sidebarActive}
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
          {isApprovedSeller && isSellerMode ? (
            <section className="auc-browse__cta">
              <h3>Quản Lý Phiên Đấu Giá</h3>
              <p>Tạo phiên mới hoặc theo dõi các đấu giá đang bán</p>
              <button type="button" onClick={() => navigate("/auction/seller")}>
                VÀO KÊNH BÁN
              </button>
            </section>
          ) : (
            <section className="auc-browse__cta">
              <h3>Bạn Có Vật Phẩm Muốn Bán?</h3>
              <p>Đăng sản phẩm và bắt đầu đấu giá ngay hôm nay</p>
              <button type="button" onClick={handleSellerCta}>
                {!isAuthenticated
                  ? "ĐĂNG NHẬP ĐỂ BÁN"
                  : isApprovedSeller
                    ? "CHUYỂN SANG HỒ SƠ BÁN"
                    : "ĐĂNG KÝ LÀM NGƯỜI BÁN"}
              </button>
            </section>
          )}

          <section id="watchlist" className="auc-browse__watchlist">
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

