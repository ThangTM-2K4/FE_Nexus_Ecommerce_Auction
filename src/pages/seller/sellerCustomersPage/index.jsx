import PageHeader from "../../../components/seller/sellerPageHeader";
import MiniStat from "../../../components/seller/sellerMiniStat";
import KpiCard from "../../../components/seller/sellerKpiCard";
import {
  customerStats,
  topCustomers,
  customerSegments,
  recentCustomers,
} from "../../../data/sellerMockData";
import { sellerImages } from "../../../data/sellerImages";

export default function CustomersPage() {
  return (
    <div className="slr-page">
      <PageHeader title="Khách hàng" subtitle="Phân tích hành vi và giá trị khách hàng" />

      <section className="slr-section">
        <div className="slr-metrics-grid slr-metrics-grid--4">
          {[
            { label: "Tổng KH", value: customerStats.total },
            { label: "KH mới", value: customerStats.newCustomers },
            { label: "KH quay lại", value: customerStats.returning },
            { label: "VIP", value: customerStats.vip },
          ].map((s, i) => (
            <MiniStat key={s.label} {...s} delay={i * 60} />
          ))}
        </div>

        <div className="slr-metrics-grid slr-metrics-grid--3">
          <KpiCard
            label="Retention Rate"
            value={`${customerStats.retentionRate}%`}
            delay={0}
          />
          <KpiCard
            label="Repeat Purchase"
            value={`${customerStats.repeatPurchaseRate}%`}
            delay={80}
          />
          <KpiCard
            label="Giá trị KH trung bình"
            value={customerStats.avgCustomerValue}
            delay={160}
          />
        </div>

        <div className="slr-page-split">
          <div className="slr-table-col">
            <div className="slr-panel-card">
              <h4>Phân khúc khách hàng</h4>
              <table className="slr-table slr-table--compact">
                <thead>
                  <tr>
                    <th>Phân khúc</th>
                    <th>Số lượng</th>
                    <th>Chi tiêu</th>
                    <th>Tăng trưởng</th>
                  </tr>
                </thead>
                <tbody>
                  {customerSegments.map((s) => (
                    <tr key={s.segment}>
                      <td><strong>{s.segment}</strong></td>
                      <td>{s.count.toLocaleString("vi-VN")}</td>
                      <td>{s.spend}</td>
                      <td className={s.negative ? "neg" : "pos"}>{s.growth}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="slr-panel-card">
              <h4>Top khách hàng</h4>
              <table className="slr-table slr-table--compact">
                <thead>
                  <tr>
                    <th>Khách hàng</th>
                    <th>Số đơn</th>
                    <th>Chi tiêu</th>
                  </tr>
                </thead>
                <tbody>
                  {topCustomers.map((c) => (
                    <tr key={c.name}>
                      <td>{c.name}</td>
                      <td>{c.orders}</td>
                      <td>{c.spent}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="slr-aside-panel">
            <div className="slr-media-card slr-media-card--banner">
              <img src={sellerImages.catFashion} alt="" />
              <div className="slr-media-card__overlay">
                <strong>1.842 khách hàng</strong>
                <span>68% quay lại mua trong 90 ngày</span>
              </div>
            </div>
            <div className="slr-panel-card">
              <h4>Khách hàng mới</h4>
              <table className="slr-table slr-table--compact">
                <thead>
                  <tr>
                    <th>Khách hàng</th>
                    <th>Đơn</th>
                    <th>Ngày tham gia</th>
                  </tr>
                </thead>
                <tbody>
                  {recentCustomers.map((c) => (
                    <tr key={c.email}>
                      <td>
                        <div className="slr-product-cell">
                          <img src={c.avatar} alt="" className="round" />
                          <span>
                            <strong>{c.name}</strong>
                            <em>{c.email}</em>
                          </span>
                        </div>
                      </td>
                      <td>{c.orders}</td>
                      <td className="muted">{c.joined}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
