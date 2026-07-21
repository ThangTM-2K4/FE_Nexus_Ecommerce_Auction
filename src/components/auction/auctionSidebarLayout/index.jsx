import AuctionSidebar from "../auctionSidebar";
import { sidebarMenuItems } from "../../../data/auctionMockData";
import { useAuth } from "../../../context/AuthContext";
import "./index.scss";

export default function AuctionSidebarLayout({ children, sidebarActive, showCategories = false }) {
  const { isApprovedSeller, isBuyerMode } = useAuth();

  const menuItems = sidebarMenuItems.filter(
    (item) => !item.sellerOnly || isApprovedSeller
  );

  return (
    <div className="auc-sidebar-layout">
      <AuctionSidebar
        activeItem={sidebarActive}
        menuItems={menuItems}
        showCategories={showCategories && isBuyerMode}
      />
      <div className="auc-sidebar-layout__content">{children}</div>
    </div>
  );
}
