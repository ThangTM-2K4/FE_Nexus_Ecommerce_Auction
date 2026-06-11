import { useNavigate } from "react-router-dom";
import {
  FaGavel,
  FaTag,
  FaHeart,
  FaCog,
  FaUser,
} from "react-icons/fa";
import { productCategories } from "../../data/mockData";
import AuctionImage from "../AuctionImage";
import "./index.scss";

const icons = {
  gavel: FaGavel,
  tag: FaTag,
  heart: FaHeart,
  settings: FaCog,
  user: FaUser,
};

const AuctionSidebar = ({
  activeItem,
  menuItems,
  showCategories = false,
}) => {
  const navigate = useNavigate();

  return (
    <aside className="auc-sidebar">
      <div className="auc-sidebar__section">
        <h3>Danh mục</h3>
        <ul className="auc-sidebar__menu">
          {menuItems.map((item) => {
            const Icon = icons[item.icon];
            return (
              <li key={item.id}>
                <button
                  type="button"
                  className={`auc-sidebar__item ${
                    item.id === activeItem ? "active" : ""
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

      {showCategories && (
        <div className="auc-sidebar__section">
          <h3>Sản phẩm</h3>
          <ul className="auc-sidebar__menu">
            {productCategories.map((cat) => (
              <li key={cat.id}>
                <button type="button" className="auc-sidebar__item auc-sidebar__item--thumb">
                  <AuctionImage
                    src={cat.image}
                    alt={cat.label}
                    className="auc-sidebar__thumb"
                  />
                  <span>{cat.label}</span>
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
