import SellerSidebar from "../../../components/sellerSidebar";
import SellerHeader from "../../../components/sellerHeader";

import "./index.scss";

function SellerDashboard() {
  return (
    <>
      <SellerSidebar />
      <SellerHeader />

      <div className="seller-content">

        <div className="card">
          <h2>24</h2>
          <p>Total Auctions</p>
        </div>

        <div className="card">
          <h2>8</h2>
          <p>Active Auctions</p>
        </div>

        <div className="card">
          <h2>120</h2>
          <p>Orders</p>
        </div>

        <div className="card">
          <h2>50M</h2>
          <p>Revenue</p>
        </div>

      </div>
    </>
  );
}

export default SellerDashboard;