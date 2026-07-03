import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBell, FaSearch } from "react-icons/fa";
import { useAuth } from "../../../context/AuthContext";
import ProfileDropdown from "../../homepage/header/ProfileDropdown";
import "./index.scss";

const AuctionHeader = ({ activeTab = "buying" }) => {
  const navigate = useNavigate();
  const {
    isAuthenticated,
    user,
    isApprovedSeller,
    isSellerMode,
    isBuyerMode,
    switchAccountMode,
  } = useAuth();
  const [showProfile, setShowProfile] = useState(false);

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  const handleTabClick = async (tab) => {
    if (tab === "buying") {
      if (isAuthenticated && isSellerMode) {
        try {
          await switchAccountMode("BUYER");
        } catch {
          /* ignore */
        }
      }
      navigate("/auction/browse");
      return;
    }
  };

  return (
    <header className="auc-header">
      <div className="auc-header__inner">
        <div className="auc-header__left">
          <Link to="/auction/browse" className="auc-header__brand">
            <span className="auc-header__brand-mark">
              <img
                src="/images/logo/logo.png"
                alt="Shop Auction"
              />
            </span>
            <span className="auc-header__brand-text">
              <strong>
                Shop <span className="auc-header__brand-accent">Auction</span>
              </strong>
              <small>Đấu giá thông minh</small>
            </span>
          </Link>
          <nav className="auc-header__tabs">
            {(!isAuthenticated || isBuyerMode || !isApprovedSeller) && (
              <button
                type="button"
                className={activeTab === "buying" ? "active" : ""}
                onClick={() => handleTabClick("buying")}
              >
                Buying
              </button>
            )}
          </nav>
        </div>

        <div className="auc-header__search">
          <FaSearch />
          <input type="text" placeholder="Tìm kiếm phiên đấu giá..." />
        </div>

        <div className="auc-header__actions">
          <Link to="/" className="auc-header__home">
            Trang chính
          </Link>
          <button type="button" className="auc-header__bell">
            <FaBell />
          </button>

          {!isAuthenticated ? (
            <div className="auc-header__auth">
              <Link to="/login" className="auc-header__login">
                Đăng nhập
              </Link>
              <Link to="/register" className="auc-header__register">
                Đăng ký
              </Link>
            </div>
          ) : (
            <div className="auc-header__profile-wrap">
              <button
                type="button"
                className="auc-header__avatar"
                aria-label="Menu tài khoản"
                onClick={() => setShowProfile((v) => !v)}
              >
                <span className="auc-header__avatar-initials">{initials}</span>
                {isApprovedSeller && (
                  <span
                    className="auc-header__seller-dot"
                    title="Người bán đã xác minh"
                  />
                )}
              </button>
              {showProfile && (
                <ProfileDropdown
                  onClose={() => setShowProfile(false)}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};


export default AuctionHeader;

