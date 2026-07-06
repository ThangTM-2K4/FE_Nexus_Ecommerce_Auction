import { useState } from "react";
import { toast } from "react-toastify";
import AdminPageHeader from "../../../components/admin/adminPageHeader";
import AdminTabs from "../../../components/admin/adminTabs";
import AdminTabOverview from "../../../components/admin/adminTabOverview";
import AdminToolbar from "../../../components/admin/adminToolbar";
import AdminModal from "../../../components/admin/adminModal";
import AdminStatusBadge from "../../../components/admin/adminStatusBadge";
import { AdminAnimatedView, AdminStaggerGrid } from "../../../components/admin/adminPageTransition";
import { UserCard } from "../../../components/admin/adminViews";
import { useAdminList } from "../../../hooks/useAdminList";
import { mockCustomers, mockSellers, mockSellerVerifications, STATUS_OPTIONS } from "../../../data/adminEntities";
import "../../../components/admin/adminViews/index.scss";
import "../../../components/admin/adminDataTable/index.scss";
import "../../../components/admin/adminTabOverview/index.scss";

export const AdminUsers = () => {
  const [tab, setTab] = useState("customer");
  const [detail, setDetail] = useState(null);
  const customers = useAdminList(mockCustomers, ["name", "email", "phone", "id"]);
  const sellers = useAdminList(mockSellers, ["name", "owner", "email", "id"]);
  const list = tab === "customer" ? customers : sellers;

  const handleLock = (row) => {
    const next = row.status === "Đã khóa" ? "Hoạt động" : "Đã khóa";
    list.updateItem(row.id, { status: next });
    toast.success(next === "Đã khóa" ? `Đã khóa ${row.name}` : `Đã mở khóa ${row.name}`);
  };

  const handleSellerAction = (row, action) => {
    const statusMap = { approve: "Hoạt động", reject: "Từ chối", suspend: "Tạm khóa", active: "Hoạt động" };
    list.updateItem(row.id, { status: statusMap[action] });
    toast.success(`Đã ${action === "approve" ? "duyệt" : action === "reject" ? "từ chối" : action === "suspend" ? "tạm khóa" : "kích hoạt"} seller`);
  };

  const customerActions = (row) => [
    { label: "Chi tiết", variant: "primary", onClick: () => setDetail(row) },
    { label: row.status === "Đã khóa" ? "Mở khóa" : "Khóa", onClick: () => handleLock(row) },
    { label: "Reset MK", onClick: () => toast.info(`Đã gửi email reset mật khẩu tới ${row.email}`) },
  ];

  const sellerActions = (row) => [
    { label: "Chi tiết", variant: "primary", onClick: () => setDetail(row) },
    ...(row.status === "Chờ duyệt" ? [
      { label: "Duyệt", variant: "success", onClick: () => handleSellerAction(row, "approve") },
      { label: "Từ chối", variant: "danger", onClick: () => handleSellerAction(row, "reject") },
    ] : []),
    ...(row.status === "Hoạt động" ? [{ label: "Tạm khóa", variant: "danger", onClick: () => handleSellerAction(row, "suspend") }] : []),
    ...(row.status === "Tạm khóa" ? [{ label: "Kích hoạt", variant: "success", onClick: () => handleSellerAction(row, "active") }] : []),
    ...(row.auctionEnabled
      ? [{ label: "Thu hồi ĐG", variant: "danger", onClick: () => { list.updateItem(row.id, { auctionEnabled: false }); toast.warning("Đã thu hồi quyền đấu giá"); } }]
      : [{ label: "Cấp ĐG", onClick: () => { list.updateItem(row.id, { auctionEnabled: true }); toast.success("Đã cấp quyền đấu giá"); } }]),
  ];

  const customerOverview = {
    title: "Tổng quan khách hàng",
    description: "Theo dõi tài khoản khách hàng, trạng thái hoạt động và mức độ tương tác trên nền tảng.",
    stats: [
      { label: "Tổng khách hàng", value: customers.filtered.length, highlight: true },
      { label: "Đang hoạt động", value: customers.filtered.filter((u) => u.status === "Hoạt động").length, hint: "Có đăng nhập gần đây" },
      { label: "Đã khóa", value: customers.filtered.filter((u) => u.status === "Đã khóa").length, warn: true },
      { label: "TB đơn hàng", value: `${Math.round(customers.filtered.reduce((s, u) => s + (u.orders || 0), 0) / (customers.filtered.length || 1))}`, hint: "đơn / khách" },
    ],
  };

  const sellerOverview = {
    title: "Tổng quan seller",
    description: "Quản lý shop, duyệt seller mới và theo dõi quyền đấu giá.",
    stats: [
      { label: "Tổng seller", value: sellers.filtered.length, highlight: true },
      { label: "Chờ duyệt", value: sellers.filtered.filter((s) => s.status === "Chờ duyệt").length, warn: true },
      { label: "Đang hoạt động", value: sellers.filtered.filter((s) => s.status === "Hoạt động").length },
      { label: "Có quyền đấu giá", value: sellers.filtered.filter((s) => s.auctionEnabled).length, hint: "seller được phép ĐG" },
    ],
  };

  const tabOverview = tab === "customer" ? customerOverview : sellerOverview;

  return (
    <div className="adm-page">
      <AdminPageHeader kicker="Người dùng" title="Quản lý người dùng" subtitle="Quản lý khách hàng, seller và quyền đấu giá." />
      <AdminTabs
        active={tab}
        onChange={setTab}
        tabs={[
          { id: "customer", label: "Khách hàng", count: customers.filtered.length },
          { id: "seller", label: "Seller", count: sellers.filtered.length },
        ]}
      />
      <AdminTabOverview {...tabOverview} />
      <AdminToolbar
        search={list.search}
        onSearchChange={list.setSearch}
        searchPlaceholder={`Tìm theo tên, email, ${tab === "customer" ? "SĐT" : "chủ shop"}...`}
        filters={[{
          key: "status", label: "Tất cả trạng thái", value: list.filter.status || "",
          onChange: (v) => list.setFilterValue("status", v), options: STATUS_OPTIONS.general,
        }]}
        actions={[{ label: "Xuất Excel", variant: "secondary", onClick: () => toast.info("Đang xuất file...") }]}
      />
      <AdminAnimatedView viewKey={tab}>
        <AdminStaggerGrid className="adm-user-grid">
          {list.filtered.map((row) => (
            <UserCard
              key={row.id}
              user={row}
              type={tab}
              actions={tab === "customer" ? customerActions(row) : sellerActions(row)}
            />
          ))}
        </AdminStaggerGrid>
      </AdminAnimatedView>
      <AdminModal open={!!detail} title="Chi tiết người dùng" onClose={() => setDetail(null)} wide>
        {detail && (
          <dl className="adm-detail-grid">
            {Object.entries(detail).map(([k, v]) => (
              <div key={k}><dt>{k}</dt><dd>{typeof v === "boolean" ? (v ? "Có" : "Không") : String(v)}</dd></div>
            ))}
          </dl>
        )}
      </AdminModal>
    </div>
  );
};

export const AdminSellerVerification = () => {
  const { filtered, search, setSearch, filter, setFilterValue, updateItem } = useAdminList(
    mockSellerVerifications, ["seller", "owner", "id"]
  );
  const [detail, setDetail] = useState(null);

  const handleAction = (row, status) => {
    updateItem(row.id, { status });
    toast.success(status === "Đã duyệt" ? "Đã duyệt KYC" : status === "Từ chối" ? "Đã từ chối KYC" : "Đã yêu cầu cập nhật");
  };

  return (
    <div className="adm-page">
      <AdminPageHeader kicker="KYC" title="Xác minh Seller" subtitle="Duyệt CCCD, giấy phép kinh doanh và tài khoản ngân hàng." />
      <AdminToolbar
        search={search} onSearchChange={setSearch} searchPlaceholder="Tìm seller, chủ shop..."
        filters={[{
          key: "status", label: "Tất cả trạng thái", value: filter.status || "",
          onChange: (v) => setFilterValue("status", v),
          options: [{ value: "Chờ duyệt", label: "Chờ duyệt" }, { value: "Đã duyệt", label: "Đã duyệt" }, { value: "Từ chối", label: "Từ chối" }],
        }]}
      />
      <AdminStaggerGrid className="adm-card-grid">
        {filtered.map((item) => (
          <article key={item.id} className="adm-card">
            <header>
              <div><h3>{item.seller}</h3><p>{item.owner} · {item.submittedAt}</p></div>
              <AdminStatusBadge status={item.status} />
            </header>
            <dl className="adm-detail-grid">
              <div><dt>CCCD</dt><dd>{item.cccd}</dd></div>
              <div><dt>Giấy phép KD</dt><dd>{item.businessLicense}</dd></div>
              <div><dt>Tài khoản NH</dt><dd>{item.bankAccount}</dd></div>
              <div><dt>Mã số thuế</dt><dd>{item.taxCode}</dd></div>
            </dl>
            <footer>
              <button type="button" className="adm-toolbar__btn adm-toolbar__btn--secondary" onClick={() => setDetail(item)}>Xem chi tiết</button>
              {item.status === "Chờ duyệt" && (
                <>
                  <button type="button" className="adm-toolbar__btn adm-toolbar__btn--primary" onClick={() => handleAction(item, "Đã duyệt")}>Duyệt</button>
                  <button type="button" className="adm-toolbar__btn adm-toolbar__btn--danger" onClick={() => handleAction(item, "Từ chối")}>Từ chối</button>
                  <button type="button" className="adm-toolbar__btn adm-toolbar__btn--secondary" onClick={() => handleAction(item, "Yêu cầu cập nhật")}>Yêu cầu cập nhật</button>
                </>
              )}
            </footer>
          </article>
        ))}
      </AdminStaggerGrid>
      <AdminModal open={!!detail} title="Chi tiết KYC" onClose={() => setDetail(null)} wide>
        {detail && <dl className="adm-detail-grid">{Object.entries(detail).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{String(v)}</dd></div>)}</dl>}
      </AdminModal>
    </div>
  );
};
