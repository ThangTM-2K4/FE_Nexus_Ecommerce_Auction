import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FaEdit, FaSave, FaTimes } from "react-icons/fa";
import { useAuth } from "../../../context/AuthContext";
import PageHeader from "../../../components/sellerdashboard/sellerPageHeader";
import * as shippingService from "../../../services/shippingService";
import "./index.scss";

const GROUPS = [
  { type: "standard", title: "Đơn vị vận chuyển tiêu chuẩn" },
  { type: "instant", title: "Giao hàng hoả tốc / trong ngày" },
  { type: "promo", title: "Khuyến mãi vận chuyển" },
];

export default function ShippingSettingsPage() {
  const { user } = useAuth();
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    if (!user?.id) return;
    shippingService.getShippingSettings(user.id).then((data) => {
      setOptions(data);
      setLoading(false);
    });
  }, [user?.id]);

  const startEdit = (option) => {
    setEditingId(option.id);
    setEditForm({
      basePrice: option.basePrice || 0,
      pricePerKm: option.pricePerKm || 0,
      enabled: option.enabled,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveOption = async (id) => {
    const next = options.map((o) =>
      o.id === id ? { ...o, ...editForm } : o
    );
    setOptions(next);
    await shippingService.saveShippingSettings(user.id, next);
    toast.success("Đã lưu Cài Đặt Vận Chuyển");
    setEditingId(null);
    setEditForm({});
  };

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
        subtitle="Cấu hình giá vận chuyển dựa trên khoảng cách thực tế và chọn đơn vị áp dụng cho Shop"
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
                        <th>Giá cơ sở</th>
                        <th>Giá/km</th>
                        <th>Trạng thái</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupOptions.map((o) => (
                        <tr key={o.id}>
                          <td>
                            <div>
                              <strong>{o.label}</strong>
                              <small style={{ display: "block", color: "#999", marginTop: "4px" }}>
                                {o.desc}
                              </small>
                            </div>
                          </td>
                          {editingId === o.id ? (
                            <>
                              <td>
                                <input
                                  type="number"
                                  value={editForm.basePrice}
                                  onChange={(e) =>
                                    setEditForm({ ...editForm, basePrice: Number(e.target.value) })
                                  }
                                  placeholder="Giá cơ sở"
                                  className="slr-shipping-input"
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  value={editForm.pricePerKm}
                                  onChange={(e) =>
                                    setEditForm({ ...editForm, pricePerKm: Number(e.target.value) })
                                  }
                                  placeholder="Giá/km"
                                  className="slr-shipping-input"
                                />
                              </td>
                            </>
                          ) : (
                            <>
                              <td>{o.basePrice}đ</td>
                              <td>{o.pricePerKm}đ</td>
                            </>
                          )}
                          <td>
                            <span className={`slr-badge slr-badge--${o.enabled ? "success" : "muted"}`}>
                              {o.enabled ? "Bật" : "Tắt"}
                            </span>
                          </td>
                          <td className="slr-shipping-actions">
                            {editingId === o.id ? (
                              <>
                                <button
                                  type="button"
                                  className="slr-btn-plain"
                                  onClick={() => saveOption(o.id)}
                                  title="Lưu"
                                >
                                  <FaSave />
                                </button>
                                <button
                                  type="button"
                                  className="slr-btn-plain"
                                  onClick={cancelEdit}
                                  title="Hủy"
                                >
                                  <FaTimes />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  className="slr-btn-plain"
                                  onClick={() => startEdit(o)}
                                  title="Chỉnh sửa"
                                >
                                  <FaEdit />
                                </button>
                                <button
                                  type="button"
                                  className={`slr-shipping-toggle ${o.enabled ? "is-on" : "is-off"}`}
                                  onClick={() => toggleOption(o.id)}
                                  title={o.enabled ? "Tắt đơn vị này" : "Bật đơn vị này"}
                                >
                                  {o.enabled ? "Tắt" : "Bật"}
                                </button>
                              </>
                            )}
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
          <h5>Hướng dẫn</h5>
          <ul className="slr-shipping-guide">
            <li>
              <strong>Giá cơ sở:</strong> Giá áp dụng cho đơn hàng không phụ thuộc khoảng cách (ví dụ: 10.000đ)
            </li>
            <li>
              <strong>Giá/km:</strong> Phí tính theo mỗi km khoảng cách giao hàng (ví dụ: 2.000đ/km)
            </li>
            <li>
              <strong>Tính toán:</strong> Phí vận chuyển = Giá cơ sở + (Khoảng cách × Giá/km)
            </li>
          </ul>
          <p className="slr-wallet-note">
            Các đơn vị đang bật ở đây sẽ hiển thị để chọn khi{" "}
            <Link to="/seller-hub/products/create">tạo sản phẩm</Link>. Phí vận chuyển được tính toán dựa
            trên khoảng cách thực tế và áp dụng cho đơn hàng tại <Link to="/seller-hub/orders">Đơn hàng</Link>.
          </p>
        </div>
      </section>
    </div>
  );
}
