import AuctionHeader from "../AuctionHeader";
import AuctionFooter from "../AuctionFooter";
import AuctionSidebar from "../AuctionSidebar";
import { sidebarMenuItems } from "../../data/mockData";
import "./index.scss";

const AuctionLayout = ({
  children,
  activeTab = "buying",
  sidebarActive,
  showCategories = false,
  showSidebar = true,
}) => (
  <div className="auc-layout">
    <AuctionHeader activeTab={activeTab} />
    <div className="auc-layout__body">
      {showSidebar && (
        <AuctionSidebar
          activeItem={sidebarActive}
          menuItems={sidebarMenuItems}
          showCategories={showCategories}
        />
      )}
      <div className="auc-layout__content">{children}</div>
    </div>
    <AuctionFooter />
  </div>
);

export default AuctionLayout;
