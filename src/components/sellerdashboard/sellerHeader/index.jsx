import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { FaBell, FaSearch } from "react-icons/fa";
import { useAuth } from "../../../context/AuthContext";
import ProfileDropdown from "../../homepage/header/ProfileDropdown";
import "./index.scss";

const SellerHeader = () => {
  const navigate = useNavigate();
  const {
    user,
    isApprovedSeller,
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

  return (
    <header className="slr-header">
      <div className="slr-header__inner">
        <div className="slr-header__left">
          <h1
            className="slr-header__logo"
            onClick={() => navigate("/seller-hub/overview")}
            onKeyDown={(e) => e.key === "Enter" && navigate("/seller-hub/overview")}
            role="button"
            tabIndex={0}
          >
            Seller Hub
          </h1>
          <span className="slr-header__badge">Kênh Người Bán</span>
        </div>

        <div className="slr-header__search">
          <FaSearch />
          <input type="text" placeholder="Tìm đơn hàng, sản phẩm, SKU..." />
        </div>

        <div className="slr-header__actions">
          <button type="button" className="slr-header__link" onClick={() => navigate("/auction/seller")}>
            Đấu giá
          </button>
          <button type="button" className="slr-header__link" onClick={() => navigate("/")}>
            Trang chủ
          </button>
          <button type="button" className="slr-header__bell" aria-label="Thông báo">
            <FaBell />
            <span className="slr-header__bell-dot" />
          </button>
          <div className="slr-header__profile-wrap">
            <button
              type="button"
              className="slr-header__avatar"
              aria-label="Tài khoản"
              onClick={() => setShowProfile((v) => !v)}
            >
              <span>{initials}</span>
              {isApprovedSeller && (
                <em className="slr-header__verified" title="Đã xác minh" />
              )}
            </button>

            {showProfile && (
              <ProfileDropdown
                onClose={() => setShowProfile(false)}
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};


export default SellerHeader;
