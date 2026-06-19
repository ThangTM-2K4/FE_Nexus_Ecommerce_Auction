import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  FaHeart, FaCheckCircle, FaClock, FaGavel,
} from "react-icons/fa";
import AuctionLayout from "../../../components/auction/auctionLayout";
import AuctionImage from "../../../components/auction/auctionImage";
import { getAuctionDetail } from "../../../data/auctionMockData";
import "./index.scss";

export default function AuctionDetailPage() {
  const { id } = useParams();
  const product = getAuctionDetail(Number(id));
  const [selectedImage, setSelectedImage] = useState(0);
  const [bidAmount, setBidAmount] = useState("143000");

  return (
    <AuctionLayout showSidebar={false} activeTab="buying">
      <div className="auc-detail">
        <nav className="auc-detail__breadcrumbs">
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
                <button type="button"><FaHeart /></button>
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
                  <span>$</span>
                  <input
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                  />
                </div>
                <div className="increments">
                  {["500", "1000", "5000"].map((inc) => (
                    <button
                      key={inc}
                      type="button"
                      onClick={() =>
                        setBidAmount(String(Number(bidAmount) + Number(inc)))
                      }
                    >
                      +{inc}
                    </button>
                  ))}
                </div>
                <button type="button" className="confirm-btn">
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
    </AuctionLayout>
  );
}

