import AuctionHeader from "../auctionHeader";
import AuctionFooter from "../auctionFooter";
import AuctionSidebar from "../auctionSidebar";
import { sidebarMenuItems } from "../../../data/auctionMockData";
import { useAuth } from "../../../context/AuthContext";
import "./index.scss";

const AuctionLayout = ({
  children,
  activeTab = "buying",
  sidebarActive,
  showCategories = false,
  showSidebar = true,
}) => {
  const { isApprovedSeller, isBuyerMode } = useAuth();

  const menuItems = sidebarMenuItems.filter(
    (item) => !item.sellerOnly || isApprovedSeller
  );

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

