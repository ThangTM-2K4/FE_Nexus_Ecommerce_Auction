import { Outlet, useLocation } from "react-router-dom";
import SellerHeader from "../sellerHeader";
import SellerSidebar from "../sellerSidebar";
import "../../../styles/seller/_dashboard.scss";
import "./index.scss";

const SellerLayout = () => {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);
  const hubIdx = segments.indexOf("seller-hub");
  const activeId = hubIdx >= 0 && segments[hubIdx + 1] ? segments[hubIdx + 1] : "overview";

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
