import { Outlet } from "react-router-dom";
import "./index.scss";

function Layout() {
  return (
    <div className="layout">
      <div className="layout-wrapper">
        <Outlet />
      </div>
    </div>
  );
}

export default Layout;