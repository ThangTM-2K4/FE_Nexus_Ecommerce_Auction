import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaHeart, FaCheckCircle, FaClock, FaGavel, FaArrowLeft, FaShieldAlt, FaExclamationTriangle, FaTimes,
} from "react-icons/fa";
import { toast } from "react-toastify";
import AuctionImage from "../../../components/auction/auctionImage";
import { getAuctionDetail } from "../../../data/auctionMockData";
import { useAuth } from "../../../context/AuthContext";
import "./index.scss";

export default function AuctionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isSellerMode } = useAuth();
  const product = getAuctionDetail(id);
  const [selectedImage, setSelectedImage] = useState(0);
  const [liked, setLiked] = useState(false);
  const [bidAmount, setBidAmount] = useState("");

  const [showRegModal, setShowRegModal] = useState(false);
  const [regStep, setRegStep] = useState(1);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("wallet");
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  const handleOpenRegistration = () => {
    if (!user) {
      toast.info("Vui lòng đăng nhập để đăng ký tham gia đấu giá!");
      navigate("/login");
      return;
    }
    const isEmailOk = user.isEmailVerified ?? true;
    const isPhoneOk = user.isPhoneVerified ?? false;
    const isKycOk = user.isNationalIdVerified ?? false;

    if (!isEmailOk || !isPhoneOk || !isKycOk) {
      setRegStep(1);
    } else {
      setRegStep(2);
    }
    setShowRegModal(true);
  };

  const handleConfirmRegistration = async () => {
    if (!agreeTerms) {
      toast.error("Vui lòng tích chọn đồng ý với Quy chế & Điều khoản đặt cọc!");
      return;
    }
    try {
      setIsRegistering(true);
      await new Promise((r) => setTimeout(r, 1000));
      setIsRegistered(true);
      setShowRegModal(false);
      toast.success("🎉 Đăng ký & Đặt cọc tham gia đấu giá thành công!");
    } catch {
      toast.error("Đăng ký thất bại, vui lòng thử lại!");
    } finally {
      setIsRegistering(false);
    }
  };

  if (!product) {
    return (
      <div className="auc-detail auc-detail--empty">
        <p>Không tìm thấy phiên đấu giá này.</p>
        <button type="button" onClick={() => navigate("/auction")}>Quay lại danh sách</button>
      </div>
    );
  }

  const isUsd = String(product.currentPrice).includes("$");

  const minBid = product.currentPrice
    ? Number(String(product.currentPrice).replace(/[^0-9]/g, "")) + (isUsd ? 500 : 500000)
    : (isUsd ? 500 : 500000);

  const increments = isUsd
    ? [
        { value: 500, label: "+$500" },
        { value: 1000, label: "+$1K" },
        { value: 5000, label: "+$5K" },
      ]
    : [
        { value: 500000, label: "+500K" },
        { value: 1000000, label: "+1M" },
        { value: 5000000, label: "+5M" },
      ];

  const handleIncrement = (incValue) => {
    const currentVal = bidAmount
      ? Number(bidAmount.replace(/[^0-9]/g, ""))
      : minBid;
    const newVal = currentVal + incValue;
    setBidAmount(newVal.toLocaleString(isUsd ? "en-US" : "vi-VN"));
  };

  const handleBid = () => {
    const amount = Number(String(bidAmount).replace(/[^0-9]/g, ""));
    if (!bidAmount || amount < minBid) {
      toast.error(
        `Giá thầu tối thiểu là ${isUsd ? "$" : ""}${minBid.toLocaleString(isUsd ? "en-US" : "vi-VN")}${isUsd ? "" : " ₫"}`
      );
      return;
    }
    toast.success(
      `🎉 Đặt giá ${isUsd ? "$" : ""}${amount.toLocaleString(isUsd ? "en-US" : "vi-VN")}${isUsd ? "" : " ₫"} thành công!`
    );
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
              <div 
                className="auc-detail__seller" 
                onClick={() => navigate(`/auction/profile?seller=${encodeURIComponent(product.seller)}`)}
                style={{ cursor: 'pointer' }}
                title="Xem hồ sơ người bán"
              >
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

              {isSellerMode ? null : product.isUpcoming ? (
                <div className="bid-form">
                  <label>ĐĂNG KÝ THAM GIA ĐẤU GIÁ</label>
                  <p className="disclaimer" style={{ marginBottom: "16px", fontSize: "14px", color: "#b9b4c7" }}>
                    Phiên đấu giá chưa bắt đầu. Đăng ký để đặt cọc và nhận quyền tham gia khi phiên diễn ra.
                  </p>
                  {isRegistered ? (
                    <button type="button" className="confirm-btn" style={{ background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff" }} disabled>
                      <FaCheckCircle /> Đã đăng ký tham gia
                    </button>
                  ) : (
                    <button type="button" className="confirm-btn" onClick={handleOpenRegistration}>
                      <FaGavel /> Đăng ký đấu giá
                    </button>
                  )}
                </div>
              ) : (
                <div className="bid-form">
                  <label>ĐẶT GIÁ THẦU CỦA BẠN</label>
                  <div className="bid-input">
                    <span>{isUsd ? "$" : "₫"}</span>
                    <input
                      type="text"
                      placeholder={`Tối thiểu ${minBid.toLocaleString(isUsd ? "en-US" : "vi-VN")}`}
                      value={bidAmount}
                      onChange={(e) => {
                        const rawVal = e.target.value.replace(/[^0-9]/g, "");
                        const numVal = Number(rawVal);
                        setBidAmount(rawVal ? numVal.toLocaleString(isUsd ? "en-US" : "vi-VN") : "");
                      }}
                    />
                  </div>
                  <div className="increments">
                    {increments.map((inc) => (
                      <button
                        key={inc.value}
                        type="button"
                        onClick={() => handleIncrement(inc.value)}
                      >
                        {inc.label}
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
              )}
            </div>

            <div className="auc-detail__card">
              <div className="history-header">
                <h3>LỊCH SỬ ĐẤU GIÁ ({product.bidHistory.length})</h3>
                <a href="#">Xem tất cả</a>
              </div>
              <ul className="history-list">
                {product.bidHistory.map((bid, i) => (
                  <li key={i} className={bid.isLeader ? "leader" : ""}>
                    <div 
                      className="history-user"
                      onClick={() => isSellerMode && navigate(`/auction/profile?user=${encodeURIComponent(bid.user)}`)}
                      style={{ cursor: isSellerMode ? 'pointer' : 'default' }}
                      title={isSellerMode ? "Xem hồ sơ người dùng" : ""}
                    >
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

      {showRegModal && (
        <div className="auc-modal-overlay" onClick={() => setShowRegModal(false)}>
          <div className="auc-modal" onClick={(e) => e.stopPropagation()}>
            <div className="auc-modal__header">
              <h3>
                <FaShieldAlt style={{ color: "#e8c468" }} />
                {regStep === 1 ? "Xác minh tài khoản trước khi đấu giá" : "Đăng ký & Đặt cọc đấu giá"}
              </h3>
              <button type="button" onClick={() => setShowRegModal(false)}><FaTimes /></button>
            </div>

            <div className="auc-modal__body">
              {regStep === 1 ? (
                <>
                  <div className="kyc-warning-box">
                    <h4><FaExclamationTriangle /> Yêu cầu hoàn tất hồ sơ cá nhân</h4>
                    <p>
                      Theo Quy chế đấu giá trực tuyến của Auction House, thành viên cần hoàn tất xác minh Email, Số điện thoại và CCCD/CMND trước khi đăng ký đặt cọc tham gia phiên.
                    </p>
                  </div>

                  <div className="kyc-checklist">
                    <div className="kyc-item">
                      <span>Số điện thoại ({user?.phone || 'Chưa cập nhật'})</span>
                      <span className={`status-badge status-badge--${user?.isPhoneVerified ? 'verified' : 'unverified'}`}>
                        {user?.isPhoneVerified ? '✓ Đã xác minh' : '⚠️ Chưa xác minh'}
                      </span>
                    </div>
                    <div className="kyc-item">
                      <span>Địa chỉ Email ({user?.email || 'Chưa cập nhật'})</span>
                      <span className={`status-badge status-badge--${user?.isEmailVerified ? 'verified' : 'unverified'}`}>
                        {user?.isEmailVerified ? '✓ Đã xác minh' : '⚠️ Chưa xác minh'}
                      </span>
                    </div>
                    <div className="kyc-item">
                      <span>Căn cước công dân (CCCD/CMND)</span>
                      <span className={`status-badge status-badge--${user?.isNationalIdVerified ? 'verified' : 'unverified'}`}>
                        {user?.isNationalIdVerified ? '✓ Đã duyệt' : '⚠️ Chưa xác minh'}
                      </span>
                    </div>
                  </div>

                  <div className="auc-modal__actions">
                    <button type="button" className="btn-secondary" onClick={() => setRegStep(2)}>
                      Bỏ qua & Tiếp tục (Demo)
                    </button>
                    <button type="button" className="btn-primary" onClick={() => navigate('/profile/personal-info')}>
                      Đến trang xác minh hồ sơ
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="deposit-product-card">
                    <AuctionImage src={product.images[0]} alt={product.title} />
                    <div>
                      <strong>{product.title}</strong>
                      <span>Giá khởi điểm: {product.currentPrice}</span>
                    </div>
                  </div>

                  <div className="deposit-info-box">
                    <div className="deposit-row">
                      <span>Số tiền đặt cọc bắt buộc:</span>
                      <strong>5.000.000 ₫</strong>
                    </div>
                    <p>
                      Tiền đặt cọc sẽ được hoàn trả 100% về ví của bạn trong vòng 24 giờ sau khi phiên đấu giá kết thúc nếu bạn không chiến thắng.
                    </p>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', color: '#b9b4c7', display: 'block', marginBottom: '6px' }}>
                      PHƯƠNG THỨC ĐẶT CỌC
                    </label>
                    <div className="payment-options">
                      <label className={paymentMethod === 'wallet' ? 'selected' : ''}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="wallet"
                          checked={paymentMethod === 'wallet'}
                          onChange={() => setPaymentMethod('wallet')}
                        />
                        <span>Ví Nexus Pay (Số dư khả dụng: 50.000.000 ₫)</span>
                      </label>
                      <label className={paymentMethod === 'bank' ? 'selected' : ''}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="bank"
                          checked={paymentMethod === 'bank'}
                          onChange={() => setPaymentMethod('bank')}
                        />
                        <span>Chuyển khoản Ngân hàng (Mã QR Napas 24/7)</span>
                      </label>
                    </div>
                  </div>

                  <div className="rules-summary">
                    <strong>Quy định & Bảo lưu cọc:</strong>
                    <ul>
                      <li>Trúng thầu nhưng bỏ cuộc sẽ bị tịch thu 100% tiền cọc.</li>
                      <li>Hệ thống tự động nhắc lịch khi phiên sắp bắt đầu qua SĐT/Email.</li>
                    </ul>
                  </div>

                  <label className="agree-checkbox">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                    />
                    <span>Tôi đã đọc, hiểu rõ và đồng ý với Quy chế & Điều khoản đặt cọc đấu giá.</span>
                  </label>

                  <div className="auc-modal__actions">
                    <button type="button" className="btn-secondary" onClick={() => setShowRegModal(false)}>
                      Hủy
                    </button>
                    <button
                      type="button"
                      className="btn-primary"
                      disabled={!agreeTerms || isRegistering}
                      onClick={handleConfirmRegistration}
                    >
                      {isRegistering ? "Đang xử lý..." : "Xác nhận Đăng ký & Đặt cọc"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      </div>
  );
}

