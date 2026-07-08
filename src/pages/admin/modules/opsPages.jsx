import { useState } from "react";
import { toast } from "react-toastify";
import AdminPageHeader from "../../../components/admin/adminPageHeader";
import AdminTabs from "../../../components/admin/adminTabs";
import AdminTabOverview from "../../../components/admin/adminTabOverview";
import AdminToolbar from "../../../components/admin/adminToolbar";
import AdminModal from "../../../components/admin/adminModal";
import { AdminAnimatedView, AdminStaggerGrid } from "../../../components/admin/adminPageTransition";
import {
  FeeCard, CouponTicket, ReviewCard, FraudAlert,
  KanbanColumn, KanbanCard, ShippingPartnerCard, ShippingZoneItem,
} from "../../../components/admin/adminViews";
import { useAdminList } from "../../../hooks/useAdminList";
import {
  mockCommissions, mockCoupons, mockShippingPartners, mockShippingZones,
  mockReviews, mockReports, mockFraudAlerts, mockSupportTickets,
} from "../../../data/adminEntities";
import "../../../components/admin/adminViews/index.scss";
import "../../../components/admin/adminDataTable/index.scss";
import "../../../components/admin/adminTabOverview/index.scss";

export const AdminCommissions = () => {
  const [fees, setFees] = useState(mockCommissions);
  const [edit, setEdit] = useState(null);
  const save = () => { setFees((prev) => prev.map((f) => (f.id === edit.id ? edit : f))); toast.success("Đã cập nhật phí"); setEdit(null); };

  return (
    <div className="adm-page">
      <AdminPageHeader kicker="Phí" title="Quản lý hoa hồng & phí" subtitle="Cấu hình phí seller, đấu giá và rút tiền." />
      <AdminStaggerGrid className="adm-fee-grid">
        {fees.map((fee) => (
          <FeeCard key={fee.id} fee={fee} onEdit={() => setEdit({ ...fee })} />
        ))}
      </AdminStaggerGrid>
      <AdminModal open={!!edit} title="Chỉnh sửa phí" onClose={() => setEdit(null)}>
        {edit && (
          <div className="adm-form">
            <label>Giá trị<input value={edit.value} onChange={(e) => setEdit({ ...edit, value: e.target.value })} /></label>
            <label>Loại
              <select value={edit.type} onChange={(e) => setEdit({ ...edit, type: e.target.value })}>
                <option value="Phần trăm">Phần trăm</option>
                <option value="Cố định">Cố định</option>
              </select>
            </label>
            <div className="adm-form__actions">
              <button type="button" className="cancel" onClick={() => setEdit(null)}>Hủy</button>
              <button type="button" className="save" onClick={save}>Lưu</button>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
};

export const AdminCoupons = () => {
  const list = useAdminList(mockCoupons, ["code"]);
  const [form, setForm] = useState(null);

  return (
    <div className="adm-page">
      <AdminPageHeader kicker="Khuyến mãi" title="Quản lý coupon" subtitle="Vé coupon trực quan với thanh tiến độ sử dụng." />
      <AdminToolbar search={list.search} onSearchChange={list.setSearch} actions={[{ label: "+ Tạo coupon", onClick: () => setForm({ code: "", type: "Phần trăm", value: "", status: "Hoạt động" }) }]} />
      <AdminStaggerGrid className="adm-coupon-grid">
        {list.filtered.map((c) => (
          <CouponTicket
            key={c.id}
            coupon={c}
            onEdit={() => setForm({ ...c })}
            onDelete={() => { list.removeItem(c.id); toast.info("Đã xóa"); }}
          />
        ))}
      </AdminStaggerGrid>
      <AdminModal open={!!form} title={form?.id ? "Sửa coupon" : "Tạo coupon"} onClose={() => setForm(null)}>
        {form && (
          <div className="adm-form">
            <label>Mã<input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} /></label>
            <label>Giá trị<input value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} /></label>
            <div className="adm-form__actions">
              <button type="button" className="cancel" onClick={() => setForm(null)}>Hủy</button>
              <button type="button" className="save" onClick={() => {
                if (form.id) list.updateItem(form.id, form);
                else list.addItem({ ...form, id: `CP-${Date.now()}`, used: 0, usageLimit: 100, minOrder: "0đ", startDate: "01/07/2026", endDate: "31/12/2026" });
                toast.success("Đã lưu"); setForm(null);
              }}>Lưu</button>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
};

export const AdminShipping = () => {
  const [tab, setTab] = useState("partners");
  const partners = useAdminList(mockShippingPartners, ["name"]);
  const zones = useAdminList(mockShippingZones, ["name"]);

  const partnerOverview = {
    title: "Tổng quan đối tác vận chuyển",
    description: "Danh sách đơn vị giao hàng tích hợp và trạng thái kết nối API.",
    stats: [
      { label: "Tổng đối tác", value: partners.filtered.length, highlight: true },
      { label: "Đang hoạt động", value: partners.filtered.filter((p) => p.status === "Hoạt động").length },
      { label: "Đã tắt", value: partners.filtered.filter((p) => p.status !== "Hoạt động").length, warn: true },
      { label: "Phí TB", value: "22.5k", hint: "ước tính / đơn nội thành" },
    ],
  };

  const zoneOverview = {
    title: "Tổng quan khu vực giao hàng",
    description: "Cấu hình phí và thời gian giao theo từng vùng địa lý.",
    stats: [
      { label: "Tổng khu vực", value: zones.filtered.length, highlight: true },
      { label: "Nội thành", value: zones.filtered.filter((z) => z.name.includes("Nội thành")).length },
      { label: "Liên tỉnh", value: zones.filtered.filter((z) => !z.name.includes("Nội thành")).length },
      { label: "Giao nhanh nhất", value: "1-2 ngày", hint: "nội thành lớn" },
    ],
  };

  const tabOverview = tab === "partners" ? partnerOverview : zoneOverview;

  return (
    <div className="adm-page">
      <AdminPageHeader kicker="Vận chuyển" title="Quản lý vận chuyển" subtitle="Đối tác vận chuyển và khu vực giao hàng." />
      <AdminTabs active={tab} onChange={setTab} tabs={[{ id: "partners", label: "Đối tác" }, { id: "zones", label: "Khu vực" }]} />
      <AdminTabOverview {...tabOverview} />
      <AdminAnimatedView viewKey={tab}>
        {tab === "partners" ? (
          <AdminStaggerGrid className="adm-shipping-grid">
            {partners.filtered.map((p) => (
              <ShippingPartnerCard
                key={p.id}
                partner={p}
                onToggle={() => { partners.updateItem(p.id, { status: p.status === "Hoạt động" ? "Tắt" : "Hoạt động" }); toast.success("Đã cập nhật"); }}
              />
            ))}
          </AdminStaggerGrid>
        ) : (
          <AdminStaggerGrid className="adm-zone-list">
            {zones.filtered.map((z) => <ShippingZoneItem key={z.id} zone={z} />)}
          </AdminStaggerGrid>
        )}
      </AdminAnimatedView>
    </div>
  );
};

export const AdminReviews = () => {
  const list = useAdminList(mockReviews, ["product", "buyer"]);
  return (
    <div className="adm-page">
      <AdminPageHeader kicker="Đánh giá" title="Quản lý đánh giá" subtitle="Thẻ đánh giá với sao và bình luận." />
      <AdminToolbar search={list.search} onSearchChange={list.setSearch} searchPlaceholder="Tìm sản phẩm, người mua..." />
      <AdminStaggerGrid className="adm-review-grid">
        {list.filtered.map((r) => (
          <ReviewCard
            key={r.id}
            review={r}
            onHide={() => { list.updateItem(r.id, { status: r.status === "Ẩn" ? "Hiển thị" : "Ẩn" }); toast.success("Đã cập nhật"); }}
            onDelete={() => { list.removeItem(r.id); toast.info("Đã xóa"); }}
          />
        ))}
      </AdminStaggerGrid>
    </div>
  );
};

export const AdminReports = () => {
  const list = useAdminList(mockReports, ["target", "reporter"]);
  const columns = {
    "Đang mở": list.filtered.filter((r) => r.status === "Đang mở"),
    "Đang xử lý": list.filtered.filter((r) => r.status === "Đang xử lý"),
    "Đã xử lý": list.filtered.filter((r) => r.status === "Đã xử lý"),
  };

  const handle = (row, status) => { list.updateItem(row.id, { status }); toast.success("Đã cập nhật báo cáo"); };

  return (
    <div className="adm-page">
      <AdminPageHeader kicker="An toàn" title="Báo cáo & Khiếu nại" subtitle="Kanban board theo trạng thái xử lý." />
      <AdminToolbar search={list.search} onSearchChange={list.setSearch} searchPlaceholder="Tìm đối tượng..." />
      <div className="adm-kanban">
        {Object.entries(columns).map(([title, items]) => (
          <KanbanColumn key={title} title={title} count={items.length} color={title === "Đang mở" ? "open" : title === "Đang xử lý" ? "pending" : "closed"}>
            {items.map((r) => (
              <KanbanCard
                key={r.id}
                title={r.target}
                subtitle={r.reason}
                meta={`${r.type} · ${r.reporter}`}
                badge={r.severity}
                actions={[
                  { label: "Xử lý", variant: "primary", onClick: () => handle(r, "Đang xử lý") },
                  { label: "Xong", variant: "success", onClick: () => handle(r, "Đã xử lý") },
                  { label: "Cấm", variant: "danger", onClick: () => toast.error("Đã cấm") },
                ]}
              />
            ))}
          </KanbanColumn>
        ))}
      </div>
    </div>
  );
};

export const AdminFraud = () => {
  const list = useAdminList(mockFraudAlerts, ["user", "auction", "type"]);
  return (
    <div className="adm-page">
      <AdminPageHeader kicker="An toàn" title="Phát hiện gian lận" subtitle="Cảnh báo bảo mật theo mức độ nghiêm trọng." />
      <AdminToolbar search={list.search} onSearchChange={list.setSearch} searchPlaceholder="Tìm user, phiên..." />
      <div className="adm-fraud-list">
        {list.filtered.map((alert) => (
          <FraudAlert
            key={alert.id}
            alert={alert}
            actions={[
              { label: "Điều tra", variant: "primary", onClick: () => toast.info("Đang điều tra") },
              { label: "Cấm user", variant: "danger", onClick: () => toast.error(`Đã cấm ${alert.user}`) },
              { label: "Xóa bid", variant: "danger", onClick: () => toast.warning("Đã xóa bid") },
            ]}
          />
        ))}
      </div>
    </div>
  );
};

export const AdminSupportTickets = () => {
  const list = useAdminList(mockSupportTickets, ["subject", "user", "id"]);
  const columns = {
    "Đang mở": list.filtered.filter((t) => t.status === "Đang mở"),
    "Chờ xử lý": list.filtered.filter((t) => t.status === "Chờ xử lý"),
    "Đã đóng": list.filtered.filter((t) => t.status === "Đã đóng"),
  };

  return (
    <div className="adm-page">
      <AdminPageHeader kicker="Hỗ trợ" title="Quản lý ticket" subtitle="Kanban ticket hỗ trợ khách hàng." />
      <AdminToolbar search={list.search} onSearchChange={list.setSearch} searchPlaceholder="Tìm ticket..." />
      <div className="adm-kanban">
        {Object.entries(columns).map(([title, items]) => (
          <KanbanColumn key={title} title={title} count={items.length} color={title === "Đang mở" ? "open" : title === "Chờ xử lý" ? "pending" : "closed"}>
            {items.map((t) => (
              <KanbanCard
                key={t.id}
                title={t.subject}
                subtitle={t.user}
                meta={`${t.assignee} · ${t.messages} tin nhắn`}
                badge={t.priority}
                actions={[
                  { label: "Gán NV", onClick: () => { list.updateItem(t.id, { assignee: "Support Lan" }); toast.success("Đã gán"); }},
                  { label: "Trả lời", variant: "primary", onClick: () => toast.info("Mở hộp thoại") },
                  { label: "Đóng", onClick: () => { list.updateItem(t.id, { status: "Đã đóng" }); toast.success("Đã đóng"); }},
                ]}
              />
            ))}
          </KanbanColumn>
        ))}
      </div>
    </div>
  );
};
