import { useNavigate } from "react-router-dom";
import {
  FaThLarge,
  FaChartLine,
  FaBox,
  FaShoppingCart,
  FaUsers,
  FaBullseye,
  FaStar,
  FaBell,
  FaWallet,
} from "react-icons/fa";
import { sidebarMenuItems } from "../../../data/sellerMockData";
import "./index.scss";

const icons = {
  grid: FaThLarge,
  chart: FaChartLine,
  box: FaBox,
  cart: FaShoppingCart,
  users: FaUsers,
  target: FaBullseye,
  star: FaStar,
  bell: FaBell,
  wallet: FaWallet,
};

const SellerSidebar = ({ activeId }) => {
  const navigate = useNavigate();

  return (
    <aside className="slr-sidebar">
      <div className="slr-sidebar__section">
        <h3>Bảng điều khiển</h3>
        <ul className="slr-sidebar__menu">
          {sidebarMenuItems.map((item) => {
            const Icon = icons[item.icon];
            return (
              <li key={item.id}>
                <button
                  type="button"
                  className={`slr-sidebar__item ${
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

      <div className="slr-sidebar__footer">
        <p>Nâng cấp gói Seller Pro</p>
        <button type="button">Xem gói dịch vụ</button>
      </div>
    </aside>
  );
};

export default SellerSidebar;
