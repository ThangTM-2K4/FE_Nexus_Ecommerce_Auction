import PageHeader from "../../../components/seller/sellerPageHeader";
import MiniStat from "../../../components/seller/sellerMiniStat";
import { sellerNotifications, notificationSummary } from "../../../data/sellerMockData";
import { sellerImages } from "../../../data/sellerImages";

export default function NotificationsPage() {
  return (
    <div className="slr-page">
      <PageHeader
        title="Thông báo"
        subtitle="Đơn mới, tồn kho, khiếu nại và phiên đấu giá"
      />

      <section className="slr-section">
        <div className="slr-metrics-grid slr-metrics-grid--5">
          <MiniStat label="Chưa đọc" value={notificationSummary.unread} warn delay={0} />
          <MiniStat label="Hôm nay" value={notificationSummary.today} delay={60} />
          <MiniStat label="Đơn hàng" value={notificationSummary.orders} delay={120} />
          <MiniStat label="Tồn kho" value={notificationSummary.stock} delay={180} />
          <MiniStat label="Khiếu nại" value={notificationSummary.complaints} warn delay={240} />
        </div>

        <div className="slr-page-split">
          <div className="slr-panel-card">
            <h4>Danh sách thông báo</h4>
            <ul className="slr-noti-list">
              {sellerNotifications.map((n, i) => (
                <li
                  key={n.title}
                  className={`slr-noti-item ${n.unread ? "unread" : ""}`}
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <span className={`slr-noti-type slr-noti-type--${n.type}`}>
                    {n.type}
                  </span>
                  <div>
                    <strong>{n.title}</strong>
                    <p>{n.message}</p>
                  </div>
                  <time>{n.time}</time>
                </li>
              ))}
            </ul>
          </div>

          <aside className="slr-aside-panel">
            <div className="slr-media-card slr-media-card--banner">
              <img src={sellerImages.hero} alt="" />
              <div className="slr-media-card__overlay">
                <strong>Phiên đấu giá mới</strong>
                <span>Rolex Submariner — bắt đầu 20:00 hôm nay</span>
              </div>
            </div>
            <div className="slr-panel-card">
              <h4>Mẹo bán hàng</h4>
              <ul className="slr-tips-list">
                <li>Phản hồi đơn Pending trong vòng 2 giờ để tăng rating</li>
                <li>Cập nhật tồn kho trước phiên đấu giá trực tiếp</li>
                <li>Gửi email nhắc khách hàng quay lại sau 7 ngày</li>
              </ul>
            </div>
            <div className="slr-panel-card">
              <h4>Thông báo theo loại</h4>
              <table className="slr-table slr-table--compact">
                <thead>
                  <tr>
                    <th>Loại</th>
                    <th>Số lượng</th>
                    <th>Tuần này</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Đơn hàng</td>
                    <td>42</td>
                    <td className="pos">+12</td>
                  </tr>
                  <tr>
                    <td>Tồn kho</td>
                    <td>8</td>
                    <td className="pos">+3</td>
                  </tr>
                  <tr>
                    <td>Đấu giá</td>
                    <td>15</td>
                    <td className="pos">+5</td>
                  </tr>
                  <tr>
                    <td>Khiếu nại</td>
                    <td>3</td>
                    <td className="neg">+1</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
