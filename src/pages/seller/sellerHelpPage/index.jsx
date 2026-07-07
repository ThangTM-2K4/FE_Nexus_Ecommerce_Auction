import { Link } from "react-router-dom";
import PageHeader from "../../../components/sellerdashboard/sellerPageHeader";
import { helpTopics } from "../../../data/sellerMockData";

export default function HelpPage() {
  return (
    <div className="slr-page">
      <PageHeader
        title="Trợ Giúp"
        subtitle="Câu hỏi thường gặp và kênh hỗ trợ dành cho Người bán"
      />

      <section className="slr-section">
        <div className="slr-panel-card">
          <h4>Câu hỏi thường gặp</h4>
          <div className="slr-feedback-card">
            {helpTopics.map((t) => (
              <article key={t.id}>
                <strong>{t.question}</strong>
                <p>
                  {t.hint} — <Link to={t.path}>Đi tới trang liên quan</Link>
                </p>
              </article>
            ))}
          </div>
        </div>

        <div className="slr-panel-card">
          <h4>Liên hệ hỗ trợ</h4>
          <p className="slr-wallet-note">
            Chưa tìm được câu trả lời? Liên hệ Nhân viên ngành hàng phụ trách tại{" "}
            <Link to="/seller-hub/shop-profile">Hồ Sơ Shop</Link> (tab "Thông tin Nhân viên ngành hàng"),
            hoặc gửi yêu cầu tới bộ phận Chăm sóc khách hàng.
          </p>
        </div>
      </section>
    </div>
  );
}
