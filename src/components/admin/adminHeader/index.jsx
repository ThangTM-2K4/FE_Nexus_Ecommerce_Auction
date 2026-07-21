import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { FaBell, FaSearch } from "react-icons/fa";
import { useAuth } from "../../../context/AuthContext";
import ProfileDropdown from "../../homepage/header/ProfileDropdown";
import {
  ADMIN_ROLE_LABELS,
  ADMIN_ROLES,
  getAdminRole,
  setAdminRole,
} from "../../../data/adminMockData";
import Select from "../../common/select";
import "./index.scss";

const ROLE_OPTIONS = Object.values(ADMIN_ROLES).map((value) => ({
  value,
  label: ADMIN_ROLE_LABELS[value],
}));

const AdminHeader = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [role, setRole] = useState(getAdminRole);

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "AD";

  const handleRoleChange = (e) => {
    const nextRole = e.target.value;
    setAdminRole(nextRole);
    setRole(nextRole);
    window.dispatchEvent(new Event("admin-role-change"));
  };

  return (
    <header className="adm-header">
      <div className="adm-header__inner">
        <div className="adm-header__left">
          <h1
            className="adm-header__logo"
            onClick={() => navigate("/admin/dashboard")}
            onKeyDown={(e) => e.key === "Enter" && navigate("/admin/dashboard")}
            role="button"
            tabIndex={0}
          >
            Admin Hub
          </h1>
          <span className="adm-header__badge">Quản trị hệ thống</span>
        </div>

        <div className="adm-header__search">
          <FaSearch />
          <input type="text" placeholder="Tìm user, đơn hàng, sản phẩm, đấu giá..." />
        </div>

        <div className="adm-header__actions">
          <Select
            className="adm-header__role common-select--sm common-select--auto"
            value={role}
            onChange={handleRoleChange}
            options={ROLE_OPTIONS}
          />

          <button type="button" className="adm-header__link" onClick={() => navigate("/")}>
            Trang chủ
          </button>
          <button
            type="button"
            className="adm-header__bell"
            aria-label="Thông báo"
            onClick={() => navigate("/admin/notifications")}
          >
            <FaBell />
            <span className="adm-header__bell-dot" />
          </button>
          <div className="adm-header__profile-wrap">
            <button
              type="button"
              className="adm-header__avatar"
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

export default AdminHeader;
