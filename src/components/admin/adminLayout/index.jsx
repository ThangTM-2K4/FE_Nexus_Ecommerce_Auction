import { Outlet, useLocation } from "react-router-dom";
import AdminHeader from "../adminHeader";
import AdminSidebar from "../adminSidebar";
import AdminPageTransition from "../adminPageTransition";
import "./index.scss";

const AdminLayout = () => {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);
  const activeId = segments[1] || "dashboard";

  return (
    <div className="adm-layout">
      <AdminHeader />
      <div className="adm-layout__body">
        <AdminSidebar activeId={activeId} />
        <main className="adm-layout__content">
          <AdminPageTransition>
            <Outlet />
          </AdminPageTransition>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
