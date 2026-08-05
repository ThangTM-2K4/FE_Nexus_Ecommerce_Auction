import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../../context/AuthContext';
import { getMyWallets } from '../../../services/walletService';
import SwitchAccountModal from './SwitchAccountModal';
import TopUpModal from '../../common/TopUpModal';
import UserAvatar from '../../common/userAvatar';
import './ProfileDropdown.scss';

export default function ProfileDropdown({ onClose, variant }) {
  const isStaff = variant === 'staff';
  const isAdmin = variant === 'admin';
  const { user, logout, isApprovedSeller, isBuyerMode, switchAccountMode } = useAuth();
  const navigate = useNavigate();
  const panelRef = useRef(null);
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [liveWallet, setLiveWallet] = useState(null);

  const fetchWallets = () => {
    if (user) {
      getMyWallets().then((res) => {
        if (res?.wallets && res.wallets.length > 0) {
          const buyerWd = res.wallets.find((w) => w.walletType === 'BUYER') || res.wallets[0];
          setLiveWallet({
            available: buyerWd.availableBalance ?? 0,
            pending: buyerWd.pendingBalance ?? 0,
            walletType: 'BUYER',
          });
        }
      });
    }
  };

  useEffect(() => {
    fetchWallets();
  }, [user, isBuyerMode]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        if (e.target.closest('.header-modal-overlay') || e.target.closest('.topup-modal-overlay')) {
          return;
        }
        onClose?.();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleLogout = async (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    onClose?.();

    try {
      await logout();
      toast.success("Đã đăng xuất tài khoản");
    } catch {
      /* ignore */
    } finally {
      navigate("/", { replace: true });
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

  const sellerStatus = user?.sellerStatus;
  const currentModeLabel = isAdmin
    ? 'Admin'
    : isStaff
    ? 'Quản lý'
    : user?.currentMode === 'SELLER'
    ? 'Người bán'
    : 'Người mua';

  const becomeSellerItem = () => {
    if (isStaff || isAdmin) return null;
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
    { to: isAdmin ? '/admin/profile' : isStaff ? '/staff/profile' : '/profile', label: 'Hồ sơ của tôi' },
    becomeSellerItem(),
    !isStaff && !isAdmin && isApprovedSeller ? { action: 'switch', label: 'Chuyển tài khoản' } : null,
  ].filter(Boolean);

  return (
    <>
      <div className="header-profile-panel" ref={panelRef} role="menu">
        <div className="header-profile-user">
          <UserAvatar
            avatar={user?.avatar}
            name={user?.fullName}
            className="header-profile-avatar-lg"
          />
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

        {/* Ví Nexus Pay Card - CHỈ HIỂN THỊ Ở CHẾ ĐỘ NGƯỜI MUA (BUYER) */}
        {!isStaff && !isAdmin && isBuyerMode && (
          <div
            className="header-profile-wallet-card"
            style={{
              margin: '10px 12px 6px 12px',
              padding: '12px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(232, 196, 104, 0.15), rgba(195, 160, 93, 0.05))',
              border: '1px solid rgba(232, 196, 104, 0.3)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: '0.8rem', color: '#8c7643', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                💳 Ví Nexus Pay
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTopUpModal(true);
                }}
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#0c0b0a',
                  background: 'linear-gradient(135deg, #C3A05D, #9A7245)',
                  border: 'none',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                + Nạp tiền
              </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: '#555' }}>Số dư khả dụng:</span>
              <strong style={{ color: '#2e7d32', fontWeight: 700 }}>
                {`${(liveWallet?.available ?? user?.balance ?? 0).toLocaleString('vi-VN')} ₫`}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: 4 }}>
              <span style={{ color: '#777' }}>Tiền cọc đóng băng:</span>
              <span style={{ color: '#d32f2f', fontWeight: 600 }}>
                {`${(liveWallet?.pending ?? user?.frozenBalance ?? 0).toLocaleString('vi-VN')} ₫`}
              </span>
            </div>
          </div>
        )}

        <nav className="header-profile-menu">
          {menuItems.map((item) => {
            if (item.action === 'topup') {
              return (
                <button
                  key="topup"
                  type="button"
                  className="header-profile-switch highlight"
                  onClick={() => setShowTopUpModal(true)}
                  role="menuitem"
                >
                  {item.label}
                </button>
              );
            }

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

      {showTopUpModal && (
        <TopUpModal
          onClose={() => setShowTopUpModal(false)}
          onSuccess={() => fetchWallets()}
        />
      )}
    </>
  );
}
