import { Outlet, useLocation } from "react-router-dom";
import SellerHeader from "../sellerHeader";
import SellerSidebar from "../sellerSidebar";
import "../../../styles/_seller-dashboard.scss";
import "./index.scss";

const SellerLayout = () => {
  const location = useLocation();
  const activeId =
    location.pathname.split("/").filter(Boolean).pop() || "overview";

  return (
    <div className="slr-layout">
      <SellerHeader />
      <div className="slr-layout__body">
        <SellerSidebar activeId={activeId} />
        <main className="slr-layout__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SellerLayout;
