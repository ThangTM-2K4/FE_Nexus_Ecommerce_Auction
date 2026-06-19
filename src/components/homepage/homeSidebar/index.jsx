import { Link, useLocation } from 'react-router-dom';
import {
  FaHome,
  FaGavel,
  FaShoppingBag,
  FaFire,
  FaTag,
} from 'react-icons/fa';
import './index.scss';

const menuItems = [
  { id: 'home', label: 'Trang chủ', path: '/', icon: FaHome },
  { id: 'auction', label: 'Đấu giá', path: '/auction/browse', icon: FaGavel, highlight: true },
  { id: 'products', label: 'Sản phẩm', path: '/#products', icon: FaShoppingBag, hash: true },
  { id: 'deals', label: 'Deal hot', path: '/#featured', icon: FaFire, hash: true },
  { id: 'seller', label: 'Kênh người bán', path: '/seller-hub/overview', icon: FaTag },
];

export default function HomeSidebar() {
  const location = useLocation();

  const isActive = (item) => {
    if (item.id === 'auction') {
      return location.pathname.startsWith('/auction');
    }
    if (item.hash) {
      return location.pathname === '/' && location.hash === item.path.replace('/', '');
    }
    return location.pathname === item.path;
  };

  return (
    <aside className="home-sidebar" aria-label="Điều hướng trang chủ">
      <h2 className="home-sidebar__title">Danh mục</h2>
      <nav>
        <ul className="home-sidebar__menu">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <Link
                  to={item.path}
                  className={`home-sidebar__item ${isActive(item) ? 'active' : ''} ${
                    item.highlight ? 'highlight' : ''
                  }`}
                >
                  <Icon aria-hidden />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
