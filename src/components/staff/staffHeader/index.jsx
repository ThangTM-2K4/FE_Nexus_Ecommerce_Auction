import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { FaBell, FaSearch } from "react-icons/fa";
import { useAuth } from "../../../context/AuthContext";
import ProfileDropdown from "../../homepage/header/ProfileDropdown";
import { staffNotifications } from "../../../data/staffMockData";
import "./index.scss";

const StaffHeader = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showProfile, setShowProfile] = useState(false);

  const unreadCount = staffNotifications.filter((n) => n.unread).length;

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "ST";

  return (
    <header className="stf-header">
      <div className="stf-header__inner">
        <div className="stf-header__left">
          <h1
            className="stf-header__logo"
            onClick={() => navigate("/staff/overview")}
            onKeyDown={(e) => e.key === "Enter" && navigate("/staff/overview")}
            role="button"
            tabIndex={0}
          >
            Staff Hub
          </h1>
          <span className="stf-header__badge">Kênh Nhân Viên</span>
        </div>

        <div className="stf-header__search">
          <FaSearch />
          <input type="text" placeholder="Tìm đơn, phiên đấu giá, khiếu nại..." />
        </div>

        <div className="stf-header__actions">
          <button type="button" className="stf-header__link" onClick={() => navigate("/")}>
            Trang chủ
          </button>
          <button
            type="button"
            className="stf-header__bell"
            aria-label="Thông báo"
            onClick={() => navigate("/staff/notifications")}
          >
            <FaBell />
            {unreadCount > 0 && <span className="stf-header__bell-dot" />}
          </button>
          <div className="stf-header__profile-wrap">
            <button
              type="button"
              className="stf-header__avatar"
              aria-label="Tài khoản"
              onClick={() => setShowProfile((v) => !v)}
            >
              <span>{initials}</span>
            </button>

            {showProfile && (
              <ProfileDropdown onClose={() => setShowProfile(false)} />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default StaffHeader;
