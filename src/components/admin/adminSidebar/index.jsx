import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaThLarge,
  FaUsers,
  FaIdCard,
  FaBox,
  FaGavel,
  FaFolder,
  FaTag,
  FaWarehouse,
  FaShoppingCart,
  FaHammer,
  FaHandPointer,
  FaCreditCard,
  FaWallet,
  FaMoneyBillWave,
  FaPercent,
  FaTicketAlt,
  FaTruck,
  FaStar,
  FaFlag,
  FaShieldAlt,
  FaHeadset,
  FaBell,
  FaImage,
  FaFileAlt,
  FaChartLine,
  FaCog,
  FaUserShield,
  FaHistory,
} from "react-icons/fa";
import { getFilteredMenuSections } from "../../../data/adminMockData";
import "./index.scss";

const icons = {
  grid: FaThLarge,
  users: FaUsers,
  idCard: FaIdCard,
  box: FaBox,
  gavel: FaGavel,
  folder: FaFolder,
  tag: FaTag,
  warehouse: FaWarehouse,
  cart: FaShoppingCart,
  hammer: FaHammer,
  handPointer: FaHandPointer,
  creditCard: FaCreditCard,
  wallet: FaWallet,
  moneyBill: FaMoneyBillWave,
  percent: FaPercent,
  ticket: FaTicketAlt,
  truck: FaTruck,
  star: FaStar,
  flag: FaFlag,
  shield: FaShieldAlt,
  headset: FaHeadset,
  bell: FaBell,
  image: FaImage,
  fileAlt: FaFileAlt,
  chartLine: FaChartLine,
  cog: FaCog,
  userShield: FaUserShield,
  history: FaHistory,
};

const AdminSidebar = ({ activeId, isOpen, onClose }) => {
  const navigate = useNavigate();
  const [sections, setSections] = useState(() => getFilteredMenuSections());

  useEffect(() => {
    const refresh = () => setSections(getFilteredMenuSections());
    window.addEventListener("admin-role-change", refresh);
    return () => window.removeEventListener("admin-role-change", refresh);
  }, []);

  const handleItemClick = (path) => {
    navigate(path);
    onClose?.();
  };

  return (
    <>
      {isOpen && (
        <div
          className="adm-sidebar-overlay"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside className={`adm-sidebar ${isOpen ? "is-open" : ""}`}>
        {sections.map((section) => (
          <div key={section.title} className="adm-sidebar__section">
            <h3>{section.title}</h3>
            <ul className="adm-sidebar__menu">
              {section.items.map((item) => {
                const Icon = icons[item.icon];
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      className={`adm-sidebar__item ${
                        activeId === item.id ? "active" : ""
                      }`}
                      onClick={() => handleItemClick(item.path)}
                    >
                      {Icon && <Icon />}
                      <span>{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        <div className="adm-sidebar__footer">
          <p>34 seller chờ duyệt · 47 khiếu nại đang mở</p>
          <button
            type="button"
            onClick={() => handleItemClick("/admin/seller-verification")}
          >
            Xử lý ưu tiên
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
