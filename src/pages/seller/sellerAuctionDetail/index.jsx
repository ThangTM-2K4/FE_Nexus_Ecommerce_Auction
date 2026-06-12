import SellerSidebar from "../../../components/sellerSidebar";
import "./index.scss";

function SellerAuctionDetail() {
  return (
    <div className="seller-page">

      <SellerSidebar />

      <div className="seller-content">

        <div className="detail-grid">

          <div className="product-card">

            <img
              src="https://via.placeholder.com/500x300"
              alt=""
            />

            <h2>
              iPhone 15 Pro Max
            </h2>

            <p>
              Phiên bản 256GB,
              chính hãng VN/A
            </p>

          </div>

          <div className="auction-info">

            <div className="info-box">
              <h4>Giá hiện tại</h4>
              <h2>25.000.000₫</h2>
            </div>

            <div className="info-box">
              <h4>Người tham gia</h4>
              <h2>42</h2>
            </div>

            <div className="info-box">
              <h4>Thời gian còn lại</h4>
              <h2>02 ngày</h2>
            </div>

          </div>

        </div>

        <div className="bid-history">

          <h2>Lịch sử đấu giá</h2>

          <table>

            <thead>
              <tr>
                <th>Người dùng</th>
                <th>Giá đấu</th>
                <th>Thời gian</th>
              </tr>
            </thead>

            <tbody>

              <tr>
                <td>user01</td>
                <td>24.000.000₫</td>
                <td>10:25</td>
              </tr>

              <tr>
                <td>user02</td>
                <td>25.000.000₫</td>
                <td>10:30</td>
              </tr>

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default SellerAuctionDetail;