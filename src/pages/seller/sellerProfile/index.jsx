import { useState } from "react";
import "./index.scss";

function SellerProfile() {
  const [user] = useState({
    fullName: "Nguyễn Trần Duy Khang",
    email: "seller@gmail.com",
    phone: "0901234567",
    shopName: "Khang Auction Store",
  });

  return (
    <div className="seller-profile">

      <div className="profile-card">

        <div className="avatar">
          K
        </div>

        <h2>{user.fullName}</h2>

        <p>Seller Account</p>

        <div className="profile-info">

          <div className="info-item">
            <label>Email</label>
            <input
              value={user.email}
              readOnly
            />
          </div>

          <div className="info-item">
            <label>Số điện thoại</label>
            <input
              value={user.phone}
              readOnly
            />
          </div>

          <div className="info-item">
            <label>Tên cửa hàng</label>
            <input
              value={user.shopName}
              readOnly
            />
          </div>

        </div>

      </div>

    </div>
  );
}

export default SellerProfile;