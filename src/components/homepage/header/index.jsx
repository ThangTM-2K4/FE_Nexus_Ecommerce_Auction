import "./index.scss";
import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useCart } from "../../../context/CartContext";
import * as notificationService from "../../../services/notificationService";
import NotificationDropdown from "./NotificationDropdown";
import ProfileDropdown from "./ProfileDropdown";
import UserAvatar from "../../common/userAvatar";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentRedirect = encodeURIComponent(
    location.pathname + location.search,
  );

  const [language, setLanguage] = useState("vi");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?keyword=${encodeURIComponent(searchQuery.trim())}`);
    }
  };
  const {
    isAuthenticated,
    user,
    isApprovedSeller,
    isSellerMode,
    isBuyerMode,
    switchAccountMode,
  } = useAuth();
  const { cartCount } = useCart();

  // Xác định role để ẩn các mục chỉ dành cho người dùng thường
  const userRoles = (() => {
    const raw = [];
    if (user?.role) raw.push(user.role);
    if (user?.roleName) raw.push(user.roleName);
    if (user?.roleCode) raw.push(user.roleCode);
    if (Array.isArray(user?.roles)) raw.push(...user.roles);
    return raw
      .map((r) => (typeof r === "string" ? r : (r?.code ?? r?.name ?? "")))
      .filter(Boolean)
      .map((s) =>
        String(s)
          .toUpperCase()
          .replace(/^ROLE_/, ""),
      );
  })();
  const isAdmin = userRoles.some((r) => r === "ADMIN" || r === "SUPER_ADMIN");
  const isStaffRole = userRoles.some(
    (r) => r === "STAFF" || r === "SUPPORT_STAFF",
  );
  const isAdminOrStaff = isAdmin || isStaffRole;
  const profileVariant = isAdmin ? "admin" : isStaffRole ? "staff" : undefined;

  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }

    notificationService
      .getUnreadCount()
      .then(setUnreadCount)
      .catch((error) => {
        console.error(
          "[Header] Failed to get unread notification count",
          error,
        );

        setUnreadCount(0);
      });
  }, [isAuthenticated, showNotifications]);

  const handleLanguageChange = () => {
    setLanguage(language === "vi" ? "en" : "vi");
  };

  const handleGoToSellerHub = async () => {
    if (!isSellerMode) {
      await switchAccountMode("SELLER");
    }
    navigate("/seller-hub/overview");
  };

  const closeDropdowns = () => {
    setShowNotifications(false);
    setShowProfile(false);
  };

  return (
    <header className="header" role="banner">
      <div className="header-topbar" aria-label="Secondary navigation">
        <div className="header-shell header-topbar-shell">
          <nav className="header-topbar-group" aria-label="Seller services">
            {isApprovedSeller ? (
              <button
                type="button"
                className="header-topbar-link-btn"
                onClick={handleGoToSellerHub}
              >
                Kênh Người Bán
              </button>
            ) : (
              <a href="#seller-center">Kênh Người Bán</a>
            )}
            {!isApprovedSeller && !isAdminOrStaff && (
              <Link
                to={isAuthenticated ? "/profile/become-seller" : "/register"}
              >
                {user?.sellerStatus === "PENDING"
                  ? "Đang chờ phê duyệt"
                  : user?.sellerStatus === "REJECTED"
                    ? "Đơn bị từ chối"
                    : "Trở thành Người bán"}
              </Link>
            )}
            <a href="#app">Tải ứng dụng</a>
            <a href="#connect">Kết nối</a>
          </nav>

          <nav
            className="header-topbar-group header-topbar-group-right"
            aria-label="User account"
          >
            <a href="#support">Hỗ Trợ</a>
            <button
              type="button"
              className="header-language"
              onClick={handleLanguageChange}
              aria-label={`Đổi ngôn ngữ — hiện tại ${language === "vi" ? "Tiếng Việt" : "English"}`}
            >
              {language === "vi" ? "VIE" : "ENG"}
            </button>

            {!isAuthenticated ? (
              <>
                <Link
                  to={`/register?redirect=${currentRedirect}`}
                  className="header-topbar-cta"
                >
                  Đăng Ký
                </Link>
                <Link
                  to={`/login?redirect=${currentRedirect}`}
                  className="header-topbar-login"
                >
                  Đăng Nhập
                </Link>
              </>
            ) : (
              <div className="header-topbar-auth">
                <div className="header-notif-wrap">
                  <button
                    type="button"
                    className="header-notif-btn"
                    aria-label="Thông báo"
                    onClick={() => {
                      setShowProfile(false);
                      setShowNotifications((v) => !v);
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M13.73 21a2 2 0 0 1-3.46 0"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="header-notif-badge">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>
                  {showNotifications && (
                    <NotificationDropdown
                      onClose={() => {
                        setShowNotifications(false);
                        notificationService
                          .getUnreadCount()
                          .then(setUnreadCount)
                          .catch(() => setUnreadCount(0));
                      }}
                    />
                  )}
                </div>

                <div className="header-profile-wrap">
                  <button
                    type="button"
                    className="header-profile-btn"
                    aria-label="Menu tài khoản"
                    onClick={() => {
                      setShowNotifications(false);
                      setShowProfile((v) => !v);
                    }}
                  >
                    <UserAvatar
                      avatar={user?.avatar}
                      name={user?.fullName}
                      className="header-profile-avatar"
                    />
                    {isApprovedSeller && (
                      <span
                        className="header-profile-seller-dot"
                        title="Người bán đã xác minh"
                      />
                    )}
                  </button>
                  {showProfile && (
                    <ProfileDropdown
                      onClose={closeDropdowns}
                      variant={profileVariant}
                    />
                  )}
                </div>
              </div>
            )}
          </nav>
        </div>
      </div>

      <div className="header-main">
        <div className="header-shell header-main-shell">
          <Link
            to="/"
            className="header-brand"
            aria-label="BidDoubleTk — Trang chủ"
          >
            <span className="header-brand-mark">
              <img
                className="header-brand-image"
                src="/images/logo/logo.png"
                alt="BidDoubleTk"
              />
            </span>
            <span className="header-brand-text">
              <strong>BidDoubleTk</strong>
              <small>Thương Mại - Đấu Giá</small>
            </span>
          </Link>

          <div className="header-main-tools">
            <form
              className="header-search"
              role="search"
              aria-label="Tìm kiếm sản phẩm"
              onSubmit={handleSearchSubmit}
            >
              <label htmlFor="search-input" className="sr-only">
                Tìm kiếm sản phẩm
              </label>
              <span className="header-search-icon" aria-hidden="true">
                ⌕
              </span>
              <input
                id="search-input"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm sản phẩm, thương hiệu, mã đấu giá..."
              />
              <button type="submit">Tìm kiếm</button>
            </form>

            <nav className="header-actions" aria-label="Hành động chính">
              <Link
                to="/cart"
                className="header-cart"
                aria-label={`Giỏ hàng — ${cartCount} sản phẩm`}
              >
                <svg
                  className="header-cart-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M6 6h15l-1.5 9H7.5L6 6Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M6 6 5 3H2"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <circle cx="9" cy="20" r="1.5" fill="currentColor" />
                  <circle cx="18" cy="20" r="1.5" fill="currentColor" />
                </svg>
                {cartCount > 0 && (
                  <span className="header-cart-badge">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>

              <Link
                to="/auction/browse"
                className="header-auction-cta btn-cta-effect"
                aria-label="Đấu giá trực tiếp"
              >
                <span className="header-auction-live">
                  <span className="header-auction-dot" aria-hidden="true" />
                  LIVE
                </span>
                <span className="header-auction-copy">
                  <small>Đấu giá ngay</small>
                  <strong>
                    Xem phiên
                    <span className="btn-cta-effect__arrow" aria-hidden="true">
                      {" "}
                      →
                    </span>
                  </strong>
                </span>
              </Link>
            </nav>
          </div>
        </div>
      </div>

      <nav className="header-subnav" aria-label="Đấu giá nổi bật">
        <div className="header-shell header-subnav-shell">
          <Link to="/auction/browse" className="header-pill header-pill-hot">
            <span className="header-pill-icon" aria-hidden="true">
              🔥
            </span>
            <strong>ĐẤU GIÁ HOT</strong>
          </Link>

          <div className="header-subnav-links">
            <a href="#iphone-16">iPhone 16 Pro – Giá từ 1k</a>
            <a href="#macbook-air-m3">MacBook Air M3</a>
            <a href="#son-romand">Son Romand Juicy 24</a>
          </div>
        </div>
      </nav>
    </header>
  );
}
