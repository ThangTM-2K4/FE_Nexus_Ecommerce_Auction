import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaHeart, FaCheckCircle, FaClock, FaGavel, FaArrowLeft,
} from "react-icons/fa";
import { toast } from "react-toastify";
import AuctionImage from "../../../components/auction/auctionImage";
import { getAuctionDetail } from "../../../data/auctionMockData";
import "./index.scss";

export default function AuctionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = getAuctionDetail(Number(id));
  const [selectedImage, setSelectedImage] = useState(0);
  const [liked, setLiked] = useState(false);
  const [bidAmount, setBidAmount] = useState("");

  if (!product) {
    return (
      <div className="auc-detail auc-detail--empty">
        <p>Không tìm thấy phiên đấu giá này.</p>
        <button type="button" onClick={() => navigate("/auction")}>Quay lại danh sách</button>
      </div>
    );
  }

  const minBid = product.currentPrice
    ? Number(String(product.currentPrice).replace(/[^0-9]/g, "")) + 500000
    : 500000;

  const handleBid = () => {
    const amount = Number(String(bidAmount).replace(/[^0-9]/g, ""));
    if (!bidAmount || amount < minBid) {
      toast.error(`Giá thầu tối thiểu là ${minBid.toLocaleString("vi-VN")} ₫`);
      return;
    }
    toast.success(`🎉 Đặt giá ${amount.toLocaleString("vi-VN")} ₫ thành công!`);
  };

  return (
    <div className="auc-detail">
      <nav className="auc-detail__breadcrumbs">
        <button type="button" className="auc-detail__back" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Quay lại
        </button>
        {product.breadcrumbs.map((crumb, i) => (
          <span key={crumb}>{i > 0 && " / "}{crumb}</span>
        ))}
      </nav>

        <div className="auc-detail__grid">
          <div className="auc-detail__gallery">
            <div className="auc-detail__main-image">
              <AuctionImage
                src={product.images[selectedImage]}
                alt={product.title}
              />
              <span className="auc-detail__badge">{product.badge}</span>
            </div>

            <div className="auc-detail__thumbs">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  className={selectedImage === i ? "active" : ""}
                  onClick={() => setSelectedImage(i)}
                >
                  <AuctionImage src={img} alt={`Thumb ${i + 1}`} />
                </button>
              ))}
            </div>

            <section className="auc-detail__specs">
              <h3>Chi tiết sản phẩm</h3>
              <p>{product.description}</p>
              <div className="auc-detail__specs-grid">
                <div><span>THƯƠNG HIỆU</span><strong>{product.specs.brand}</strong></div>
                <div><span>TÌNH TRẠNG</span><strong>{product.specs.condition}</strong></div>
                <div><span>LOẠI MÁY</span><strong>{product.specs.movement}</strong></div>
                <div><span>NĂM SẢN XUẤT</span><strong>{product.specs.year}</strong></div>
              </div>
            </section>
          </div>

          <aside className="auc-detail__sidebar">
            <div className="auc-detail__card">
              <div className="auc-detail__title-row">
                <h1>{product.title}</h1>
                <button type="button" className={liked ? "liked" : ""} onClick={() => setLiked(l => !l)}><FaHeart /></button>
              </div>
              <div className="auc-detail__seller">
                <AuctionImage
                  src={product.sellerAvatar}
                  alt={product.seller}
                  className="auc-detail__seller-avatar"
                />
                <div>
                  <span>NGƯỜI BÁN UY TÍN</span>
                  <strong>
                    {product.seller}
                    {product.sellerVerified && <FaCheckCircle />}
                  </strong>
                </div>
              </div>
            </div>

            <div className="auc-detail__card auc-detail__card--bid">
              <span className="label">GIÁ HIỆN TẠI</span>
              <div className="price">{product.currentPrice}</div>

              <div className="leader">
                <span>NGƯỜI DẪN ĐẦU</span>
                <div className="leader-badge">
                  <AuctionImage
                    src={product.leaderAvatar}
                    alt={product.leader}
                    className="leader-avatar"
                  />
                  {product.leader}
                </div>
              </div>

              <div className="timer">
                <span><FaClock /> THỜI GIAN CÒN LẠI</span>
                <strong>{product.timeLeft}</strong>
                <div className="timer-bar"><div style={{ width: "65%" }} /></div>
              </div>

              <div className="bid-form">
                <label>ĐẶT GIÁ THẦU CỦA BẠN</label>
                <div className="bid-input">
                  <span>₫</span>
                  <input
                    type="number"
                    placeholder={`Tối thiểu ${minBid.toLocaleString("vi-VN")}`}
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                  />
                </div>
                <div className="increments">
                  {[500000, 1000000, 5000000].map((inc) => (
                    <button
                      key={inc}
                      type="button"
                      onClick={() =>
                        setBidAmount(String((Number(bidAmount) || minBid) + inc))
                      }
                    >
                      +{(inc / 1000000).toFixed(inc < 1000000 ? 1 : 0)}M
                    </button>
                  ))}
                </div>
                <button type="button" className="confirm-btn" onClick={handleBid}>
                  <FaGavel /> Xác Nhận Đặt Giá
                </button>
                <p className="disclaimer">
                  Bằng việc đặt giá, bạn đồng ý với điều khoản đấu giá
                </p>
              </div>
            </div>

            <div className="auc-detail__card">
              <div className="history-header">
                <h3>LỊCH SỬ ĐẤU GIÁ ({product.bidHistory.length})</h3>
                <a href="#">Xem tất cả</a>
              </div>
              <ul className="history-list">
                {product.bidHistory.map((bid, i) => (
                  <li key={i} className={bid.isLeader ? "leader" : ""}>
                    <div className="history-user">
                      <AuctionImage
                        src={bid.avatar}
                        alt={bid.user}
                        className="history-avatar"
                      />
                      <div>
                        <strong>{bid.user}</strong>
                        <span>{bid.time}</span>
                      </div>
                    </div>
                    <em>{bid.amount}</em>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
  );
}

