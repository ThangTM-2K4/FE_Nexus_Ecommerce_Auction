import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import PageHeader from "../../../components/sellerdashboard/sellerPageHeader";
import { generalSettingsOptions } from "../../../data/sellerMockData";

export default function GeneralSettingsPage() {
  const [options, setOptions] = useState(generalSettingsOptions);

  const toggleOption = (id) => {
    setOptions((prev) =>
      prev.map((o) => (o.id === id ? { ...o, enabled: !o.enabled } : o))
    );
    toast.success("Đã lưu Cài Đặt Chung (mock)");
  };

  return (
    <div className="slr-page">
      <PageHeader
        title="Cài Đặt Chung"
        subtitle="Thiết lập chung áp dụng cho toàn bộ Shop của bạn"
      />

      <section className="slr-section">
        <div className="slr-panel-card">
          <h4>Tuỳ chọn hoạt động</h4>
          <div className="slr-table-wrap">
            <table className="slr-table">
              <thead>
                <tr>
                  <th>Tuỳ chọn</th>
                  <th>Trạng thái</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {options.map((o) => (
                  <tr key={o.id}>
                    <td>{o.label}</td>
                    <td>
                      <span className={`slr-badge slr-badge--${o.enabled ? "success" : "muted"}`}>
                        {o.enabled ? "Đang bật" : "Đang tắt"}
                      </span>
                    </td>
                    <td>
                      <button type="button" className="slr-btn-plain" onClick={() => toggleOption(o.id)}>
                        {o.enabled ? "Tắt" : "Bật"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="slr-wallet-note">
            Cần chỉnh phí và phương thức vận chuyển? Vào{" "}
            <Link to="/seller-hub/shipping-settings">Cài Đặt Vận Chuyển</Link>. Đổi tên, mô tả hoặc thông tin
            thuế của Shop tại <Link to="/seller-hub/shop-profile">Hồ Sơ Shop</Link>.
          </p>
        </div>
      </section>
    </div>
  );
}
