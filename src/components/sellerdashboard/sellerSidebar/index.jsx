import { useEffect, useState } from "react";
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
  FaStore,
  FaChevronDown,
  FaCog,
  FaQuestionCircle,
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
  store: FaStore,
  settings: FaCog,
  help: FaQuestionCircle,
};

const findGroupIdByChild = (activeId) => {
  const group = sidebarMenuItems.find((item) =>
    item.children?.some((child) => child.id === activeId)
  );
  return group?.id ?? null;
};

const SellerSidebar = ({ activeId }) => {
  const navigate = useNavigate();
  const [openGroupId, setOpenGroupId] = useState(() => findGroupIdByChild(activeId));

  useEffect(() => {
    const groupId = findGroupIdByChild(activeId);
    if (groupId) setOpenGroupId(groupId);
  }, [activeId]);

  const toggleGroup = (id) => {
    setOpenGroupId((prev) => (prev === id ? null : id));
  };

  return (
    <aside className="slr-sidebar">
      <div className="slr-sidebar__section">
        <h3>Bảng điều khiển</h3>
        <ul className="slr-sidebar__menu">
          {sidebarMenuItems.map((item) => {
            const Icon = icons[item.icon];

            if (item.children) {
              const isOpen = openGroupId === item.id;
              const hasActiveChild = item.children.some((child) => child.id === activeId);

              return (
                <li key={item.id} className="slr-sidebar__group">
                  <button
                    type="button"
                    className={`slr-sidebar__item slr-sidebar__item--group ${
                      hasActiveChild ? "active-group" : ""
                    }`}
                    onClick={() => toggleGroup(item.id)}
                    aria-expanded={isOpen}
                  >
                    <Icon />
                    <span>{item.label}</span>
                    <FaChevronDown className={`slr-sidebar__chevron ${isOpen ? "open" : ""}`} />
                  </button>
                  <div className={`slr-sidebar__submenu-wrap ${isOpen ? "open" : ""}`}>
                    <div className="slr-sidebar__submenu-inner">
                      <ul className="slr-sidebar__submenu">
                        {item.children.map((child) => (
                          <li key={child.id}>
                            <button
                              type="button"
                              className={`slr-sidebar__subitem ${
                                activeId === child.id ? "active" : ""
                              }`}
                              onClick={() => navigate(child.path)}
                            >
                              {child.label}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </li>
              );
            }

            return (
              <li key={item.id}>
                <button
                  type="button"
                  className={`slr-sidebar__item ${activeId === item.id ? "active" : ""}`}
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
    </aside>
  );
};

export default SellerSidebar;
