import { Outlet, useLocation } from "react-router-dom";
import StaffHeader from "../staffHeader";
import StaffSidebar from "../staffSidebar";
import "./index.scss";

const StaffLayout = () => {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);
  const activeId = segments[1] || "overview";

  return (
    <div className="stf-layout">
      <StaffHeader />
      <div className="stf-layout__body">
        <StaffSidebar activeId={activeId} />
        <main className="stf-layout__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StaffLayout;
