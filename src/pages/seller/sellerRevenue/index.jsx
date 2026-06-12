import SellerSidebar from "../../../components/sellerSidebar";
import SellerHeader from "../../../components/sellerHeader";
import "./index.scss";

function SellerRevenue() {
  return (
    <>
      <SellerSidebar />

      <div className="seller-page">
        <SellerHeader />

        <div className="seller-revenue">
          <h2>Doanh Thu</h2>

          <div className="revenue-cards">
            <div className="card">
              <h3>Tổng doanh thu</h3>
              <p>850.000.000đ</p>
            </div>

            <div className="card">
              <h3>Tháng này</h3>
              <p>120.000.000đ</p>
            </div>

            <div className="card">
              <h3>Hoa hồng</h3>
              <p>12.000.000đ</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default SellerRevenue;