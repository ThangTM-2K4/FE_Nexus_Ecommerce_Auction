import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import SwitchAccountModal from './SwitchAccountModal';
import './ProfileDropdown.scss';

export default function ProfileDropdown({ onClose, variant }) {
  const isStaff = variant === 'staff';
  const { user, logout, isApprovedSeller, isBuyerMode, switchAccountMode } = useAuth();
  const navigate = useNavigate();
  const panelRef = useRef(null);
  const [showSwitchModal, setShowSwitchModal] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        if (e.target.closest('.header-modal-overlay')) {
          return;
        }
        onClose?.();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleLogout = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    onClose?.();

    try {
      await logout();
      navigate('/login', { replace: true });
    } catch {
      navigate('/login', { replace: true });
    }
  };

  const handleSwitchMode = async (mode) => {
    try {
      await switchAccountMode(mode);
      setShowSwitchModal(false);
      onClose?.();
      navigate(mode === "SELLER" ? "/seller-hub/overview" : "/");
    } catch {
      /* mode not available */
    }
  };

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?';

  const sellerStatus = user?.sellerStatus;
  const currentModeLabel = isStaff
    ? 'Quản lý'
    : user?.currentMode === 'SELLER'
    ? 'Người bán'
    : 'Người mua';

  const becomeSellerItem = () => {
    if (isStaff) return null; // Trang quản lý không có mục "Trở thành Người bán"
    if (isApprovedSeller) return null;
    if (!sellerStatus) {
      return { to: '/profile/become-seller', label: 'Trở thành Người bán' };
    }
    if (sellerStatus === 'PENDING') {
      return { to: '/profile/become-seller', label: 'Đang chờ phê duyệt', disabled: true };
    }
    if (sellerStatus === 'REJECTED') {
      return { to: '/profile/become-seller', label: 'Đơn bị từ chối', disabled: false };
    }
    return null;
  };

  const menuItems = [
    { to: isStaff ? '/staff/profile' : '/profile', label: 'Hồ sơ của tôi' },
    becomeSellerItem(),
    // Chỉ seller đã duyệt mới được chuyển qua lại Người mua/Người bán
    // (không áp dụng cho tài khoản quản lý).
    !isStaff && isApprovedSeller ? { action: 'switch', label: 'Chuyển tài khoản' } : null,
  ].filter(Boolean);

  return (
    <>
      <div className="header-profile-panel" ref={panelRef} role="menu">
        <div className="header-profile-user">
          <span className="header-profile-avatar-lg">{initials}</span>
          <div>
            <strong>{user?.fullName}</strong>
            <small>{user?.email}</small>
            <span className="header-mode-indicator">
              Chế độ: {currentModeLabel}
            </span>
            {!isStaff && isApprovedSeller && (
              <span className="header-seller-badge">✓ Người bán đã xác minh</span>
            )}
          </div>
        </div>

        <nav className="header-profile-menu">
          {menuItems.map((item) => {
            if (item.action === 'switch') {
              return (
                <button
                  key="switch"
                  type="button"
                  className="header-profile-switch"
                  onClick={() => setShowSwitchModal(true)}
                  role="menuitem"
                >
                  {item.label}
                </button>
              );
            }

            if (item.disabled) {
              return (
                <span key={item.label} className="header-profile-disabled" role="menuitem">
                  {item.label}
                </span>
              );
            }

            return (
              <Link
                key={item.to + item.label}
                to={item.to}
                onClick={onClose}
                role="menuitem"
              >
                {item.label}
              </Link>
            );
          })}
          <button type="button" className="header-profile-logout" onClick={handleLogout}>
            Đăng xuất
          </button>
        </nav>
      </div>

      {showSwitchModal && (
        <SwitchAccountModal
          onClose={() => setShowSwitchModal(false)}
          onSwitch={handleSwitchMode}
        />
      )}
    </>
  );
}
