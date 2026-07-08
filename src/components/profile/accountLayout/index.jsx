import AccountSidebar from '../accountSidebar';
import './index.scss';

export default function AccountLayout({ children, title, description }) {
  return (
    <div className="account-layout">
      <AccountSidebar />
      <div className="account-layout__content">
        {(title || description) && (
          <header className="account-layout__header">
            {title && <h1>{title}</h1>}
            {description && <p>{description}</p>}
          </header>
        )}
        {children}
      </div>
    </div>
  );
}
