import { useState, useEffect } from "react";
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

export default function AuctionProfilePage() {
  const { user, isSellerMode, refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [shopProfile, setShopProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewTab, setReviewTab] = useState("all");

  useEffect(() => {
    if (!user?.id) return;
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
  }, [user?.id, user]);

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

  if (!isSellerMode) {
    return (
      <AuctionSidebarLayout sidebarActive="profile">
        <div className="profile-layout">
          <ProfileInfo userId={user?.id} profile={profile} onUpdate={handleProfileUpdate} />
          <BuyerTrustScore profile={profile} />
        </div>
      </AuctionSidebarLayout>
    );
  }

  const data = {
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

          <div className="review-list">
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

