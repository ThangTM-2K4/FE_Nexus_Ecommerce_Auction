import { useState } from "react";
import { toast } from "react-toastify";
import AdminPageHeader from "../../../components/admin/adminPageHeader";
import AdminTabs from "../../../components/admin/adminTabs";
import AdminTabOverview from "../../../components/admin/adminTabOverview";
import AdminToolbar from "../../../components/admin/adminToolbar";
import AdminModal from "../../../components/admin/adminModal";
import AdminKpiCard from "../../../components/admin/adminKpiCard";
import { AdminAnimatedView, AdminStaggerGrid } from "../../../components/admin/adminPageTransition";
import { NotificationItem, BannerPreview, ContentDoc, AuditTimelineItem } from "../../../components/admin/adminViews";
import { useAdminList } from "../../../hooks/useAdminList";
import {
  mockNotifications, mockBanners, mockContents, mockAnalytics,
  mockSystemSettings, mockRolePermissions, mockAuditLogs,
} from "../../../data/adminEntities";
import "../../../components/admin/adminViews/index.scss";
import "../../../components/admin/adminDataTable/index.scss";
import "../../../components/admin/adminTabOverview/index.scss";

export const AdminNotifications = () => {
  const list = useAdminList(mockNotifications, ["title"]);
  const [form, setForm] = useState(null);

  return (
    <div className="adm-page">
      <AdminPageHeader kicker="Thông báo" title="Quản lý thông báo" subtitle="Danh sách thông báo dạng feed." />
      <AdminToolbar actions={[{ label: "+ Gửi thông báo", onClick: () => setForm({ title: "", type: "Hệ thống", audience: "Tất cả người dùng" }) }]} />
      <div className="adm-notif-list">
        {list.filtered.map((item) => <NotificationItem key={item.id} item={item} />)}
      </div>
      <AdminModal open={!!form} title="Gửi thông báo mới" onClose={() => setForm(null)}>
        {form && (
          <div className="adm-form">
            <label>Tiêu đề<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
            <label>Loại
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {["Hệ thống", "Khuyến mãi", "Nhắc đấu giá", "Nhắc đơn hàng"].map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
            <label>Nội dung<textarea placeholder="Nhập nội dung..." /></label>
            <div className="adm-form__actions">
              <button type="button" className="cancel" onClick={() => setForm(null)}>Hủy</button>
              <button type="button" className="save" onClick={() => {
                list.addItem({ ...form, id: `TB-${Date.now()}`, sentAt: new Date().toLocaleString("vi-VN"), status: "Đã gửi" });
                toast.success("Đã gửi"); setForm(null);
              }}>Gửi</button>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
};

export const AdminBanners = () => {
  const list = useAdminList(mockBanners, ["title"]);
  const [form, setForm] = useState(null);

  return (
    <div className="adm-page">
      <AdminPageHeader kicker="Marketing" title="Quản lý banner" subtitle="Gallery preview banner theo loại." />
      <AdminToolbar actions={[{ label: "+ Thêm banner", onClick: () => setForm({ title: "", type: "Trang chủ", position: "Slider chính", status: "Hoạt động" }) }]} />
      <AdminStaggerGrid className="adm-banner-grid">
        {list.filtered.map((b) => (
          <BannerPreview
            key={b.id}
            banner={b}
            onEdit={() => setForm({ ...b })}
            onDelete={() => { list.removeItem(b.id); toast.info("Đã xóa"); }}
          />
        ))}
      </AdminStaggerGrid>
      <AdminModal open={!!form} title={form?.id ? "Sửa banner" : "Thêm banner"} onClose={() => setForm(null)}>
        {form && (
          <div className="adm-form">
            <label>Tiêu đề<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
            <label>Loại
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {["Trang chủ", "Khuyến mãi", "Sự kiện"].map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
            <div className="adm-form__actions">
              <button type="button" className="cancel" onClick={() => setForm(null)}>Hủy</button>
              <button type="button" className="save" onClick={() => {
                if (form.id) list.updateItem(form.id, form);
                else list.addItem({ ...form, id: `BN-${Date.now()}`, startDate: "01/07/2026", endDate: "31/12/2026" });
                toast.success("Đã lưu"); setForm(null);
              }}>Lưu</button>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
};

export const AdminContent = () => {
  const list = useAdminList(mockContents, ["title"]);
  const [tab, setTab] = useState("all");
  const types = ["Blog", "FAQ", "Điều khoản", "Bảo mật", "Giới thiệu"];
  const filtered = tab === "all" ? list.filtered : list.filtered.filter((c) => c.type === tab);

  const contentOverviewByTab = {
    all: {
      title: "Tổng quan nội dung",
      description: "Toàn bộ bài viết, FAQ và tài liệu pháp lý trên hệ thống.",
      stats: [
        { label: "Tổng bài viết", value: list.filtered.length, highlight: true },
        { label: "Đã xuất bản", value: list.filtered.filter((c) => c.status === "Xuất bản").length },
        { label: "Bản nháp", value: list.filtered.filter((c) => c.status === "Nháp").length, warn: true },
        { label: "Loại nội dung", value: types.length, hint: "Blog · FAQ · Điều khoản..." },
      ],
    },
    Blog: {
      title: "Blog & bài viết",
      description: "Bài viết hướng dẫn, tin tức và nội dung marketing.",
      stats: [
        { label: "Tổng bài", value: filtered.length, highlight: true },
        { label: "Xuất bản", value: filtered.filter((c) => c.status === "Xuất bản").length },
        { label: "Nháp", value: filtered.filter((c) => c.status === "Nháp").length },
        { label: "Cập nhật gần nhất", value: filtered[0]?.updatedAt || "—", hint: filtered[0]?.title?.slice(0, 28) },
      ],
    },
    FAQ: {
      title: "Câu hỏi thường gặp",
      description: "FAQ hỗ trợ người dùng và seller tra cứu nhanh.",
      stats: [
        { label: "Tổng FAQ", value: filtered.length, highlight: true },
        { label: "Xuất bản", value: filtered.filter((c) => c.status === "Xuất bản").length },
        { label: "Nháp", value: filtered.filter((c) => c.status === "Nháp").length },
        { label: "Mục mới nhất", value: filtered[filtered.length - 1]?.title?.slice(0, 24) || "—" },
      ],
    },
  };

  const defaultTypeOverview = (type) => ({
    title: `Nội dung: ${type}`,
    description: `Quản lý tài liệu thuộc nhóm ${type}.`,
    stats: [
      { label: "Tổng bài", value: filtered.length, highlight: true },
      { label: "Xuất bản", value: filtered.filter((c) => c.status === "Xuất bản").length },
      { label: "Nháp", value: filtered.filter((c) => c.status === "Nháp").length },
      { label: "Cập nhật", value: filtered[0]?.updatedAt || "—" },
    ],
  });

  const tabOverview = contentOverviewByTab[tab] || defaultTypeOverview(tab);

  return (
    <div className="adm-page">
      <AdminPageHeader kicker="Nội dung" title="Quản lý nội dung" subtitle="Danh sách tài liệu theo loại." />
      <AdminTabs active={tab} onChange={setTab} tabs={[{ id: "all", label: "Tất cả" }, ...types.map((t) => ({ id: t, label: t }))]} />
      <AdminTabOverview {...tabOverview} />
      <AdminToolbar actions={[{ label: "+ Thêm bài viết", onClick: () => toast.info("Mở trình soạn thảo") }]} />
      <AdminAnimatedView viewKey={tab}>
        <div className="adm-content-list">
          {filtered.map((doc) => (
            <ContentDoc
              key={doc.id}
              doc={doc}
              onEdit={() => toast.info(`Sửa: ${doc.title}`)}
              onDelete={() => { list.removeItem(doc.id); toast.info("Đã xóa"); }}
            />
          ))}
        </div>
      </AdminAnimatedView>
    </div>
  );
};

const TopList = ({ title, items }) => (
  <div className="adm-card">
    <header><h3>{title}</h3></header>
    <ul className="adm-top-list">
      {items.map((item, i) => (
        <li key={item.name}><strong>#{i + 1} {item.name}</strong><span>{item.value}</span></li>
      ))}
    </ul>
  </div>
);

export const AdminAnalytics = () => {
  const a = mockAnalytics;
  return (
    <div className="adm-page">
      <AdminPageHeader kicker="Phân tích" title="Thống kê & Phân tích" subtitle="Top seller, buyer, đấu giá và từ khóa." />
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12, marginBottom: 20 }}>
        <AdminKpiCard label="Tỷ lệ chuyển đổi" value={a.conversion} highlight />
        <AdminKpiCard label="Tỷ lệ hủy đơn" value={a.cancellationRate} warn />
      </section>
      <AdminStaggerGrid className="adm-card-grid">
        <TopList title="Top Seller" items={a.topSellers} />
        <TopList title="Top Buyer" items={a.topBuyers} />
        <TopList title="Top Đấu giá" items={a.topAuctions} />
        <TopList title="Top Danh mục" items={a.topCategories} />
        <TopList title="Top Sản phẩm" items={a.topProducts} />
        <TopList title="Top Tìm kiếm" items={a.topSearches} />
      </AdminStaggerGrid>
    </div>
  );
};

export const AdminSettings = () => {
  const [settings, setSettings] = useState(mockSystemSettings);
  const labels = { website: "Website", auction: "Đấu giá", order: "Đơn hàng", payment: "Thanh toán" };

  return (
    <div className="adm-page">
      <AdminPageHeader kicker="Hệ thống" title="Cài đặt hệ thống" subtitle="Cấu hình website, đấu giá, đơn hàng và thanh toán." />
      <AdminStaggerGrid className="adm-card-grid">
        {Object.entries(settings).map(([section, fields]) => (
          <div key={section} className="adm-card">
            <header><h3>{labels[section] || section}</h3></header>
            <div className="adm-form">
              {Object.entries(fields).map(([key, val]) => (
                <label key={key}>
                  {key}
                  {typeof val === "boolean" ? (
                    <select value={val ? "true" : "false"} onChange={(e) => setSettings({ ...settings, [section]: { ...fields, [key]: e.target.value === "true" } })}>
                      <option value="true">Bật</option>
                      <option value="false">Tắt</option>
                    </select>
                  ) : (
                    <input value={val} onChange={(e) => setSettings({ ...settings, [section]: { ...fields, [key]: e.target.value } })} />
                  )}
                </label>
              ))}
            </div>
          </div>
        ))}
      </AdminStaggerGrid>
      <div className="adm-form__actions" style={{ marginTop: 16 }}>
        <button type="button" className="save" onClick={() => toast.success("Đã lưu cài đặt")}>Lưu tất cả cài đặt</button>
      </div>
    </div>
  );
};

export const AdminRoles = () => (
  <div className="adm-page">
    <AdminPageHeader kicker="Bảo mật" title="Vai trò & Quyền hạn" subtitle="Ma trận phân quyền RBAC." />
    <div className="adm-perm-matrix">
      <table>
        <thead>
          <tr>
            <th>Module</th>
            <th>Super Admin</th>
            <th>Admin</th>
            <th>Moderator</th>
            <th>Finance</th>
            <th>Support</th>
          </tr>
        </thead>
        <tbody>
          {mockRolePermissions.map((row) => (
            <tr key={row.module}>
              <td>{row.module}</td>
              <td className={row.superAdmin ? "yes" : "no"}>{row.superAdmin ? "✔" : "✖"}</td>
              <td className={row.admin ? "yes" : "no"}>{row.admin ? "✔" : "✖"}</td>
              <td className={row.moderator ? "yes" : "no"}>{row.moderator ? "✔" : "✖"}</td>
              <td className={row.finance ? "yes" : "no"}>{row.finance ? "✔" : "✖"}</td>
              <td className={row.support ? "yes" : "no"}>{row.support ? "✔" : "✖"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export const AdminAuditLogs = () => {
  const list = useAdminList(mockAuditLogs, ["actor", "action", "target"]);
  return (
    <div className="adm-page">
      <AdminPageHeader kicker="Giám sát" title="Nhật ký hệ thống" subtitle="Timeline hành động admin." />
      <AdminToolbar search={list.search} onSearchChange={list.setSearch} searchPlaceholder="Tìm admin, hành động..." />
      <div className="adm-audit-timeline">
        {list.filtered.map((log) => <AuditTimelineItem key={log.id} log={log} />)}
      </div>
    </div>
  );
};
