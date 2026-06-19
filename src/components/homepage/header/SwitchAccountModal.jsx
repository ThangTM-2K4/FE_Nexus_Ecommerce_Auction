import { useAuth } from '../../../context/AuthContext';
import './SwitchAccountModal.scss';

export default function SwitchAccountModal({ onClose, onSwitch }) {
  const { user, isBuyerMode, isSellerMode, isApprovedSeller, loading } = useAuth();

  const sellerStatus = user?.sellerStatus;

  const handleSelect = (mode) => {
    if (mode === 'SELLER' && !isApprovedSeller) return;
    if (mode === user?.currentMode) {
      onClose?.();
      return;
    }
    onSwitch?.(mode);
  };

  return (
    <div className="header-modal-overlay" onClick={onClose} role="presentation">
      <div
        className="header-modal"
        role="dialog"
        aria-labelledby="switch-account-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="header-modal-header">
          <h3 id="switch-account-title">Chuyển chế độ tài khoản</h3>
          <button type="button" className="header-modal-close" onClick={onClose} aria-label="Đóng">
            ✕
          </button>
        </div>

        <div className="header-modal-body">
          <p className="header-modal-hint">
            Chế độ hiện tại: <strong>{isBuyerMode ? 'Người mua' : 'Người bán'}</strong>
          </p>

          <button
            type="button"
            className={`header-mode-option ${isBuyerMode ? 'active' : ''}`}
            onClick={() => handleSelect('BUYER')}
            disabled={loading}
          >
            <span className="header-mode-option-icon">🛒</span>
            <div>
              <strong>Chế độ Người mua</strong>
              <small>Duyệt sản phẩm, tham gia đấu giá và mua hàng</small>
            </div>
            {isBuyerMode && <span className="header-mode-check">✓</span>}
          </button>

          {sellerStatus == null && (
            <div className="header-mode-option disabled">
              <span className="header-mode-option-icon">🏪</span>
              <div>
                <strong>Chế độ Người bán</strong>
                <small>Trở thành Người bán để kích hoạt</small>
              </div>
            </div>
          )}

          {sellerStatus === 'PENDING' && (
            <div className="header-mode-option disabled">
              <span className="header-mode-option-icon">⏳</span>
              <div>
                <strong>Chế độ Người bán</strong>
                <small>Đang chờ phê duyệt</small>
              </div>
            </div>
          )}

          {sellerStatus === 'REJECTED' && (
            <div className="header-mode-option disabled">
              <span className="header-mode-option-icon">✕</span>
              <div>
                <strong>Chế độ Người bán</strong>
                <small>Đơn đăng ký bị từ chối</small>
              </div>
            </div>
          )}

          {isApprovedSeller && (
            <button
              type="button"
              className={`header-mode-option ${isSellerMode ? 'active' : ''}`}
              onClick={() => handleSelect('SELLER')}
              disabled={loading}
            >
              <span className="header-mode-option-icon">🏪</span>
              <div>
                <strong>Chế độ Người bán</strong>
                <small>Quản lý cửa hàng và phiên đấu giá</small>
              </div>
              {isSellerMode && <span className="header-mode-check">✓</span>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
