import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { FiMenu, FiSearch, FiX } from 'react-icons/fi';
import { FaWallet, FaUser, FaTrophy, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext';
import './index.scss';

const NAV_ITEMS = [
  { to: '/auction', label: 'Đấu giá', end: true },
  { to: '/auction/categories', label: 'Danh mục' },
  { to: '/auction/locations', label: 'Địa điểm' },
  { to: '/auction/how-it-works', label: 'Cách thức hoạt động' },
  { to: '/auction/my-bids', label: 'Đấu giá của tôi' },
];

export default function AuctionHeader({ searchQuery = '', onSearchChange }) {
  const navigate = useNavigate();
  const { user, isBuyerMode, isSellerMode, logout, isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const profileRef = useRef(null);
  const [searchParams] = useSearchParams();
  const fromAdmin = searchParams.get('from') === 'admin';

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

  const avatarUrl =
    user?.avatar ||
    user?.avatarUrl ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
  const userName = user?.name || user?.fullName || 'Nguyễn Minh Đức';
  const userEmail = user?.email || 'minhduc@nexus.com';

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

        <form className="auction-header__search" onSubmit={handleSearchSubmit} role="search">
          <FiSearch size={16} aria-hidden />
          <input
            type="search"
            placeholder="Tìm phiên đấu giá, sản phẩm..."
            value={localQuery}
            onChange={handleInputChange}
            aria-label="Tìm kiếm đấu giá"
          />
        </form>

        <nav className="auction-header__nav" aria-label="Điều hướng đấu giá">
          {!fromAdmin && isBuyerMode &&
            NAV_ITEMS.map((item) => (
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
          ) : (
            <Link to="/" className="auction-header__home-link">
              Về cửa hàng
            </Link>
          )}

          {isSellerMode && (
            <>
              <Link
                to="/auction/profile"
                className="auction-header__home-link"
                style={{ borderColor: 'transparent' }}
              >
                Hồ sơ
              </Link>
              <Link
                to="/auction/create"
                className="auction-header__home-link"
                style={{
                  background: 'rgba(123, 76, 171, 0.45)',
                  color: '#fff',
                  borderColor: 'transparent',
                }}
              >
                Tạo đấu giá mới
              </Link>
            </>
          )}

          {/* ─── Profile Avatar Button ─── */}
          <div className="auction-header__profile-container" ref={profileRef}>
            <button
              type="button"
              className="auction-header__profile-trigger"
              onClick={() => setShowProfileMenu((prev) => !prev)}
              title="Hồ sơ tài khoản & Ví tiền"
            >
              <img src={avatarUrl} alt={userName} className="profile-avatar-circle" />
            </button>

            {showProfileMenu && (
              <div className="auction-header__profile-dropdown">
                <div className="dropdown-user-header">
                  <img src={avatarUrl} alt={userName} className="dropdown-avatar-large" />
                  <div>
                    <strong className="dropdown-name">{userName}</strong>
                    <span className="dropdown-email">{userEmail}</span>
                  </div>
                </div>

                <div className="dropdown-wallet-card">
                  <div className="wallet-row">
                    <span>
                      <FaWallet style={{ color: '#e8c468', marginRight: 4 }} /> Ví Nexus Pay:
                    </span>
                    <strong className="balance-val">50.000.000 ₫</strong>
                  </div>
                  <div className="wallet-row sub">
                    <span>Tiền cọc đóng băng:</span>
                    <span className="frozen-val">0 ₫</span>
                  </div>
                </div>

                <ul className="dropdown-nav-list">
                  <li>
                    <Link to="/auction/my-bids" onClick={() => setShowProfileMenu(false)}>
                      <FaTrophy className="menu-icon" style={{ color: '#e8c468' }} /> Đấu giá của tôi
                    </Link>
                  </li>
                  <li>
                    <Link to="/profile/personal-info" onClick={() => setShowProfileMenu(false)}>
                      <FaUser className="menu-icon" /> Thông tin tài khoản
                    </Link>
                  </li>
                  {isAuthenticated ? (
                    <li>
                      <button
                        type="button"
                        className="dropdown-logout-btn"
                        onClick={() => {
                          logout();
                          setShowProfileMenu(false);
                          navigate('/login');
                        }}
                      >
                        <FaSignOutAlt className="menu-icon" /> Đăng xuất
                      </button>
                    </li>
                  ) : (
                    <li>
                      <Link to="/login" onClick={() => setShowProfileMenu(false)}>
                        🔑 Đăng nhập
                      </Link>
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>

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
          <form className="auction-header__mobile-search" onSubmit={handleSearchSubmit}>
            <FiSearch size={15} aria-hidden />
            <input
              type="search"
              placeholder="Tìm kiếm..."
              value={localQuery}
              onChange={handleInputChange}
              aria-label="Tìm kiếm đấu giá"
            />
          </form>
          {!fromAdmin && isBuyerMode &&
            NAV_ITEMS.map((item) => (
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
    </header>
  );
}
