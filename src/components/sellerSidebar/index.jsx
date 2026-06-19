import { NavLink } from "react-router-dom";
import "./index.scss";

function SellerSidebar() {
  return (
    <aside className="seller-sidebar">
      <h2> SELLER</h2>

      <nav>
        <NavLink to="/seller/dashboard">
          📊 Tổng quan
        </NavLink>

        <NavLink to="/seller/auctions">
          🏷️ Phiên đấu giá
        </NavLink>

        <NavLink to="/seller/create-auction">
          ➕ Tạo phiên đấu giá
        </NavLink>

        <NavLink to="/seller/orders">
          📦 Đơn hàng
        </NavLink>

        <NavLink to="/seller/revenue">
          💰 Doanh thu
        </NavLink>

        <NavLink to="/seller/wallet">
          👛 Ví tiền
        </NavLink>
      </nav>
    </aside>
  );
}

export default SellerSidebar;