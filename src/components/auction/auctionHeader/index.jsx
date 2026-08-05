import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate, useSearchParams, useLocation } from 'react-router-dom';

import { FiMenu, FiSearch, FiX } from 'react-icons/fi';
import { FaWallet, FaUser, FaTrophy, FaSignOutAlt, FaExchangeAlt } from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext';
import { getMyWallets } from '../../../services/walletService';
import SwitchAccountModal from '../../homepage/header/SwitchAccountModal';
import './index.scss';

const NAV_ITEMS = [
  { to: '/auction', label: 'Đấu giá', end: true },
  { to: '/auction/categories', label: 'Danh mục' },
  { to: '/auction/locations', label: 'Địa điểm' },
  { to: '/auction/how-it-works', label: 'Cách thức hoạt động' },
  { to: '/auction/my-bids', label: 'Đấu giá của tôi', requiresAuth: true },
];


export default function AuctionHeader({ searchQuery = '', onSearchChange }) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentRedirect = encodeURIComponent(location.pathname + location.search);
  const { user, isBuyerMode, isSellerMode, isApprovedSeller, logout, isAuthenticated, switchAccountMode } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSwitchModal, setShowSwitchModal] = useState(false);

  const profileRef = useRef(null);
  const [searchParams] = useSearchParams();
  const fromAdmin = searchParams.get('from') === 'admin';
  const [liveWallet, setLiveWallet] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      getMyWallets().then((res) => {
        if (res?.wallets && res.wallets.length > 0) {
          const mainWd = res.wallets.find((w) => w.walletType === 'BUYER') || res.wallets[0];
          setLiveWallet({
            available: mainWd.availableBalance ?? 0,
            pending: mainWd.pendingBalance ?? 0,
          });
        }
      }).catch(() => {});
    }
  }, [isAuthenticated]);

  const handleSwitchMode = async (mode) => {
    try {
      await switchAccountMode(mode);
      setShowSwitchModal(false);
      setShowProfileMenu(false);
      if (mode === "SELLER") {
        navigate("/seller");
      } else {
        navigate("/auction");
      }
    } catch {
      /* ignore */
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    onSearchChange?.(localQuery.trim());
    navigate('/auction');
    setMobileOpen(false);
  };

  const handleInputChange = (event) => {
    setLocalQuery(event.target.value);
    onSearchChange?.(event.target.value);
  };

  const avatarUrl = user?.avatar || user?.avatarUrl;
  const userName = user?.fullName || user?.name || user?.username || 'Người dùng';
  const userEmail = user?.email || '';

  return (
    <header className="auction-header">
      <div className="auction-header__inner">
        <Link to="/auction" className="auction-header__logo" aria-label="BidDoubleTK — Khu đấu giá">
          <img src="/images/logo/logo.png" alt="BidDoubleTK" />
          <strong>
            Bid<span>DoubleTK</span>{' '}
            <span
              className="auction-tag"
              style={{
                fontSize: '10px',
                color: '#E8C468',
                marginLeft: '4px',
                verticalAlign: 'middle',
                textTransform: 'uppercase',
              }}
            >
              Auction
            </span>
          </strong>
        </Link>



        <nav className="auction-header__nav" aria-label="Điều hướng đấu giá">
          {!fromAdmin && isBuyerMode &&
            NAV_ITEMS
              .filter((item) => !item.requiresAuth || isAuthenticated)
              .map((item) => (
                <NavLink
                  key={item.label}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => (isActive ? 'is-active' : undefined)}
                >
                  {item.label}
                </NavLink>
              ))}
        </nav>


        <div className="auction-header__actions">
          {fromAdmin ? (
            <Link to="/admin/auction-products" className="auction-header__home-link">
              Về quản lý phiên đấu giá
            </Link>
          ) : isSellerMode ? (
            <Link
              to="/auction"
              className="auction-header__home-link"
              style={{
                background: 'rgba(232, 196, 104, 0.12)',
                borderColor: 'rgba(232, 196, 104, 0.4)',
                color: '#E8C468',
                fontWeight: '600',
              }}
            >
              Sảnh Đấu giá
            </Link>
          ) : (
            <Link to="/" className="auction-header__home-link">
              Về cửa hàng
            </Link>
          )}

          {isAuthenticated && isSellerMode && (
            <>
              <Link
                to="/seller"
                className="auction-header__home-link"
                style={{
                  background: 'rgba(232, 196, 104, 0.12)',
                  borderColor: 'rgba(232, 196, 104, 0.4)',
                  color: '#E8C468',
                  fontWeight: '600',
                }}
              >
                Kênh Quản Lý Seller
              </Link>
              <Link
                to="/auction/create"
                className="auction-header__home-link"
                style={{
                  background: 'linear-gradient(135deg, #C3A05D, #9A7245)',
                  borderColor: 'transparent',
                  color: '#0C0B0A',
                  fontWeight: '700',
                }}
              >
                Tạo đấu giá mới
              </Link>
            </>
          )}

          {!isAuthenticated ? (
            <>
              <Link
                to={`/login?redirect=${currentRedirect}`}
                className="auction-header__home-link"
                style={{
                  background: 'linear-gradient(135deg, #C3A05D, #9A7245)',
                  color: '#0C0B0A',
                  borderColor: 'transparent',
                  fontWeight: '700',
                }}
              >
                Đăng nhập
              </Link>
              <Link
                to={`/register?redirect=${currentRedirect}`}
                className="auction-header__home-link"
                style={{
                  background: 'rgba(83, 173, 190, 0.12)',
                  borderColor: 'rgba(83, 173, 190, 0.5)',
                  color: '#53ADBE',
                }}
              >
                Đăng ký
              </Link>
            </>
          ) : (


            /* ─── Profile Avatar Button ─── */
            <div className="auction-header__profile-container" ref={profileRef}>
              <button
                type="button"
                className="auction-header__profile-trigger"
                onClick={() => setShowProfileMenu((prev) => !prev)}
                title="Hồ sơ tài khoản & Ví tiền"
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt={userName} className="profile-avatar-circle" />
                ) : (
                  <div
                    className="profile-avatar-circle"
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #C3A05D, #9A7245)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '14px',
                    }}
                  >
                    {(userName[0] || 'U').toUpperCase()}
                  </div>
                )}
              </button>

              {showProfileMenu && (
                <div className="auction-header__profile-dropdown">
                  <div className="dropdown-user-header">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={userName} className="dropdown-avatar-large" />
                    ) : (
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #C3A05D, #9A7245)',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          fontSize: '18px',
                          flexShrink: 0,
                        }}
                      >
                        {(userName[0] || 'U').toUpperCase()}
                      </div>
                    )}
                    <div>
                      <strong className="dropdown-name">{userName}</strong>
                      {userEmail && <span className="dropdown-email">{userEmail}</span>}
                    </div>
                  </div>

                  <div className="dropdown-wallet-card">
                    <div className="wallet-row">
                      <span>
                        <FaWallet style={{ color: '#e8c468', marginRight: 4 }} /> Ví Nexus Pay:
                      </span>
                      <strong className="balance-val">
                        {`${(liveWallet?.available ?? user?.balance ?? 0).toLocaleString()} ₫`}
                      </strong>
                    </div>
                    <div className="wallet-row sub">
                      <span>Tiền cọc đóng băng:</span>
                      <span className="frozen-val">
                        {`${(liveWallet?.pending ?? user?.frozenBalance ?? 0).toLocaleString()} ₫`}
                      </span>
                    </div>
                  </div>

                  <ul className="dropdown-nav-list">

                    {isSellerMode && (
                      <li>
                        <Link to="/seller" onClick={() => setShowProfileMenu(false)}>
                          <FaUser className="menu-icon" style={{ color: '#e8c468' }} /> Kênh Quản Lý Seller
                        </Link>
                      </li>
                    )}

                    <li>
                      <Link to="/auction/my-bids" onClick={() => setShowProfileMenu(false)}>
                        <FaTrophy className="menu-icon" style={{ color: '#e8c468' }} /> Đấu giá của tôi
                      </Link>
                    </li>
                    <li>
                      <Link to="/auction/profile" onClick={() => setShowProfileMenu(false)}>
                        <FaUser className="menu-icon" /> Hồ sơ cá nhân đấu giá
                      </Link>
                    </li>

                    <li>
                      <button
                        type="button"
                        className="dropdown-logout-btn"
                        onClick={async () => {
                          setShowProfileMenu(false);
                          try {
                            await logout();
                            toast.success("Đã đăng xuất tài khoản");
                          } catch {
                            /* ignore */
                          } finally {
                            navigate("/", { replace: true });
                          }
                        }}
                      >
                        <FaSignOutAlt className="menu-icon" /> Đăng xuất
                      </button>

                    </li>
                  </ul>
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            className="auction-header__menu-btn"
            aria-label={mobileOpen ? 'Đóng menu' : 'Mở menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="auction-header__mobile-nav" aria-label="Menu đấu giá di động">

          {!fromAdmin && isBuyerMode &&
            NAV_ITEMS
              .filter((item) => !item.requiresAuth || isAuthenticated)
              .map((item) => (
                <NavLink
                  key={item.label}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => (isActive ? 'is-active' : undefined)}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </NavLink>
              ))}
        </nav>
      )}

      {showSwitchModal && (
        <SwitchAccountModal
          onClose={() => setShowSwitchModal(false)}
          onSwitch={handleSwitchMode}
        />
      )}
    </header>
  );
}

