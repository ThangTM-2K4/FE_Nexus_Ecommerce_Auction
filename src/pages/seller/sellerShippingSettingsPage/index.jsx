import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../../context/AuthContext";
import PageHeader from "../../../components/sellerdashboard/sellerPageHeader";
import * as shippingService from "../../../services/shippingService";

const GROUPS = [
  { type: "standard", title: "Đơn vị vận chuyển tiêu chuẩn" },
  { type: "instant", title: "Giao hàng hoả tốc / trong ngày" },
  { type: "promo", title: "Khuyến mãi vận chuyển" },
];

export default function ShippingSettingsPage() {
  const { user } = useAuth();
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    shippingService.getShippingSettings(user.id).then((data) => {
      setOptions(data);
      setLoading(false);
    });
  }, [user?.id]);

  const toggleOption = async (id) => {
    const next = options.map((o) => (o.id === id ? { ...o, enabled: !o.enabled } : o));
    setOptions(next);
    await shippingService.saveShippingSettings(user.id, next);
    toast.success("Đã lưu Cài Đặt Vận Chuyển");
  };

  return (
    <div className="slr-page">
      <PageHeader
        title="Cài Đặt Vận Chuyển"
        subtitle="Chọn đơn vị vận chuyển và phí áp dụng cho đơn hàng của Shop"
      />

      <section className="slr-section">
        {loading ? (
          <div className="slr-panel-card">
            <p>Đang tải...</p>
          </div>
        ) : (
          GROUPS.map((group) => {
            const groupOptions = options.filter((o) => o.type === group.type);
            if (groupOptions.length === 0) return null;
            return (
              <div key={group.type} className="slr-panel-card">
                <h4>{group.title}</h4>
                <div className="slr-table-wrap">
                  <table className="slr-table">
                    <thead>
                      <tr>
                        <th>Đơn vị</th>
                        <th>Thời gian</th>
                        <th>Phí</th>
                        <th>Trạng thái</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupOptions.map((o) => (
                        <tr key={o.id}>
                          <td>{o.label}</td>
                          <td>{o.desc}</td>
                          <td>{o.fee}</td>
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
              </div>
            );
          })
        )}

        <div className="slr-panel-card">
          <p className="slr-wallet-note">
            Các đơn vị đang bật ở đây sẽ hiển thị để chọn trong tab "Vận chuyển" khi{" "}
            <Link to="/seller-hub/products/create">tạo sản phẩm</Link>. Phí vận chuyển ảnh hưởng trực tiếp
            đến đơn hàng đang chờ xử lý tại <Link to="/seller-hub/orders">Đơn hàng</Link>.
          </p>
        </div>
      </section>
    </div>
  );
}
