import './index.scss';
import logoImage from '../../assets/logo.png';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Header() {
  const [language, setLanguage] = useState('vi');

  const handleLanguageChange = () => {
    setLanguage(language === 'vi' ? 'en' : 'vi');
  };

  return (
    <header className="header" role="banner">
      <div className="header-topbar" aria-label="Secondary navigation">
        <div className="header-shell header-topbar-shell">
          <nav className="header-topbar-group" aria-label="Seller services">
            <a href="#seller-center">Kênh Người Bán</a>
            <a href="#become-seller">Trở thành Người bán</a>
            <a href="#app">Tải ứng dụng</a>
            <a href="#connect">Kết nối</a>
          </nav>

          <nav className="header-topbar-group header-topbar-group-right" aria-label="User account">
            <a href="#support">Hỗ Trợ</a>
            <button
              type="button"
              className="header-language"
              onClick={handleLanguageChange}
              aria-label={`Đổi ngôn ngữ — hiện tại ${language === 'vi' ? 'Tiếng Việt' : 'English'}`}
            >
              {language === 'vi' ? '🇻🇳 Tiếng Việt' : '🇬🇧 English'}
            </button>
            <Link to="/register" className="header-topbar-cta">Đăng Ký</Link>
            <Link to="/login" className="header-topbar-login">Đăng Nhập</Link>
          </nav>
        </div>
      </div>

      <div className="header-main">
        <div className="header-shell header-main-shell">
          <a href="/" className="header-brand" aria-label="Shop Auction — Trang chủ">
            <span className="header-brand-mark">
              <img className="header-brand-image" src={logoImage} alt="" />
            </span>
            <span className="header-brand-text">
              <strong>
                Shop <span className="header-brand-accent">Auction</span>
              </strong>
              <small>Đấu giá thông minh</small>
            </span>
          </a>

          <div className="header-main-tools">
            <form className="header-search" role="search" aria-label="Tìm kiếm sản phẩm">
              <label htmlFor="search-input" className="sr-only">Tìm kiếm sản phẩm</label>
              <span className="header-search-icon" aria-hidden="true">⌕</span>
              <input
                id="search-input"
                type="search"
                placeholder="Tìm sản phẩm, thương hiệu, mã đấu giá..."
              />
              <button type="submit">Tìm kiếm</button>
            </form>

            <nav className="header-actions" aria-label="Hành động chính">
              <a href="/cart" className="header-cart" aria-label="Giỏ hàng — 3 sản phẩm">
                <svg className="header-cart-svg" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M6 6h15l-1.5 9H7.5L6 6Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                  <path d="M6 6 5 3H2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <circle cx="9" cy="20" r="1.5" fill="currentColor" />
                  <circle cx="18" cy="20" r="1.5" fill="currentColor" />
                </svg>
                <span className="header-cart-badge">3</span>
              </a>

              <a href="#auction" className="header-auction-cta btn-cta-effect" aria-label="Đấu giá trực tiếp">
                <span className="header-auction-live">
                  <span className="header-auction-dot" aria-hidden="true" />
                  LIVE
                </span>
                <span className="header-auction-copy">
                  <small>Đấu giá ngay</small>
                  <strong>
                    Xem phiên
                    <span className="btn-cta-effect__arrow" aria-hidden="true"> →</span>
                  </strong>
                </span>
              </a>
            </nav>
          </div>
        </div>
      </div>

      <nav className="header-subnav" aria-label="Đấu giá nổi bật">
        <div className="header-shell header-subnav-shell">
          <a href="#auction-hot" className="header-pill header-pill-hot">
            <span className="header-pill-icon" aria-hidden="true">🔥</span>
            <strong>ĐẤU GIÁ HOT</strong>
          </a>

          <div className="header-subnav-links">
            <a href="#iphone-16">iPhone 16 Pro – Giá từ 1k</a>
            <a href="#macbook-air-m3">MacBook Air M3</a>
            <a href="#son-romand">Son Romand Juicy 24</a>
          </div>

          <div className="header-subnav-trending">
            <span className="header-trending-label">Xu hướng</span>
            <a href="#crocs">Dép Sục Crocs</a>
            <a href="#ao-he">Áo Hè</a>
            <a href="#kinh-guong">Kính Gương</a>
          </div>
        </div>
      </nav>
    </header>
  );
}
