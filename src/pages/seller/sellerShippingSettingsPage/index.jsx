import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FaEdit, FaSave, FaTimes, FaPlus, FaTrash, FaWarehouse } from "react-icons/fa";
import { useAuth } from "../../../context/AuthContext";
import PageHeader from "../../../components/sellerdashboard/sellerPageHeader";
import * as shippingService from "../../../services/shippingService";
import {
  getSellerWarehouses,
  createSellerWarehouse,
  updateSellerWarehouseStatus,
  deleteSellerWarehouse,
} from "../../../services/sellerWarehouseService";
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

  // Warehouses state
  const [warehouses, setWarehouses] = useState([]);
  const [showWhModal, setShowWhModal] = useState(false);
  const [whForm, setWhForm] = useState({ name: "", contactName: "", phoneNumber: "", addressLine: "" });
  const [creatingWh, setCreatingWh] = useState(false);

  const reloadWarehouses = async () => {
    try {
      const res = await getSellerWarehouses();
      setWarehouses(res?.items || []);
    } catch {
      setWarehouses([]);
    }
  };

  useEffect(() => {
    if (!user?.id) return;
    shippingService.getShippingSettings(user.id).then((data) => {
      setOptions(data);
      setLoading(false);
    });
    reloadWarehouses();
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
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <h4 style={{ margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
              <FaWarehouse /> Danh sách Kho hàng của Seller
            </h4>
            <button
              type="button"
              className="slr-btn-create"
              onClick={() => {
                setWhForm({ name: "", contactName: "", phoneNumber: "", addressLine: "" });
                setShowWhModal(true);
              }}
              style={{ padding: "6px 14px", fontSize: "13px", display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <FaPlus /> Thêm kho hàng
            </button>
          </div>

          {warehouses.length === 0 ? (
            <p style={{ color: "#777", fontStyle: "italic", fontSize: "14px", padding: "12px 0" }}>
              Bạn chưa đăng ký kho hàng nào với hệ thống. Hãy bấm nút "+ Thêm kho hàng" để tạo kho lấy/giao hàng.
            </p>
          ) : (
            <div className="slr-table-wrap">
              <table className="slr-table">
                <thead>
                  <tr>
                    <th>Tên kho</th>
                    <th>Người liên hệ</th>
                    <th>Số điện thoại</th>
                    <th>Địa chỉ kho</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {warehouses.map((wh) => (
                    <tr key={wh.id || wh.warehouseId}>
                      <td><strong>{wh.name || wh.warehouseName || "Kho chính"}</strong></td>
                      <td>{wh.contactName || wh.managerName || "—"}</td>
                      <td>{wh.phoneNumber || wh.phone || "—"}</td>
                      <td style={{ fontSize: "13px", color: "#555" }}>{wh.addressLine || wh.address || "—"}</td>
                      <td>
                        <span className={`slr-badge slr-badge--${wh.isActive !== false ? "success" : "muted"}`}>
                          {wh.isActive !== false ? "Đang hoạt động" : "Ngưng hoạt động"}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="slr-btn-plain"
                          style={{ color: "#dc2626", cursor: "pointer" }}
                          onClick={async () => {
                            try {
                              await deleteSellerWarehouse(wh.id || wh.warehouseId, wh.rowVersion);
                              toast.info("Đã xóa kho hàng");
                              reloadWarehouses();
                            } catch {
                              toast.error("Không thể xóa kho hàng");
                            }
                          }}
                          title="Xóa kho"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

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

      {showWhModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 9999
        }}>
          <div style={{ background: "#fff", padding: "24px", borderRadius: "12px", width: "420px", maxWidth: "90%" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "18px" }}>Tạo Kho Hàng Mới</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <label style={{ fontSize: "13px", fontWeight: 600 }}>
                Tên kho hàng <span style={{ color: "red" }}>*</span>
                <input
                  type="text"
                  value={whForm.name}
                  onChange={(e) => setWhForm({ ...whForm, name: e.target.value })}
                  placeholder="Ví dụ: Kho chính TP.HCM"
                  style={{ width: "100%", padding: "8px 10px", marginTop: "4px", borderRadius: "6px", border: "1px solid #ccc" }}
                />
              </label>
              <label style={{ fontSize: "13px", fontWeight: 600 }}>
                Người liên hệ
                <input
                  type="text"
                  value={whForm.contactName}
                  onChange={(e) => setWhForm({ ...whForm, contactName: e.target.value })}
                  placeholder="Họ tên thủ kho / quản lý"
                  style={{ width: "100%", padding: "8px 10px", marginTop: "4px", borderRadius: "6px", border: "1px solid #ccc" }}
                />
              </label>
              <label style={{ fontSize: "13px", fontWeight: 600 }}>
                Số điện thoại
                <input
                  type="text"
                  value={whForm.phoneNumber}
                  onChange={(e) => setWhForm({ ...whForm, phoneNumber: e.target.value })}
                  placeholder="0912345678"
                  style={{ width: "100%", padding: "8px 10px", marginTop: "4px", borderRadius: "6px", border: "1px solid #ccc" }}
                />
              </label>
              <label style={{ fontSize: "13px", fontWeight: 600 }}>
                Địa chỉ kho
                <input
                  type="text"
                  value={whForm.addressLine}
                  onChange={(e) => setWhForm({ ...whForm, addressLine: e.target.value })}
                  placeholder="Địa chỉ chi tiết kho hàng"
                  style={{ width: "100%", padding: "8px 10px", marginTop: "4px", borderRadius: "6px", border: "1px solid #ccc" }}
                />
              </label>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
              <button
                type="button"
                onClick={() => setShowWhModal(false)}
                style={{ padding: "8px 16px", borderRadius: "6px", border: "1px solid #ccc", background: "#f5f5f5", cursor: "pointer" }}
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={creatingWh || !whForm.name.trim()}
                onClick={async () => {
                  setCreatingWh(true);
                  try {
                    await createSellerWarehouse({
                      name: whForm.name.trim(),
                      contactName: whForm.contactName.trim(),
                      phoneNumber: whForm.phoneNumber.trim(),
                      addressLine: whForm.addressLine.trim(),
                      isPrimary: true,
                    });
                    toast.success("Đã tạo kho hàng thành công!");
                    setShowWhModal(false);
                    reloadWarehouses();
                  } catch {
                    toast.error("Tạo kho hàng thất bại");
                  } finally {
                    setCreatingWh(false);
                  }
                }}
                style={{
                  padding: "8px 16px", borderRadius: "6px", border: "none",
                  background: "#6b3ba7", color: "#fff", fontWeight: 600, cursor: "pointer"
                }}
              >
                {creatingWh ? "Đang tạo..." : "Lưu Kho Hàng"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
