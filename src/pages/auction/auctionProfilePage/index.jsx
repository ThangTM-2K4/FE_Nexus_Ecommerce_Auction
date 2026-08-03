import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  FaMapMarkerAlt, FaShieldAlt, FaStar, FaTrophy, FaGavel, FaHeart, FaWallet,
  FaCheckCircle, FaChartLine, FaHistory, FaUserEdit, FaClock, FaMedal
} from "react-icons/fa";
import { toast } from "react-toastify";
import { useAuth } from "../../../context/AuthContext";
import * as profileService from "../../../services/profileService";
import ProfileInfo from "../../../components/profile/profileInfo";
import AuctionSidebarLayout from "../../../components/auction/auctionSidebarLayout";
import AuctionImage from "../../../components/auction/auctionImage";
import AuctionCard from "../../../components/auction/auctionCard";
import { auctionListings } from "../../../data/auctionData";
import RequireAuthModal from "../../../components/auction/requireAuthModal";
import "./index.scss";

export default function AuctionProfilePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, refreshUser } = useAuth();
  const [searchParams] = useSearchParams();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "personal" | "watchlist"
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Load watchlist items from localStorage
  const [watchlistItems, setWatchlistItems] = useState([]);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    profileService
      .getProfile(user.id)
      .then((prof) => {
        setProfile(prof);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading profile:", err);
        setLoading(false);
      });

    // Load local watchlist
    try {
      const saved = JSON.parse(localStorage.getItem("auc_watchlist") || "[]");
      setWatchlistItems(saved);
    } catch {
      setWatchlistItems([]);
    }
  }, [user?.id, isAuthenticated]);

  const handleProfileUpdate = (updated) => {
    setProfile(updated);
    refreshUser();
    toast.success("Đã cập nhật hồ sơ thành công!");
  };

  if (!isAuthenticated) {
    return (
      <AuctionSidebarLayout sidebarActive="profile">
        <div className="auc-profile-guest">
          <div className="auc-profile-guest__card">
            <FaShieldAlt className="guest-icon" />
            <h2>Hồ sơ Cá nhân Đấu giá</h2>
            <p>Vui lòng đăng nhập để xem thông số đấu giá, lịch sử đặt giá và quản lý thông tin cá nhân của bạn.</p>
            <button
              type="button"
              className="auc-profile-guest__btn"
              onClick={() => setShowAuthModal(true)}
            >
              Đăng nhập ngay
            </button>
          </div>
        </div>

        <RequireAuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          title="Cần đăng nhập để xem hồ sơ"
          subtitle="Vui lòng đăng nhập hoặc đăng ký tài khoản Nexus để xem bảng thống kê đấu giá cá nhân."
        />
      </AuctionSidebarLayout>
    );
  }

  // Calculate dynamic stats from profile + user session
  const reputationScore = profile?.reputation?.score ?? 4.9;
  const isCccdVerified = profile?.isNationalIdVerified || profile?.identityStatus === "APPROVED";
  const fullName = profile?.fullName || user?.fullName || "Thành viên Nexus";
  const email = profile?.email || user?.email || "";
  const phone = profile?.phone || user?.phone || "";
  const address = profile?.address || user?.address || "Việt Nam";

  // Mock auction stats for user
  const auctionStats = [
    {
      id: "total_bids",
      label: "Tổng lượt đặt giá",
      value: "28",
      subText: "Trên 12 sản phẩm",
      icon: <FaGavel style={{ color: "#C3A05D" }} />,
    },
    {
      id: "won_auctions",
      label: "Số phiên thắng thầu",
      value: "5",
      subText: "Tỷ lệ thắng 83.3%",
      icon: <FaTrophy style={{ color: "#E8C468" }} />,
    },
    {
      id: "active_bids",
      label: "Phiên đang tham gia",
      value: "3",
      subText: "Đang dẫn đầu 2 phiên",
      icon: <FaClock style={{ color: "#53ADBE" }} />,
    },
    {
      id: "watchlist_count",
      label: "Sản phẩm theo dõi",
      value: String(watchlistItems.length || 8),
      subText: "Đang theo dõi",
      icon: <FaHeart style={{ color: "#ef4444" }} />,
    },
    {
      id: "deposit_volume",
      label: "Tổng cọc / giao dịch",
      value: `${(user?.balance ? (user.balance * 2.5) : 185000000).toLocaleString()} ₫`,
      subText: "Điểm tín nhiệm cao",
      icon: <FaWallet style={{ color: "#10b981" }} />,
    },
    {
      id: "trust_score",
      label: "Điểm uy tín đấu giá",
      value: `${reputationScore} / 5.0`,
      subText: "Hạng Vật Thầu Vàng Gold",
      icon: <FaMedal style={{ color: "#C3A05D" }} />,
    },
  ];

  // Recent bid history
  const recentBids = [
    {
      id: "BID_101",
      title: "Đồng hồ Rolex Submariner Date 41mm (2023)",
      bidPrice: "330.000.000 ₫",
      time: "10 phút trước",
      status: "LEADING",
      statusLabel: "👑 Đang dẫn đầu",
      statusClass: "status-leading",
    },
    {
      id: "BID_102",
      title: "Túi Hermès Birkin 30 Togo Gold Hardware",
      bidPrice: "412.000.000 ₫",
      time: "1 giờ trước",
      status: "OUTBID",
      statusLabel: "⚠️ Đã bị vượt giá",
      statusClass: "status-outbid",
    },
    {
      id: "BID_103",
      title: "MacBook Pro 16 inch M3 Max 36GB / 1TB",
      bidPrice: "68.900.000 ₫",
      time: "2 giờ trước",
      status: "WON",
      statusLabel: "🏆 Thắng thầu (Đã cọc)",
      statusClass: "status-won",
    },
  ];

  return (
    <AuctionSidebarLayout sidebarActive="profile">
      <div className="auc-profile-page">
        {/* Header Profile Hero Card */}
        <div className="auc-profile-hero">
          <div className="auc-profile-hero__main">
            <div className="auc-profile-hero__avatar-wrap">
              <AuctionImage
                src={profile?.avatar || user?.avatar || "/images/avatars/default.png"}
                alt={fullName}
                className="auc-profile-hero__avatar"
              />
              <span className="auc-profile-hero__avatar-badge" title="Tài khoản chính thức">
                ✓
              </span>
            </div>

            <div className="auc-profile-hero__details">
              <div className="name-badge-row">
                <h2>{fullName}</h2>
                <span className="user-role-badge">
                  <FaMedal style={{ color: "#C3A05D" }} /> Premium Bidder
                </span>
              </div>
              <p className="email-phone-meta">
                <span>{email}</span> • <span>{phone || "Chưa cập nhật SĐT"}</span>
              </p>

              <div className="meta-tags">
                <span className="meta-tag">
                  <FaMapMarkerAlt /> {address}
                </span>
                {isCccdVerified ? (
                  <span className="meta-tag meta-tag--verified">
                    <FaCheckCircle /> Đã xác minh CCCD/CMND
                  </span>
                ) : (
                  <span className="meta-tag meta-tag--unverified">
                    <FaShieldAlt /> Chưa xác minh CCCD
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="auc-profile-hero__wallet">
            <div className="wallet-card">
              <span className="wallet-title">
                <FaWallet style={{ color: "#E8C468" }} /> SỐ DƯ VÍ NEXUS PAY
              </span>
              <strong className="wallet-amount">
                {user?.balance ? `${user.balance.toLocaleString()} ₫` : "50.000.000 ₫"}
              </strong>
              <div className="wallet-frozen">
                <span>Cọc đang tạm giữ:</span>
                <strong>{user?.frozenBalance ? `${user.frozenBalance.toLocaleString()} ₫` : "12.500.000 ₫"}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Tabs Navigation */}
        <div className="auc-profile-tabs">
          <button
            type="button"
            className={`auc-tab-btn ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <FaChartLine /> Thống kê & Hoạt động đấu giá
          </button>
          <button
            type="button"
            className={`auc-tab-btn ${activeTab === "personal" ? "active" : ""}`}
            onClick={() => setActiveTab("personal")}
          >
            <FaUserEdit /> Hồ sơ cá nhân & CCCD (Đồng bộ API)
          </button>
          <button
            type="button"
            className={`auc-tab-btn ${activeTab === "watchlist" ? "active" : ""}`}
            onClick={() => setActiveTab("watchlist")}
          >
            <FaHeart /> Sản phẩm đang theo dõi ({watchlistItems.length})
          </button>
        </div>

        {/* Tab 1: Overview & Auction Stats */}
        {activeTab === "overview" && (
          <div className="auc-profile-tab-content">
            {/* Stats Grid */}
            <div className="auc-stats-grid">
              {auctionStats.map((stat) => (
                <div key={stat.id} className="auc-stat-card">
                  <div className="stat-icon-wrap">{stat.icon}</div>
                  <div className="stat-info">
                    <span className="stat-label">{stat.label}</span>
                    <strong className="stat-value">{stat.value}</strong>
                    <span className="stat-sub">{stat.subText}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Bids Table */}
            <div className="auc-recent-bids-card">
              <div className="card-header">
                <h3><FaHistory /> Lịch sử đặt giá thầu gần đây</h3>
                <button
                  type="button"
                  className="link-btn"
                  onClick={() => navigate("/auction/my-bids")}
                >
                  Xem tất cả lịch sử thầu →
                </button>
              </div>

              <div className="table-responsive">
                <table className="auc-bids-table">
                  <thead>
                    <tr>
                      <th>Sản Phẩm Đấu Giá</th>
                      <th>Giá Thầu Của Bạn</th>
                      <th>Thời Gian</th>
                      <th>Trạng Thái</th>
                      <th>Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBids.map((bid) => (
                      <tr key={bid.id}>
                        <td>
                          <strong className="item-title">{bid.title}</strong>
                        </td>
                        <td>
                          <span className="price-val">{bid.bidPrice}</span>
                        </td>
                        <td>
                          <span className="time-val">{bid.time}</span>
                        </td>
                        <td>
                          <span className={`bid-badge ${bid.statusClass}`}>
                            {bid.statusLabel}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="auc-action-btn"
                            onClick={() => navigate("/auction/detail/1")}
                          >
                            Xem phiên
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Personal Profile & CCCD Verification Form (Full API Integration) */}
        {activeTab === "personal" && (
          <div className="auc-profile-tab-content">
            <div className="auc-profile-form-wrap">
              <ProfileInfo
                userId={user?.id}
                profile={profile}
                onUpdate={handleProfileUpdate}
              />
            </div>
          </div>
        )}

        {/* Tab 3: Watchlist Products */}
        {activeTab === "watchlist" && (
          <div className="auc-profile-tab-content">
            <div className="auc-watchlist-grid">
              {watchlistItems.length > 0 ? (
                auctionListings
                  .filter((item) => watchlistItems.some((w) => String(w.id) === String(item.id)))
                  .map((item) => (
                    <AuctionCard
                      key={item.id}
                      auction={item}
                      onClick={() => navigate(`/auction/detail/${item.id}`)}
                    />
                  ))
              ) : (
                <div className="auc-empty-watchlist">
                  <FaHeart style={{ fontSize: 48, color: "rgba(255,255,255,0.2)" }} />
                  <p>Bạn chưa lưu sản phẩm nào vào mục Đang Theo Dõi.</p>
                  <button
                    type="button"
                    className="auc-browse-btn"
                    onClick={() => navigate("/auction/browse")}
                  >
                    Khám phá sản phẩm đấu giá ngay
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AuctionSidebarLayout>
  );
}
