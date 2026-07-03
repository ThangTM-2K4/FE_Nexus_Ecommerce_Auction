import StaffPageHeader from "../../../components/staff/staffPageHeader";
import { staffNotifications } from "../../../data/staffMockData";
import "./index.scss";

const StaffPlaceholder = ({ kicker, title, subtitle }) => (
  <div className="stf-placeholder">
    <StaffPageHeader kicker={kicker} title={title} subtitle={subtitle} />
    <div className="stf-placeholder__box">
      <p>Trang đang được phát triển. Dữ liệu mock sẽ được kết nối API sau.</p>
    </div>
  </div>
);

export const StaffOrders = () => (
  <StaffPlaceholder
    kicker="Giám sát"
    title="Giám sát đơn hàng"
    subtitle="Theo dõi đơn hàng bất thường, giao chậm hoặc giá trị cao."
  />
);

export const StaffReports = () => (
  <StaffPlaceholder
    kicker="An toàn"
    title="Báo cáo vi phạm"
    subtitle="Xử lý báo cáo hàng giả, lừa đảo và vi phạm chính sách."
  />
);

export const StaffNotifications = () => (
  <div className="stf-placeholder">
    <StaffPageHeader
      kicker="Thông báo"
      title="Thông báo nội bộ"
      subtitle="Cập nhật công việc ưu tiên và cảnh báo vận hành."
    />
    <ul className="stf-notifications">
      {staffNotifications.map((item) => (
        <li key={item.title} className={item.unread ? "unread" : ""}>
          <div>
            <strong>{item.title}</strong>
            <p>{item.message}</p>
          </div>
          <span>{item.time}</span>
        </li>
      ))}
    </ul>
  </div>
);

export default StaffPlaceholder;
