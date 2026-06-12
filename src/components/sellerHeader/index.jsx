import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./index.scss";

function SellerHeader() {
  const [open, setOpen] = useState(false);

  const navigate = useNavigate();

  return (
    <header className="seller-header">
      <h3>Trung tâm người bán</h3>

      <div className="header-right">

        <button className="notification">
          🔔
        </button>

        <div className="avatar-wrapper">

          <div
            className="avatar"
            onClick={() => setOpen(!open)}
          >
            K
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

              <div
                onClick={() => {
                  localStorage.removeItem(
                    "user"
                  );
                  navigate("/");
                }}
              >
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