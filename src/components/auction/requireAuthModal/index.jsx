import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { FaLock, FaSignInAlt, FaUserPlus, FaTimes } from "react-icons/fa";
import "./index.scss";

export default function RequireAuthModal({
  isOpen,
  onClose,
  title = "Cần đăng nhập để thực hiện chức năng này",
  subtitle = "Vui lòng đăng nhập hoặc đăng ký tài khoản Nexus để theo dõi và tham gia các phiên đấu giá.",
}) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogin = () => {
    onClose?.();
    navigate("/login");
  };

  const handleRegister = () => {
    onClose?.();
    navigate("/register");
  };

  return createPortal(
    <div className="require-auth-overlay" onClick={onClose}>
      <div className="require-auth-modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="require-auth-close" onClick={onClose} aria-label="Đóng">
          <FaTimes />
        </button>

        <div className="require-auth-icon">
          <FaLock />
        </div>

        <h3 className="require-auth-title">{title}</h3>
        <p className="require-auth-subtitle">{subtitle}</p>

        <div className="require-auth-actions">
          <button type="button" className="require-auth-btn require-auth-btn--login" onClick={handleLogin}>
            <FaSignInAlt /> Đăng nhập
          </button>
          <button type="button" className="require-auth-btn require-auth-btn--register" onClick={handleRegister}>
            <FaUserPlus /> Đăng ký
          </button>
        </div>
      </div>

    </div>,
    document.body
  );
}

