import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaGavel,
  FaTag,
  FaHeart,
  FaUser,
  FaCompass,
  FaPlus,
  FaChartBar,
} from "react-icons/fa";
import { getCategories } from "../../../services/adminCategoryService";
import AuctionImage from "../auctionImage";
import "./index.scss";

const icons = {
  compass: FaCompass,
  gavel: FaGavel,
  tag: FaTag,
  heart: FaHeart,
  user: FaUser,
  plus: FaPlus,
  chart: FaChartBar,
};

const sectionLabels = {
  buy: "Mua hàng",
  sell: "Bán hàng",
};

const AuctionSidebar = ({
  activeItem,
  menuItems,
  showCategories = false,
}) => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    async function loadCats() {
      try {
        const res = await getCategories();
        if (res && res.length > 0) {
          setCategories(res);
        }
      } catch {}
    }
    if (showCategories) loadCats();
  }, [showCategories]);

  const sections = ["buy", "sell"].filter((section) =>
    menuItems.some((item) => item.section === section)
  );

  const handleNavigate = (item) => {
    if (item.hash) {
      navigate({ pathname: item.path, hash: item.hash });
      return;
    }
    navigate(item.path);
  };

  return (
    <aside className="auc-sidebar">
      {sections.map((section) => {
        const items = menuItems.filter((item) => item.section === section);
        if (!items.length) return null;

        return (
          <div key={section} className="auc-sidebar__section">
            <h3>{sectionLabels[section]}</h3>
            <ul className="auc-sidebar__menu">
              {items.map((item) => {
                const Icon = icons[item.icon];
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      className={`auc-sidebar__item ${
                        item.id === activeItem ? "active" : ""
                      }`}
                      onClick={() => handleNavigate(item)}
                    >
                      <Icon />
                      <span>{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}

      {showCategories && (
        <div className="auc-sidebar__section">
          <h3>Danh mục</h3>
          <ul className="auc-sidebar__menu">
            {categories.map((cat) => (
              <li key={cat.id}>
                <button
                  type="button"
                  className="auc-sidebar__item auc-sidebar__item--thumb"
                >
                  <AuctionImage
                    src={cat.icon || "/images/auction/default.png"}
                    alt={cat.name}
                    className="auc-sidebar__thumb"
                  />
                  <span>{cat.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="auc-sidebar__footer">
        <p>Tài khoản Người đấu giá Vip</p>
        <button type="button">Upgrade Account</button>
      </div>
    </aside>
  );
};

export default AuctionSidebar;

