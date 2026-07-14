import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FiMenu, FiSearch, FiX } from 'react-icons/fi';
import './index.scss';

const NAV_ITEMS = [
  { to: '/auction', label: 'Đấu giá', end: true },
  { to: '/auction#categories', label: 'Danh mục' },
  { to: '/auction#locations', label: 'Địa điểm' },
  { to: '/auction#how-it-works', label: 'Cách thức hoạt động' },
];

export default function AuctionHeader({ searchQuery = '', onSearchChange }) {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [localQuery, setLocalQuery] = useState(searchQuery);

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

  return (
    <header className="auction-header">
      <div className="auction-header__inner">
        <Link to="/auction" className="auction-header__logo" aria-label="BidDoubleTK — Khu đấu giá">
          <img src="/images/logo/logo.png" alt="BidDoubleTK" />
          <strong>
            Bid<span>DoubleTK</span>
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
          {NAV_ITEMS.map((item) => (
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
          <Link to="/" className="auction-header__home-link">
            Về cửa hàng
          </Link>
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
          {NAV_ITEMS.map((item) => (
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
