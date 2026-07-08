import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import PageHeader from "../../../components/sellerdashboard/sellerPageHeader";
import { shopDecorationSections } from "../../../data/sellerMockData";

export default function ShopDecorationPage() {
  const [sections, setSections] = useState(shopDecorationSections);

  const toggleSection = (id) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s))
    );
    toast.success("Đã cập nhật Trang Trí Shop (mock)");
  };

  return (
    <div className="slr-page">
      <PageHeader
        title="Trang Trí Shop"
        subtitle="Tuỳ chỉnh banner, sản phẩm nổi bật và các khối hiển thị trên trang Shop"
      />

      <section className="slr-section">
        <div className="slr-panel-card">
          <h4>Các khối hiển thị</h4>
          <div className="slr-table-wrap">
            <table className="slr-table">
              <thead>
                <tr>
                  <th>Khối</th>
                  <th>Ghi chú</th>
                  <th>Trạng thái</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {sections.map((s) => (
                  <tr key={s.id}>
                    <td>{s.label}</td>
                    <td>{s.note}</td>
                    <td>
                      <span className={`slr-badge slr-badge--${s.active ? "success" : "muted"}`}>
                        {s.active ? "Đang hiển thị" : "Đang ẩn"}
                      </span>
                    </td>
                    <td>
                      <button type="button" className="slr-btn-plain" onClick={() => toggleSection(s.id)}>
                        {s.active ? "Ẩn khối" : "Hiển thị"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="slr-wallet-note">
            Ảnh banner và logo dùng cho các khối này được quản lý tại{" "}
            <Link to="/seller-hub/media-library">Kho Hình Ảnh/Video</Link>. Xem trước giao diện Shop tại{" "}
            <Link to="/seller-hub/shop-profile">Hồ Sơ Shop</Link>.
          </p>
        </div>
      </section>
    </div>
  );
}
