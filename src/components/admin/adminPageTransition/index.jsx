import { Outlet, useLocation } from "react-router-dom";
import "./index.scss";

const AdminPageTransition = ({ children }) => {
  const location = useLocation();
  return (
    <div key={location.pathname} className="adm-page-transition">
      {children}
    </div>
  );
};

export const AdminAnimatedView = ({ viewKey, children, className = "" }) => (
  <div key={viewKey} className={`adm-view-transition ${className}`}>
    {children}
  </div>
);

export const AdminStaggerGrid = ({ children, className = "" }) => (
  <div className={`adm-stagger-grid ${className}`}>{children}</div>
);

export default AdminPageTransition;
