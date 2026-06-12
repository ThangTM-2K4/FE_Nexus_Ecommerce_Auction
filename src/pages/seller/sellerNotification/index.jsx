import SellerSidebar from "../../../components/sellerSidebar";
import SellerHeader from "../../../components/sellerHeader";
import "./index.scss";

function SellerNotification() {
  const notifications = [
    {
      id: 1,
      title: "Phiên đấu giá đã kết thúc",
      time: "5 phút trước",
    },
    {
      id: 2,
      title: "Bạn nhận được đơn hàng mới",
      time: "20 phút trước",
    },
    {
      id: 3,
      title: "Yêu cầu rút tiền thành công",
      time: "1 giờ trước",
    },
  ];

  return (
    <div className="seller-layout">
      <SellerSidebar />

      <div className="seller-content">
        <SellerHeader />

        <div className="notification-page">
          <h2>Thông báo</h2>

          {notifications.map((item) => (
            <div
              key={item.id}
              className="notification-card"
            >
              <h4>{item.title}</h4>
              <span>{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SellerNotification;