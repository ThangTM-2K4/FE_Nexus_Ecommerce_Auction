import { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../../context/AuthContext";
import "./index.scss";

export default function AuctionProfileDropdown({ onClose, onOpenSwitch }) {
  const { user, logout, isApprovedSeller, isBuyerMode } = useAuth();
  const navigate = useNavigate();
  const panelRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose?.();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleLogout = async () => {
    await logout();
    onClose?.();
    toast.success("Đã đăng xuất");
    navigate("/login");
  };

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  const sellerStatus = user?.sellerStatus;
  const currentModeLabel = isBuyerMode ? "Người mua" : "Người bán";

  const becomeSellerItem = () => {
    if (isApprovedSeller) return null;
    if (!sellerStatus) {
      return {
        to: "/profile/become-seller",
        label: "Đăng ký làm Người bán",
        highlight: true,
      };
    }
    if (sellerStatus === "PENDING") {
      return {
        to: "/profile/become-seller",
        label: "Đang chờ phê duyệt",
        disabled: true,
      };
    }
    if (sellerStatus === "REJECTED") {
      return {
        to: "/profile/become-seller",
        label: "Đơn bị từ chối — Gửi lại",
        highlight: true,
      };
    }
    return null;
  };

  const menuItems = [
    { to: "/auction/profile", label: "Hồ sơ & Uy tín" },
    { to: "/auction/my-bids", label: "My Bids" },
    becomeSellerItem(),
    isApprovedSeller ? { action: "switch", label: "Chuyển hồ sơ" } : null,
  ].filter(Boolean);

  return (
    <div className="auc-profile-panel" ref={panelRef} role="menu">
      <div className="auc-profile-panel__user">
        <span className="auc-profile-panel__avatar">{initials}</span>
        <div>
          <strong>{user?.fullName}</strong>
          <small>{user?.email}</small>
          <span className="auc-profile-panel__mode">
            Chế độ: {currentModeLabel}
          </span>
          {isApprovedSeller && (
            <span className="auc-profile-panel__badge">
              ✓ Người bán đã xác minh
            </span>
          )}
        </div>
      </div>

      <nav className="auc-profile-panel__menu">
        {menuItems.map((item) => {
          if (item.action === "switch") {
            return (
              <button
                key="switch"
                type="button"
                className="auc-profile-panel__switch"
                onClick={() => {
                  onClose?.();
                  onOpenSwitch?.();
                }}
                role="menuitem"
              >
                {item.label}
              </button>
            );
          }

          if (item.disabled) {
            return (
              <span
                key={item.label}
                className="auc-profile-panel__disabled"
                role="menuitem"
              >
                {item.label}
              </span>
            );
          }

          return (
            <Link
              key={item.to + item.label}
              to={item.to}
              className={item.highlight ? "highlight" : ""}
              onClick={onClose}
              role="menuitem"
            >
              {item.label}
            </Link>
          );
        })}
        <button
          type="button"
          className="auc-profile-panel__logout"
          onClick={handleLogout}
        >
          Đăng xuất
        </button>
      </nav>
    </div>
  );
}
