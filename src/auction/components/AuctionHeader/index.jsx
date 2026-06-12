import { useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import { FaBell, FaSearch } from "react-icons/fa";
import { toast } from "react-toastify";
import { useAuth } from "../../../context/AuthContext";
import AuctionProfileDropdown from "../AuctionProfileDropdown";
import AuctionSwitchAccountModal from "../AuctionSwitchAccountModal";
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
  const [showSwitchModal, setShowSwitchModal] = useState(false);

  const handleSwitchMode = async (mode) => {
    try {
      await switchAccountMode(mode);
      setShowSwitchModal(false);
      navigate(mode === "SELLER" ? "/auction/seller" : "/auction/browse");
      toast.success(
        mode === "SELLER"
          ? "Đã chuyển sang hồ sơ Người bán"
          : "Đã chuyển sang hồ sơ Người mua"
      );
    } catch {
      toast.error("Không thể chuyển chế độ tài khoản");
    }
  };

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

    if (!isApprovedSeller) {
      navigate(isAuthenticated ? "/profile/become-seller" : "/login");
      return;
    }

    if (isBuyerMode) {
      try {
        await switchAccountMode("SELLER");
      } catch {
        toast.error("Không thể chuyển sang hồ sơ Người bán");
        return;
      }
    }
    navigate("/auction/seller");
  };

  return (
    <header className="auc-header">
      <div className="auc-header__inner">
        <div className="auc-header__left">
          <h1
            className="auc-header__logo"
            onClick={() => navigate("/auction/browse")}
          >
            Auction House
          </h1>
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
            {isApprovedSeller && isSellerMode && (
              <button
                type="button"
                className={activeTab === "selling" ? "active" : ""}
                onClick={() => handleTabClick("selling")}
              >
                Selling
              </button>
            )}
          </nav>
        </div>

        <div className="auc-header__search">
          <FaSearch />
          <input type="text" placeholder="Tìm kiếm phiên đấu giá..." />
        </div>

        <div className="auc-header__actions">
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
                <AuctionProfileDropdown
                  onClose={() => setShowProfile(false)}
                  onOpenSwitch={() => setShowSwitchModal(true)}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {showSwitchModal &&
        createPortal(
          <AuctionSwitchAccountModal
            onClose={() => setShowSwitchModal(false)}
            onSwitch={handleSwitchMode}
          />,
          document.body
        )}
    </header>
  );
};

export default AuctionHeader;
