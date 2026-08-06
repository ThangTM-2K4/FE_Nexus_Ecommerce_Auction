import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FaWarehouse, FaPlus, FaTrash, FaCheckCircle, FaTimesCircle, FaMapMarkerAlt, FaUser, FaPhone } from "react-icons/fa";
import PageHeader from "../../../components/sellerdashboard/sellerPageHeader";
import {
  getSellerWarehouses,
  createSellerWarehouse,
  updateSellerWarehouseStatus,
  deleteSellerWarehouse,
} from "../../../services/sellerWarehouseService";
import "./index.scss";

export default function SellerWarehousesPage() {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    contactName: "",
    phoneNumber: "",
    addressLine: "",
    isPrimary: true,
  });

  const loadWarehouses = async () => {
    setLoading(true);
    try {
      const res = await getSellerWarehouses();
      setWarehouses(res?.items || []);
    } catch {
      setWarehouses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWarehouses();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Vui lòng nhập tên kho hàng!");
      return;
    }
    setSubmitting(true);
    try {
      await createSellerWarehouse({
        name: form.name.trim(),
        contactName: form.contactName.trim(),
        phoneNumber: form.phoneNumber.trim(),
        addressLine: form.addressLine.trim(),
        isPrimary: form.isPrimary,
      });
      toast.success("Tạo kho hàng mới thành công!");
      setShowModal(false);
      setForm({ name: "", contactName: "", phoneNumber: "", addressLine: "", isPrimary: true });
      loadWarehouses();
    } catch {
      toast.error("Tạo kho hàng thất bại!");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (wh) => {
    const nextStatus = wh.isActive !== false ? "INACTIVE" : "ACTIVE";
    try {
      await updateSellerWarehouseStatus(wh.id || wh.warehouseId, nextStatus, wh.rowVersion);
      toast.success(`Kho "${wh.name || "Kho hàng"}" đã được ${nextStatus === "ACTIVE" ? "kích hoạt" : "tạm ngưng"}`);
      loadWarehouses();
    } catch {
      toast.error("Không thể đổi trạng thái kho!");
    }
  };

  const handleDelete = async (wh) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa kho "${wh.name || "này"}"?`)) return;
    try {
      await deleteSellerWarehouse(wh.id || wh.warehouseId, wh.rowVersion);
      toast.info("Đã xóa kho hàng!");
      loadWarehouses();
    } catch {
      toast.error("Xóa kho hàng thất bại!");
    }
  };

  return (
    <div className="slr-page">
      <PageHeader
        title="Quản Lý Kho Hàng"
        subtitle="Quản lý thông tin địa điểm lưu trữ, lấy hàng và giao hàng của Shop"
        actions={
          <button
            type="button"
            className="slr-btn-create"
            onClick={() => setShowModal(true)}
            style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
          >
            <FaPlus /> + Thêm kho mới
          </button>
        }
      />

      <section className="slr-section">
        <div className="slr-panel-card">
          <h4 style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <FaWarehouse /> Danh Sách Kho Hàng ({warehouses.length})
          </h4>

          {loading ? (
            <p style={{ padding: "20px", color: "#666" }}>Đang nạp danh sách kho hàng...</p>
          ) : warehouses.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#666" }}>
              <FaWarehouse size={48} style={{ color: "#ccc", marginBottom: "12px" }} />
              <p style={{ marginBottom: "16px", fontSize: "15px" }}>Shop của bạn chưa đăng ký kho hàng nào.</p>
              <button
                type="button"
                className="slr-btn-create"
                onClick={() => setShowModal(true)}
                style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
              >
                <FaPlus /> Tạo kho hàng đầu tiên
              </button>
            </div>
          ) : (
            <div className="slr-table-wrap">
              <table className="slr-table">
                <thead>
                  <tr>
                    <th>Tên Kho</th>
                    <th>Người Quản Lý</th>
                    <th>Số Điện Thoại</th>
                    <th>Địa Chỉ Kho</th>
                    <th>Trạng Thái</th>
                    <th>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {warehouses.map((wh) => {
                    const id = wh.id || wh.warehouseId;
                    const isActive = wh.isActive !== false;
                    return (
                      <tr key={id}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <strong style={{ fontSize: "14px", color: "#1f2937" }}>
                              {wh.name || wh.warehouseName || "Kho chính"}
                            </strong>
                            {wh.isPrimary && (
                              <span style={{ fontSize: "10px", background: "#f3e8ff", color: "#6b3ba7", padding: "2px 6px", borderRadius: "4px", fontWeight: 700 }}>
                                KHO CHÍNH
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "#4b5563" }}>
                            <FaUser size={12} color="#9ca3af" /> {wh.contactName || wh.managerName || "—"}
                          </span>
                        </td>
                        <td>
                          <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "#4b5563" }}>
                            <FaPhone size={12} color="#9ca3af" /> {wh.phoneNumber || wh.phone || "—"}
                          </span>
                        </td>
                        <td>
                          <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "#4b5563", fontSize: "13px" }}>
                            <FaMapMarkerAlt size={12} color="#9ca3af" /> {wh.addressLine || wh.address || "—"}
                          </span>
                        </td>
                        <td>
                          <span className={`slr-badge slr-badge--${isActive ? "approved" : "draft"}`}>
                            {isActive ? "Hoạt động" : "Tạm ngưng"}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(wh)}
                              style={{
                                border: "none", background: "transparent", cursor: "pointer",
                                color: isActive ? "#16a34a" : "#9ca3af", fontSize: "14px"
                              }}
                              title={isActive ? "Tắt kho" : "Bật kho"}
                            >
                              {isActive ? <FaCheckCircle /> : <FaTimesCircle />}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(wh)}
                              style={{ border: "none", background: "transparent", cursor: "pointer", color: "#dc2626", fontSize: "14px" }}
                              title="Xóa kho"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {showModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 9999
        }}>
          <form onSubmit={handleCreate} style={{ background: "#fff", padding: "24px", borderRadius: "12px", width: "450px", maxWidth: "90%" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", color: "#111827" }}>Thêm Kho Hàng Mới</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>
                Tên kho hàng <span style={{ color: "#dc2626" }}>*</span>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ví dụ: Kho Tổng TP.HCM"
                  style={{ width: "100%", padding: "10px 12px", marginTop: "4px", borderRadius: "6px", border: "1px solid #d1d5db" }}
                />
              </label>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>
                Họ tên người quản lý / thủ kho
                <input
                  type="text"
                  value={form.contactName}
                  onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  style={{ width: "100%", padding: "10px 12px", marginTop: "4px", borderRadius: "6px", border: "1px solid #d1d5db" }}
                />
              </label>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>
                Số điện thoại liên hệ kho
                <input
                  type="text"
                  value={form.phoneNumber}
                  onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                  placeholder="Ví dụ: 0912345678"
                  style={{ width: "100%", padding: "10px 12px", marginTop: "4px", borderRadius: "6px", border: "1px solid #d1d5db" }}
                />
              </label>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>
                Địa chỉ chi tiết kho hàng
                <input
                  type="text"
                  value={form.addressLine}
                  onChange={(e) => setForm({ ...form, addressLine: e.target.value })}
                  placeholder="Ví dụ: 123 Đường ABC, Phường 1, Quận 1, TP.HCM"
                  style={{ width: "100%", padding: "10px 12px", marginTop: "4px", borderRadius: "6px", border: "1px solid #d1d5db" }}
                />
              </label>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{ padding: "9px 18px", borderRadius: "6px", border: "1px solid #d1d5db", background: "#f9fafb", cursor: "pointer" }}
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={submitting || !form.name.trim()}
                style={{
                  padding: "9px 18px", borderRadius: "6px", border: "none",
                  background: "#6b3ba7", color: "#fff", fontWeight: 600, cursor: "pointer"
                }}
              >
                {submitting ? "Đang lưu..." : "Lưu Kho Hàng"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
