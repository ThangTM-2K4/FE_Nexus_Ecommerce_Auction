import { useAuth } from "../../../context/AuthContext";
import "./index.scss";

export default function AuctionSwitchAccountModal({ onClose, onSwitch }) {
  const { user, isBuyerMode, isSellerMode, isApprovedSeller, loading } = useAuth();
  const sellerStatus = user?.sellerStatus;

  const handleSelect = (mode) => {
    if (mode === "SELLER" && !isApprovedSeller) return;
    if (mode === user?.currentMode) {
      onClose?.();
      return;
    }
    onSwitch?.(mode);
  };

  return (
    <div className="auc-switch-overlay" onClick={onClose} role="presentation">
      <div
        className="auc-switch-modal"
        role="dialog"
        aria-labelledby="auc-switch-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="auc-switch-modal__header">
          <h3 id="auc-switch-title">Chuyển chế độ tài khoản</h3>
          <button
            type="button"
            className="auc-switch-modal__close"
            onClick={onClose}
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>

        <div className="auc-switch-modal__body">
          <p className="auc-switch-modal__hint">
            Chế độ hiện tại:{" "}
            <strong>{isBuyerMode ? "Người mua" : "Người bán"}</strong>
          </p>

          <button
            type="button"
            className={`auc-switch-option ${isBuyerMode ? "active" : ""}`}
            onClick={() => handleSelect("BUYER")}
            disabled={loading}
          >
            <span className="auc-switch-option__icon">🛒</span>
            <div>
              <strong>Hồ sơ Người mua</strong>
              <small>Duyệt phiên đấu giá, đặt giá và theo dõi</small>
            </div>
            {isBuyerMode && <span className="auc-switch-option__check">✓</span>}
          </button>

          {sellerStatus == null && (
            <div className="auc-switch-option disabled">
              <span className="auc-switch-option__icon">🏪</span>
              <div>
                <strong>Hồ sơ Người bán</strong>
                <small>Đăng ký làm Người bán để kích hoạt</small>
              </div>
            </div>
          )}

          {sellerStatus === "PENDING" && (
            <div className="auc-switch-option disabled">
              <span className="auc-switch-option__icon">⏳</span>
              <div>
                <strong>Hồ sơ Người bán</strong>
                <small>Đang chờ phê duyệt</small>
              </div>
            </div>
          )}

          {sellerStatus === "REJECTED" && (
            <div className="auc-switch-option disabled">
              <span className="auc-switch-option__icon">✕</span>
              <div>
                <strong>Hồ sơ Người bán</strong>
                <small>Đơn đăng ký bị từ chối</small>
              </div>
            </div>
          )}

          {isApprovedSeller && (
            <button
              type="button"
              className={`auc-switch-option ${isSellerMode ? "active" : ""}`}
              onClick={() => handleSelect("SELLER")}
              disabled={loading}
            >
              <span className="auc-switch-option__icon">🏪</span>
              <div>
                <strong>Hồ sơ Người bán</strong>
                <small>Quản lý phiên đấu giá và sản phẩm</small>
              </div>
              {isSellerMode && <span className="auc-switch-option__check">✓</span>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
