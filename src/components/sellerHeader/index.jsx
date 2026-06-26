import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./index.scss";

function SellerHeader() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "K";

  const handleLogout = async () => {
    await logout();
    setOpen(false);
    navigate("/login", { replace: true });
  };

  return (
    <header className="seller-header">
      <h3>Trung tâm người bán</h3>

      <div className="header-right">
        <button className="notification" type="button">
          🔔
        </button>

        <div className="avatar-wrapper">
          <div
            className="avatar"
            onClick={() => setOpen(!open)}
          >
            {initials}
          </div>

          {open && (
            <div className="dropdown">
              <div
                onClick={() =>
                  navigate("/seller/profile")
                }
              >
                Hồ sơ cá nhân
              </div>

              <div
                onClick={() =>
                  navigate("/seller/settings")
                }
              >
                Cài đặt
              </div>

              <div onClick={handleLogout}>
                Đăng xuất
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default SellerHeader;
