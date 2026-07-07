import { Link } from "react-router-dom";
import PageHeader from "../../../components/sellerdashboard/sellerPageHeader";
import { myReports } from "../../../data/sellerMockData";

export default function MyReportsPage() {
  return (
    <div className="slr-page">
      <PageHeader
        title="Báo Cáo Của Tôi"
        subtitle="Tổng hợp báo cáo hoạt động bán hàng của Shop"
      />

      <section className="slr-section">
        <div className="slr-top-grid">
          {myReports.map((r) => (
            <div key={r.id} className="slr-top-card">
              <h4>{r.name}</h4>
              <p>{r.desc}</p>
              <Link to={r.path} className="slr-btn-outline">
                {r.linkLabel}
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
