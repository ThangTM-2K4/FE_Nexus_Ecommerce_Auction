import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import UserAvatar from '../../common/userAvatar';
import { ACCOUNT_MENU } from '../../../data/accountMenu';
import './index.scss';

function isActivePath(currentPath, itemPath) {
  if (!itemPath) return false;

  const [path] = itemPath.split('#');

  if (path === '/profile') {
    return currentPath === '/profile' || currentPath === '/profile/';
  }

  return currentPath === path;
}

export default function AccountSidebar() {
  const { pathname } = useLocation();
  const { user } = useAuth();

  return (
    <aside className="account-sidebar" aria-label="Menu tài khoản">
      <div className="account-sidebar__user">
        <UserAvatar
          avatar={user?.avatar}
          name={user?.fullName}
          className="account-sidebar__avatar"
        />
        <div>
          <strong>{user?.fullName}</strong>
          <Link to="/profile" className="account-sidebar__edit-link">
            ✏️ Sửa Hồ Sơ
          </Link>
        </div>
      </div>

      <nav className="account-sidebar__nav">
        {ACCOUNT_MENU.map((item) => {
          if (item.children) {
            return (
              <div key={item.key} className="account-sidebar__group">
                <span className="account-sidebar__group-label">{item.label}</span>
                <ul>
                  {item.children.map((child) => (
                    <li key={child.key}>
                      <Link
                        to={child.path}
                        className={isActivePath(pathname, child.path) ? 'is-active' : ''}
                      >
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          }

          return (
            <Link
              key={item.key}
              to={item.path}
              className={`account-sidebar__link ${isActivePath(pathname, item.path) ? 'is-active' : ''}`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
