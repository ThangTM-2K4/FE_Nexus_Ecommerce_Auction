import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  FaMapMarkerAlt, FaShieldAlt, FaStar,
} from "react-icons/fa";
import { useAuth } from "../../../context/AuthContext";
import * as profileService from "../../../services/profileService";
import * as shopService from "../../../services/shopService";
import ProfileInfo from "../../../components/profile/profileInfo";
import BuyerTrustScore from "../../../components/profile/buyerTrustScore";
import AuctionSidebarLayout from "../../../components/auction/auctionSidebarLayout";
import AuctionImage from "../../../components/auction/auctionImage";
import { profileData } from "../../../data/auctionMockData";
import "../../../pages/user/profilePage/index.scss";
import "./index.scss";

const mockSellers = {
  "LUXWATCH_HN": {
    name: "LUXWATCH_HN",
    avatar: "/images/avatars/avatar-seller.jpg",
    badge: "Trusted Seller",
    bio: "Chuyên cung cấp đồng hồ Rolex, Patek Philippe, Audemars Piguet chính hãng. Cam kết chất lượng, bảo hành dài hạn.",
    location: "Hà Nội, VN",
    verified: true,
    reputation: 4.9,
    totalReviews: 142,
    stats: [
      { label: "Tổng giao dịch", value: "320", trend: "+15%", trendType: "up" },
      { label: "Bán thành công", value: "150", sub: "Tỉ lệ 99%", subType: "info" },
      { label: "Thắng đấu giá", value: "45", sub: "Hoạt động tích cực", subType: "info" },
      { label: "Phản hồi tích cực", value: "99.5%", sub: "✓", subType: "success" },
    ],
    reviews: profileData.reviews,
  },
  "LUXWATCH_VN": {
    name: "LUXWATCH_VN",
    avatar: "/images/avatars/avatar-seller.jpg",
    badge: "Trusted Seller",
    bio: "Nhà cung cấp đồng hồ hiệu cao cấp toàn quốc. Chuyên Rolex, Patek, Hublot...",
    location: "TP. Hồ Chí Minh, VN",
    verified: true,
    reputation: 4.9,
    totalReviews: 120,
    stats: [
      { label: "Tổng giao dịch", value: "280", trend: "+10%", trendType: "up" },
      { label: "Bán thành công", value: "115", sub: "Tỉ lệ 98%", subType: "info" },
      { label: "Thắng đấu giá", value: "38", sub: "Hoạt động tích cực", subType: "info" },
      { label: "Phản hồi tích cực", value: "99%", sub: "✓", subType: "success" },
    ],
    reviews: profileData.reviews,
  },
  "AUTO_LUXURY_VN": {
    name: "AUTO_LUXURY_VN",
    avatar: "/images/avatars/avatar-seller.jpg",
    badge: "Premium Dealer",
    bio: "Đại lý xe siêu sang và xe thể thao nhập khẩu uy tín hàng đầu Việt Nam. Hỗ trợ trả góp, thủ tục nhanh chóng.",
    location: "TP. Hồ Chí Minh, VN",
    verified: true,
    reputation: 4.8,
    totalReviews: 98,
    stats: [
      { label: "Tổng giao dịch", value: "120", trend: "+8%", trendType: "up" },
      { label: "Bán thành công", value: "85", sub: "Tỉ lệ 100%", subType: "info" },
      { label: "Thắng đấu giá", value: "10", sub: "Hoạt động tích cực", subType: "info" },
      { label: "Phản hồi tích cực", value: "98%", sub: "✓", subType: "success" },
    ],
    reviews: profileData.reviews,
  },
  "WATCH_MASTER": {
    name: "WATCH_MASTER",
    avatar: "/images/avatars/avatar-seller.jpg",
    badge: "Expert Seller",
    bio: "Chuyên gia phục chế và giao dịch đồng hồ hiệu cao cấp. Thẩm định đồng hồ miễn phí.",
    location: "Đà Nẵng, VN",
    verified: true,
    reputation: 5.0,
    totalReviews: 64,
    stats: [
      { label: "Tổng giao dịch", value: "95", trend: "+20%", trendType: "up" },
      { label: "Bán thành công", value: "60", sub: "Tỉ lệ 98.5%", subType: "info" },
      { label: "Thắng đấu giá", value: "35", sub: "Hoạt động tích cực", subType: "info" },
      { label: "Phản hồi tích cực", value: "100%", sub: "✓", subType: "success" },
    ],
    reviews: profileData.reviews,
  }
};

export default function AuctionProfilePage() {
  const { user, isSellerMode, refreshUser } = useAuth();
  const [searchParams] = useSearchParams();
  const sellerQuery = searchParams.get("seller");
  const userQuery = searchParams.get("user");
  const queryName = sellerQuery || userQuery;
  const isViewingPublic = !!queryName;

  const [profile, setProfile] = useState(null);
  const [shopProfile, setShopProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewTab, setReviewTab] = useState("all");

  useEffect(() => {
    if (isViewingPublic) {
      setLoading(false);
      return;
    }
    if (!user?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all([
      profileService.getProfile(user.id),
      shopService.getShopProfile(user.id, user)
    ])
      .then(([prof, shop]) => {
        setProfile(prof);
        setShopProfile(shop);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading profiles:", err);
        setLoading(false);
      });
  }, [user?.id, user, isViewingPublic]);

  const handleProfileUpdate = (updated) => {
    setProfile(updated);
    refreshUser();
  };

  if (loading) {
    return (
      <AuctionSidebarLayout sidebarActive="profile">
        <div style={{ padding: "40px", textAlign: "center", color: "#b9b4c7" }}>
          Đang tải hồ sơ...
        </div>
      </AuctionSidebarLayout>
    );
  }

  if (!isViewingPublic && !isSellerMode) {
    if (!user) {
      return (
        <AuctionSidebarLayout sidebarActive="profile">
          <div style={{ padding: "40px", textAlign: "center", color: "#b9b4c7" }}>
            Vui lòng đăng nhập để xem thông tin cá nhân.
          </div>
        </AuctionSidebarLayout>
      );
    }
    return (
      <AuctionSidebarLayout sidebarActive="profile">
        <div className="profile-layout">
          <ProfileInfo userId={user?.id} profile={profile} onUpdate={handleProfileUpdate} />
          <BuyerTrustScore profile={profile} />
        </div>
      </AuctionSidebarLayout>
    );
  }

  const data = isViewingPublic
    ? (mockSellers[queryName] || {
        name: queryName,
        avatar: "/images/avatars/avatar-seller.jpg",
        badge: userQuery ? "Bidder" : "Trusted Seller",
        bio: userQuery
          ? "Thành viên tích cực tham gia đấu giá trên Nexus."
          : "Chuyên giao dịch các sản phẩm cao cấp, uy tín và minh bạch.",
        location: "Việt Nam",
        verified: true,
        reputation: 4.9,
        totalReviews: 120,
        stats: profileData.stats,
        reviews: profileData.reviews,
      })
    : {
        name: shopProfile?.shopName || profile?.fullName || profileData.name,
        avatar: shopProfile?.logo || profile?.avatar || profileData.avatar,
        badge: "Trusted Seller",
        bio: shopProfile?.description || profileData.bio,
        location: shopProfile?.businessAddress || profile?.address || profileData.location,
        verified: profile?.isNationalIdVerified || profileData.verified,
        reputation: profileData.reputation,
        totalReviews: profileData.totalReviews,
        stats: profileData.stats,
        reviews: profileData.reviews,
      };

  return (
    <AuctionSidebarLayout sidebarActive="profile">
      <div className="auc-profile">
        <div className="auc-profile__header-row">
          <div className="auc-profile__card auc-profile__card--info">
            <AuctionImage src={data.avatar} alt={data.name} className="profile-avatar" />
            <div>
              <div className="name-row">
                <h2>{data.name}</h2>
                <span className="badge">{data.badge}</span>
              </div>
              <p className="bio">{data.bio}</p>
              <div className="meta">
                <span><FaMapMarkerAlt /> {data.location}</span>
                {data.verified && (
                  <span className="verified">
                    <FaShieldAlt /> Đã xác minh CMND/CCCD
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="auc-profile__card auc-profile__card--rep">
            <span className="rep-label">CHỈ SỐ UY TÍN</span>
            <div className="rep-score">
              {data.reputation} <span>/ 5.0</span>
            </div>
            <div className="stars">
              {[...Array(5)].map((_, i) => <FaStar key={i} />)}
            </div>
            <p className="rep-sub">
              Dựa trên {data.totalReviews} lượt đánh giá
            </p>
          </div>
        </div>

        <div className="auc-profile__stats">
          {data.stats.map((stat) => (
            <div key={stat.label} className="stat">
              <span className="stat-label">{stat.label}</span>
              <span className="stat-value">{stat.value}</span>
              {stat.trend && (
                <span className="stat-trend stat-trend--up">{stat.trend}</span>
              )}
              {stat.sub && (
                <span className={`stat-sub stat-sub--${stat.subType}`}>
                  {stat.sub}
                </span>
              )}
            </div>
          ))}
        </div>

        <section className="auc-profile__reviews">
          <h3>Đánh giá gần đây</h3>

          <div className="tabs">
            {[
              { id: "all", label: "Tất cả" },
              { id: "seller", label: "Người bán" },
              { id: "buyer", label: "Người mua" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={reviewTab === tab.id ? "active" : ""}
                onClick={() => setReviewTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="auc-profile__review-list">
            {data.reviews.map((review) => (
              <div key={review.id} className="review">
                <AuctionImage src={review.avatar} alt={review.name} className="review-avatar" />
                <div>
                  <div className="review-header">
                    <div>
                      <strong>{review.name}</strong>
                      <span className="role">{review.role}</span>
                    </div>
                    <span className="time">{review.time}</span>
                  </div>
                  <div className="review-stars">
                    {[...Array(review.rating)].map((_, i) => (
                      <FaStar key={i} />
                    ))}
                  </div>
                  <p className="comment">{review.comment}</p>
                  <div className="review-item">
                    <AuctionImage
                      src={review.item.image}
                      alt={review.item.name}
                      className="review-item__img"
                    />
                    <span>{review.item.name}</span>
                    <em>{review.item.price}</em>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button type="button" className="more-btn">
            Xem tất cả {data.totalReviews} đánh giá
          </button>
        </section>
      </div>
    </AuctionSidebarLayout>
  );
}

