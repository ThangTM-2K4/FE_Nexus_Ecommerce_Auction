import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import AdminPageHeader from "../../../components/admin/adminPageHeader";
import AdminTabs from "../../../components/admin/adminTabs";
import AdminTabOverview from "../../../components/admin/adminTabOverview";
import AdminToolbar from "../../../components/admin/adminToolbar";
import AdminModal from "../../../components/admin/adminModal";
import AdminKpiCard from "../../../components/admin/adminKpiCard";
import { AdminAnimatedView, AdminStaggerGrid } from "../../../components/admin/adminPageTransition";
import { NotificationItem, BannerPreview, ContentDoc, AuditTimelineItem } from "../../../components/admin/adminViews";
import Select from "../../../components/common/select";
import { useAdminList } from "../../../hooks/useAdminList";
import {
  mockNotifications, mockBanners, mockContents, mockAnalytics,
  mockSystemSettings, mockRolePermissions,
} from "../../../data/adminEntities";
import {
  formatAuditLogDetail,
  getAdminAuditLogById,
  getAdminAuditLogs,
  getApiErrorMessage,
} from "../../../services/adminAuditService";
import "../../../components/admin/adminViews/index.scss";
import "../../../components/admin/adminDataTable/index.scss";
import "../../../components/admin/adminTabOverview/index.scss";

const toOptions = (values) => values.map((v) => ({ value: v, label: v }));

const NOTIFICATION_TYPE_OPTIONS = toOptions(["Hệ thống", "Khuyến mãi", "Nhắc đấu giá", "Nhắc đơn hàng"]);
const BANNER_TYPE_OPTIONS = toOptions(["Trang chủ", "Khuyến mãi", "Sự kiện"]);
const TOGGLE_OPTIONS = [
  { value: "true", label: "Bật" },
  { value: "false", label: "Tắt" },
];

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
            <Select
              label="Loại"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              options={NOTIFICATION_TYPE_OPTIONS}
            />
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
  const [viewMode, setViewMode] = useState("grid");
  const [form, setForm] = useState(null);

  return (
    <div className="adm-page">
      <AdminPageHeader kicker="Marketing" title="Quản lý banner" subtitle="Gallery preview banner theo loại." />
      <AdminToolbar
        actions={[{ label: "+ Thêm banner", onClick: () => setForm({ title: "", type: "Trang chủ", position: "Slider chính", status: "Hoạt động" }) }]}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      {viewMode === "grid" ? (
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
      ) : (
        <div className="adm-list-container">
          {list.filtered.map((b) => (
            <div key={b.id} className="adm-list-row">
              <div className="adm-list-row__thumb">🖼️</div>
              <div className="adm-list-row__col adm-list-row__col--main">
                <strong className="adm-list-row__title">{b.title}</strong>
                <small className="adm-list-row__sub">{b.type} · Vị trí: {b.position}</small>
              </div>
              <div className="adm-list-row__col">
                <span className="adm-list-row__label">Thời gian hiển thị</span>
                <span className="adm-list-row__val">{b.startDate} → {b.endDate}</span>
              </div>
              <AdminStatusBadge status={b.status} />
              <div className="adm-list-row__actions">
                <button type="button" onClick={() => setForm({ ...b })}>Sửa</button>
                <button type="button" className="danger" onClick={() => { list.removeItem(b.id); toast.info("Đã xóa"); }}>Xóa</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <AdminModal open={!!form} title={form?.id ? "Sửa banner" : "Thêm banner"} onClose={() => setForm(null)}>
        {form && (
          <div className="adm-form">
            <label>Tiêu đề<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
            <Select
              label="Loại"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              options={BANNER_TYPE_OPTIONS}
            />
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
  const [viewMode, setViewMode] = useState("grid");
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
      <AdminToolbar
        actions={[{ label: "+ Thêm bài viết", onClick: () => toast.info("Mở trình soạn thảo") }]}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      <AdminAnimatedView viewKey={tab}>
        {viewMode === "grid" ? (
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
        ) : (
          <div className="adm-list-container">
            {filtered.map((doc) => (
              <div key={doc.id} className="adm-list-row">
                <div className="adm-list-row__thumb">📝</div>
                <div className="adm-list-row__col adm-list-row__col--main">
                  <strong className="adm-list-row__title">{doc.title}</strong>
                  <small className="adm-list-row__sub">{doc.type} · Tác giả: {doc.author || "Admin"}</small>
                </div>
                <div className="adm-list-row__col">
                  <span className="adm-list-row__label">Cập nhật lần cuối</span>
                  <span className="adm-list-row__val">{doc.updatedAt || doc.createdAt || "Hôm nay"}</span>
                </div>
                <AdminStatusBadge status={doc.status} />
                <div className="adm-list-row__actions">
                  <button type="button" onClick={() => toast.info(`Sửa: ${doc.title}`)}>Sửa</button>
                  <button type="button" className="danger" onClick={() => { list.removeItem(doc.id); toast.info("Đã xóa"); }}>Xóa</button>
                </div>
              </div>
            ))}
          </div>
        )}
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
              {Object.entries(fields).map(([key, val]) =>
                typeof val === "boolean" ? (
                  // <Select> render ra <button>, không lồng trong <label> được
                  <Select
                    key={key}
                    label={key}
                    value={val ? "true" : "false"}
                    onChange={(e) =>
                      setSettings({ ...settings, [section]: { ...fields, [key]: e.target.value === "true" } })
                    }
                    options={TOGGLE_OPTIONS}
                  />
                ) : (
                  <label key={key}>
                    {key}
                    <input value={val} onChange={(e) => setSettings({ ...settings, [section]: { ...fields, [key]: e.target.value } })} />
                  </label>
                )
              )}
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
  const PAGE_SIZE = 20;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [entityTypeFilter, setEntityTypeFilter] = useState("");
  const [actorUserId, setActorUserId] = useState("");
  const [targetUserId, setTargetUserId] = useState("");
  const [fromUtc, setFromUtc] = useState("");
  const [toUtc, setToUtc] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [viewMode, setViewMode] = useState("grid");
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);


  const loadLogs = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const result = await getAdminAuditLogs({
        page,
        pageSize: PAGE_SIZE,
        action: actionFilter || undefined,
        entityType: entityTypeFilter || undefined,
        actorUserId: actorUserId || undefined,
        targetUserId: targetUserId || undefined,
        fromUtc: fromUtc ? new Date(fromUtc).toISOString() : undefined,
        toUtc: toUtc ? new Date(toUtc).toISOString() : undefined,
      });
      setItems(result.items);
      setTotal(result.total);
    } catch (error) {
      const message = error?.response?.status === 404
        ? "API nhật ký (/admin/audit-logs) chưa được triển khai trên server."
        : getApiErrorMessage(error, "Không tải được nhật ký hệ thống");
      setLoadError(message);
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [actionFilter, actorUserId, entityTypeFilter, fromUtc, page, targetUserId, toUtc]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter((log) =>
      [log.actor, log.action, log.target, log.ip, log.entityType, log.entityId]
        .some((v) => String(v ?? "").toLowerCase().includes(q))
    );
  }, [items, search]);

  const openDetail = async (log) => {
    setDetail(formatAuditLogDetail(log._raw ?? log));
    setDetailLoading(true);
    try {
      const full = await getAdminAuditLogById(log.id);
      if (full) setDetail(formatAuditLogDetail(full));
    } catch (error) {
      if (error?.response?.status !== 404) {
        toast.warning(getApiErrorMessage(error, "Không tải được chi tiết nhật ký"));
      }
    } finally {
      setDetailLoading(false);
    }
  };

  const resetFilters = () => {
    setActionFilter("");
    setEntityTypeFilter("");
    setActorUserId("");
    setTargetUserId("");
    setFromUtc("");
    setToUtc("");
    setPage(1);
  };

  return (
    <div className="adm-page">
      <AdminPageHeader kicker="Giám sát" title="Nhật ký hệ thống" subtitle="Timeline hành động admin từ /admin/audit-logs." />
      <AdminToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm admin, hành động, đối tượng..."
        actions={[
          { label: "Xóa bộ lọc", variant: "secondary", onClick: resetFilters },
          { label: "Tải lại", variant: "secondary", onClick: loadLogs },
        ]}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      <div className="adm-form adm-form--inline adm-audit-filters">
        <label>
          Hành động (action)
          <input value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setPage(1); }} placeholder="VD: USER.UPDATE" />
        </label>
        <label>
          Loại entity
          <input value={entityTypeFilter} onChange={(e) => { setEntityTypeFilter(e.target.value); setPage(1); }} placeholder="VD: User" />
        </label>
        <label>
          Actor User ID
          <input value={actorUserId} onChange={(e) => { setActorUserId(e.target.value); setPage(1); }} placeholder="UUID" />
        </label>
        <label>
          Target User ID
          <input value={targetUserId} onChange={(e) => { setTargetUserId(e.target.value); setPage(1); }} placeholder="UUID" />
        </label>
        <label>
          Từ (UTC)
          <input type="datetime-local" value={fromUtc} onChange={(e) => { setFromUtc(e.target.value); setPage(1); }} />
        </label>
        <label>
          Đến (UTC)
          <input type="datetime-local" value={toUtc} onChange={(e) => { setToUtc(e.target.value); setPage(1); }} />
        </label>
      </div>
      {loading ? (
        <p className="adm-page__empty">Đang tải nhật ký...</p>
      ) : loadError ? (
        <p className="adm-page__empty">{loadError}</p>
      ) : filtered.length === 0 ? (
        <p className="adm-page__empty">Không có nhật ký phù hợp.</p>
      ) : (
        <>
          {viewMode === "grid" ? (
            <div className="adm-audit-timeline">
              {filtered.map((log) => (
                <button key={log.id} type="button" className="adm-audit-timeline__item" onClick={() => openDetail(log)}>
                  <AuditTimelineItem log={log} />
                </button>
              ))}
            </div>
          ) : (
            <div className="adm-list-container">
              {filtered.map((log) => (
                <div key={log.id} className="adm-list-row" onClick={() => openDetail(log)} style={{ cursor: "pointer" }}>
                  <div className="adm-list-row__thumb">📜</div>
                  <div className="adm-list-row__col adm-list-row__col--main">
                    <strong className="adm-list-row__title">{log.actor}</strong>
                    <small className="adm-list-row__sub">{log.time} · IP: {log.ip}</small>
                  </div>
                  <div className="adm-list-row__col">
                    <span className="adm-list-row__label">Hành động → Đối tượng</span>
                    <span className="adm-list-row__val">{log.action} → {log.target}</span>
                  </div>
                  <div className="adm-list-row__col">
                    <span className="adm-list-row__label">Thay đổi</span>
                    <span className="adm-list-row__val"><s style={{ color: "#ef4444" }}>{log.oldValue}</s> → <span style={{ color: "#22c55e" }}>{log.newValue}</span></span>
                  </div>
                  <div className="adm-list-row__actions">
                    <button type="button" className="primary" onClick={() => openDetail(log)}>Chi tiết</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {Math.ceil(total / PAGE_SIZE) > 1 && (
            <div className="adm-page__pagination">
              <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Trước</button>
              <span>Trang {page}/{Math.ceil(total / PAGE_SIZE)}</span>
              <button type="button" disabled={page >= Math.ceil(total / PAGE_SIZE)} onClick={() => setPage((p) => p + 1)}>Sau</button>
            </div>
          )}
        </>
      )}

      <AdminModal open={!!detail} title="Chi tiết nhật ký" onClose={() => setDetail(null)} wide>
        {detail && (
          detailLoading ? <p>Đang tải chi tiết...</p> : (
            <dl className="adm-detail-grid">
              {Object.entries(detail).filter(([k]) => k !== "_raw").map(([k, v]) => (
                <div key={k}><dt>{k}</dt><dd>{String(v)}</dd></div>
              ))}
            </dl>
          )
        )}
      </AdminModal>
    </div>
  );
};
