import SellerSidebar from "../../../components/sellerSidebar";
import SellerHeader from "../../../components/sellerHeader";
import "./index.scss";

function SellerOrders() {
  const orders = [
    {
      id: "ORD001",
      product: "Honda SH 2024",
      buyer: "Nguyễn Văn A",
      amount: "120.000.000đ",
      status: "Đã thanh toán",
    },
    {
      id: "ORD002",
      product: "iPhone 15 Pro",
      buyer: "Trần Văn B",
      amount: "25.000.000đ",
      status: "Chờ thanh toán",
    },
  ];

  return (
    <>
      <SellerSidebar />

      <div className="seller-page">
        <SellerHeader />

        <div className="seller-orders">
          <h2>Đơn Hàng</h2>

          <table>
            <thead>
              <tr>
                <th>Mã ĐH</th>
                <th>Sản phẩm</th>
                <th>Người mua</th>
                <th>Giá trị</th>
                <th>Trạng thái</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.product}</td>
                  <td>{item.buyer}</td>
                  <td>{item.amount}</td>
                  <td>{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default SellerOrders;