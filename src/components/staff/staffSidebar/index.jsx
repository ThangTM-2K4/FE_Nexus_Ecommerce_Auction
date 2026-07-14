import { useEffect, useState } from "react";
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
  FaStore,
  FaHistory,
  FaUserCircle,
  FaUserShield,
  FaBoxOpen,
  FaFolder,
  FaHammer,
  FaTruck,
  FaServer,
  FaSearch,
  FaChevronDown,
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
  store: FaStore,
  history: FaHistory,
  user: FaUserCircle,
  userShield: FaUserShield,
  boxOpen: FaBoxOpen,
  folder: FaFolder,
  hammer: FaHammer,
  truck: FaTruck,
  server: FaServer,
  search: FaSearch,
};

// Icon đại diện cho mỗi nhóm (dùng ở header accordion).
const groupIcons = {
  "Vận hành": "grid",
  "Kiểm duyệt": "userCheck",
  "Tra cứu": "search",
  "Quản lý": "store",
  "Hỗ trợ & An toàn": "shield",
  "Giám sát": "server",
  "Cá nhân": "user",
};

// Giữ thứ tự nhóm xuất hiện lần đầu trong danh sách menu.
const groupItems = (items) => {
  const groups = [];
  const byName = new Map();
  items.forEach((item) => {
    const name = item.group || "Khác";
    if (!byName.has(name)) {
      const g = { name, items: [] };
      byName.set(name, g);
      groups.push(g);
    }
    byName.get(name).items.push(item);
  });
  return groups;
};

const findGroupOfActive = (groups, activeId) =>
  groups.find((g) => g.items.some((it) => it.id === activeId))?.name ?? null;

const StaffSidebar = ({ activeId }) => {
  const navigate = useNavigate();
  const groups = groupItems(sidebarMenuItems);

  // Mở sẵn nhóm chứa trang đang xem.
  const [openGroup, setOpenGroup] = useState(() => findGroupOfActive(groups, activeId));

  useEffect(() => {
    const name = findGroupOfActive(groups, activeId);
    if (name) setOpenGroup(name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  const toggleGroup = (name) => {
    setOpenGroup((prev) => (prev === name ? null : name));
  };

  return (
    <aside className="stf-sidebar">
      <ul className="stf-sidebar__menu">
        {groups.map((group) => {
          // Nhóm chỉ có 1 mục → hiển thị như link trực tiếp cho gọn.
          if (group.items.length === 1) {
            const item = group.items[0];
            const Icon = icons[item.icon] || FaThLarge;
            return (
              <li key={group.name}>
                <button
                  type="button"
                  className={`stf-sidebar__item ${activeId === item.id ? "active" : ""}`}
                  onClick={() => navigate(item.path)}
                >
                  <Icon />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          }

          // Nhóm nhiều mục → accordion sổ ra.
          const GroupIcon = icons[groupIcons[group.name]] || FaThLarge;
          const isOpen = openGroup === group.name;
          const hasActiveChild = group.items.some((it) => it.id === activeId);

          return (
            <li key={group.name} className="stf-sidebar__group">
              <button
                type="button"
                className={`stf-sidebar__item stf-sidebar__item--group ${
                  hasActiveChild ? "active-group" : ""
                }`}
                onClick={() => toggleGroup(group.name)}
                aria-expanded={isOpen}
              >
                <GroupIcon />
                <span>{group.name}</span>
                <FaChevronDown className={`stf-sidebar__chevron ${isOpen ? "open" : ""}`} />
              </button>

              <div className={`stf-sidebar__submenu-wrap ${isOpen ? "open" : ""}`}>
                <div className="stf-sidebar__submenu-inner">
                  <ul className="stf-sidebar__submenu">
                    {group.items.map((item) => {
                      const Icon = icons[item.icon] || FaThLarge;
                      return (
                        <li key={item.id}>
                          <button
                            type="button"
                            className={`stf-sidebar__subitem ${
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
              </div>
            </li>
          );
        })}
      </ul>

      <div className="stf-sidebar__footer">
        <p>12 đơn seller &amp; 5 phiên đấu giá cần xử lý</p>
        <button type="button" onClick={() => navigate("/staff/seller-review")}>
          Xem việc ưu tiên
        </button>
      </div>
    </aside>
  );
};

export default StaffSidebar;
