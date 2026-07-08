import { useNavigate } from "react-router-dom";
import {
  FaThLarge,
  FaUserCheck,
  FaGavel,
  FaFlag,
  FaShoppingCart,
  FaShieldAlt,
  FaBell,
  FaBox,
} from "react-icons/fa";
import { sidebarMenuItems } from "../../../data/staffMockData";
import "./index.scss";

const icons = {
  grid: FaThLarge,
  userCheck: FaUserCheck,
  gavel: FaGavel,
  flag: FaFlag,
  cart: FaShoppingCart,
  shield: FaShieldAlt,
  bell: FaBell,
  box: FaBox,
};

const StaffSidebar = ({ activeId }) => {
  const navigate = useNavigate();

  return (
    <aside className="stf-sidebar">
      <div className="stf-sidebar__section">
        <h3>Vận hành</h3>
        <ul className="stf-sidebar__menu">
          {sidebarMenuItems.map((item) => {
            const Icon = icons[item.icon];
            return (
              <li key={item.id}>
                <button
                  type="button"
                  className={`stf-sidebar__item ${
                    activeId === item.id ? "active" : ""
                  }`}
                  onClick={() => navigate(item.path)}
                >
                  <Icon />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="stf-sidebar__footer">
        <p>12 đơn seller & 5 phiên đấu giá cần xử lý</p>
        <button type="button" onClick={() => navigate("/staff/seller-review")}>
          Xem việc ưu tiên
        </button>
      </div>
    </aside>
  );
};

export default StaffSidebar;
