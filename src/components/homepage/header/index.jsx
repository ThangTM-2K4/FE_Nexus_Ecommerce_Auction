import "./index.scss";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../context/AuthContext";
import { useCart } from "../../../context/CartContext";
import * as notificationService from "../../../services/notificationService";
import { getCategoryTree } from "../../../services/catalogService";
import { buildProductListUrl, navigateProductTag } from "../../../utils/resolveProductTagNavigation";
import NotificationDropdown from "./NotificationDropdown";
import ProfileDropdown from "./ProfileDropdown";
import UserAvatar from "../../common/userAvatar";

const QUICK_SEARCH_TAGS = [
  { id: "iphone", labelKey: "header.tags.iphone", search: "iPhone 16 Pro" },
  { id: "macbook", labelKey: "header.tags.macbook", search: "MacBook Air M3" },
  { id: "romand", labelKey: "header.tags.romand", search: "Son Romand Juicy 24" },
];

const TREND_TAGS = [
  {
    id: "crocs",
    labelKey: "header.tags.crocs",
    search: "Dép Sục Crocs",
    categoryKeywords: ["crocs", "dep", "giay", "giày"],
  },
  {
    id: "ao-he",
    labelKey: "header.tags.summerShirt",
    search: "Áo Hè",
    categoryKeywords: ["ao", "áo", "thoi trang", "thời trang", "fashion"],
  },
  {
    id: "kinh",
    labelKey: "header.tags.mirror",
    search: "Kính Gương",
    categoryKeywords: ["kinh", "kính", "phu kien", "phụ kiện"],
  },
];

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const currentRedirect = encodeURIComponent(location.pathname + location.search);

  const [searchQuery, setSearchQuery] = useState("");
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [categories, setCategories] = useState([]);
  const langMenuRef = useRef(null);

  const {
    isAuthenticated,
    user,
    isApprovedSeller,
    isSellerMode,
    switchAccountMode,
  } = useAuth();
  const { cartCount } = useCart();

  const userRoles = (() => {
    const raw = [];
    if (user?.role) raw.push(user.role);
    if (user?.roleName) raw.push(user.roleName);
    if (user?.roleCode) raw.push(user.roleCode);
    if (Array.isArray(user?.roles)) raw.push(...user.roles);
    return raw
      .map((r) => (typeof r === "string" ? r : r?.code ?? r?.name ?? ""))
      .filter(Boolean)
      .map((s) => String(s).toUpperCase().replace(/^ROLE_/, ""));
  })();
  const isAdmin = userRoles.some((r) => r === "ADMIN" || r === "SUPER_ADMIN");
  const isStaffRole = userRoles.some((r) => r === "STAFF" || r === "SUPPORT_STAFF");
  const isAdminOrStaff = isAdmin || isStaffRole;
  const profileVariant = isAdmin ? "admin" : isStaffRole ? "staff" : undefined;

  const currentLang = i18n.language?.startsWith("en") ? "en" : "vi";

  useEffect(() => {
    if (!user?.id) {
      setUnreadCount(0);
      return;
    }
    notificationService.getUnreadCount(user.id).then(setUnreadCount);
  }, [user?.id, showNotifications]);

  useEffect(() => {
    getCategoryTree()
      .then((items) => setCategories(Array.isArray(items) ? items : []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (location.pathname === "/products") {
      const params = new URLSearchParams(location.search);
      setSearchQuery(params.get("search") || "");
    }
  }, [location.pathname, location.search]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target)) {
        setShowLangMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLanguageSelect = (lang) => {
    i18n.changeLanguage(lang);
    setShowLangMenu(false);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const keyword = searchQuery.trim();
    if (!keyword) return;
    const { pathname, search } = buildProductListUrl({ search: keyword });
    navigate(`${pathname}${search}`);
  };

  const handleTagClick = (tag) => {
    navigateProductTag(navigate, categories, tag);
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

  const sellerLinkLabel = (() => {
    if (user?.sellerStatus === "PENDING") return t("header.sellerPending");
    if (user?.sellerStatus === "REJECTED") return t("header.sellerRejected");
    return t("header.becomeSeller");
  })();

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
                {t("header.sellerChannel")}
              </button>
            ) : (
              <a href="#seller-center">{t("header.sellerChannel")}</a>
            )}
            {!isApprovedSeller && !isAdminOrStaff && (
              <Link to={isAuthenticated ? "/profile/become-seller" : "/register"}>
                {sellerLinkLabel}
              </Link>
            )}
            <a href="#app">{t("header.downloadApp")}</a>
            <a href="#connect">{t("header.connect")}</a>
          </nav>

          <nav
            className="header-topbar-group header-topbar-group-right"
            aria-label="User account"
          >
            <a href="#support">{t("header.support")}</a>

            <div className="header-language-wrap" ref={langMenuRef}>
              <button
                type="button"
                className="header-language"
                onClick={() => setShowLangMenu((v) => !v)}
                aria-expanded={showLangMenu}
                aria-haspopup="listbox"
                aria-label={t("header.language")}
              >
                {currentLang === "vi" ? "VIE" : "ENG"}
              </button>
              {showLangMenu && (
                <ul className="header-language-menu" role="listbox">
                  <li>
                    <button
                      type="button"
                      role="option"
                      aria-selected={currentLang === "vi"}
                      className={currentLang === "vi" ? "active" : ""}
                      onClick={() => handleLanguageSelect("vi")}
                    >
                      {t("header.langVi")}
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      role="option"
                      aria-selected={currentLang === "en"}
                      className={currentLang === "en" ? "active" : ""}
                      onClick={() => handleLanguageSelect("en")}
                    >
                      {t("header.langEn")}
                    </button>
                  </li>
                </ul>
              )}
            </div>

            {!isAuthenticated ? (
              <>
                <Link to={`/register?redirect=${currentRedirect}`} className="header-topbar-cta">
                  {t("header.register")}
                </Link>
                <Link to={`/login?redirect=${currentRedirect}`} className="header-topbar-login">
                  {t("header.login")}
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
                        if (user?.id) {
                          notificationService.getUnreadCount(user.id).then(setUnreadCount);
                        }
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
                    <ProfileDropdown onClose={closeDropdowns} variant={profileVariant} />
                  )}
                </div>
              </div>
            )}
          </nav>
        </div>
      </div>

      <div className="header-main">
        <div className="header-shell header-main-shell">
          <Link to="/" className="header-brand" aria-label="BidDoubleTk — Trang chủ">
            <span className="header-brand-mark">
              <img className="header-brand-image" src="/images/logo/logo.png" alt="BidDoubleTk" />
            </span>
            <span className="header-brand-text">
              <strong>BidDoubleTk</strong>
              <small>{t("header.brandTagline")}</small>
            </span>
          </Link>

          <div className="header-main-tools">
            <form
              className="header-search"
              role="search"
              aria-label={t("header.searchLabel")}
              onSubmit={handleSearchSubmit}
            >
              <label htmlFor="search-input" className="sr-only">
                {t("header.searchLabel")}
              </label>
              <span className="header-search-icon" aria-hidden="true">
                ⌕
              </span>
              <input
                id="search-input"
                type="search"
                name="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("header.searchPlaceholder")}
                autoComplete="off"
              />
              <button type="submit">{t("header.searchSubmit")}</button>
            </form>

            <nav className="header-actions" aria-label="Hành động chính">
              <Link
                to="/cart"
                className="header-cart"
                aria-label={t("header.cartAria", { count: cartCount })}
              >
                <svg className="header-cart-svg" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
                  <span className="header-cart-badge">{cartCount > 99 ? "99+" : cartCount}</span>
                )}
              </Link>

              <Link
                to="/auction/browse"
                className="header-auction-cta btn-cta-effect"
                aria-label="Đấu giá trực tiếp"
              >
                <span className="header-auction-live">
                  <span className="header-auction-dot" aria-hidden="true" />
                  {t("header.auctionLive")}
                </span>
                <span className="header-auction-copy">
                  <small>{t("header.auctionSoon")}</small>
                  <strong>
                    {t("header.auctionView")}
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
            <strong>{t("header.auctionHot")}</strong>
          </Link>

          <div className="header-subnav-links">
            {QUICK_SEARCH_TAGS.map((tag) => (
              <button
                key={tag.id}
                type="button"
                className="header-tag-btn"
                onClick={() => handleTagClick(tag)}
              >
                {t(tag.labelKey)}
              </button>
            ))}
          </div>

          <div className="header-subnav-trending">
            <span className="header-trending-label">{t("header.trendingLabel")}</span>
            {TREND_TAGS.map((tag) => (
              <button
                key={tag.id}
                type="button"
                className="header-tag-btn header-tag-btn--muted"
                onClick={() => handleTagClick(tag)}
              >
                {t(tag.labelKey)}
              </button>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
}
