import AuctionHeader from "../AuctionHeader";
import AuctionFooter from "../AuctionFooter";
import AuctionSidebar from "../AuctionSidebar";
import { sidebarMenuItems } from "../../data/mockData";
import { useAuth } from "../../../context/AuthContext";
import "./index.scss";

const AuctionLayout = ({
  children,
  activeTab = "buying",
  sidebarActive,
  showCategories = false,
  showSidebar = true,
}) => {
  const { isApprovedSeller, isSellerMode, isBuyerMode } = useAuth();

  const menuItems = sidebarMenuItems.filter((item) => {
    if (isApprovedSeller && isSellerMode) {
      return item.section === "sell";
    }
    return item.section === "buy";
  });

  return (
    <div className="auc-layout">
      <AuctionHeader activeTab={activeTab} />
      <div className="auc-layout__body">
        {showSidebar && (
          <AuctionSidebar
            activeItem={sidebarActive}
            menuItems={menuItems}
            showCategories={showCategories && isBuyerMode}
          />
        )}
        <div className="auc-layout__content">{children}</div>
      </div>
      <AuctionFooter />
    </div>
  );
};

export default AuctionLayout;
