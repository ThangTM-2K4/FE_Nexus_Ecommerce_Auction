import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import AdminPageHeader from "../../../components/admin/adminPageHeader";
import AdminTabs from "../../../components/admin/adminTabs";
import AdminTabOverview from "../../../components/admin/adminTabOverview";
import AdminToolbar from "../../../components/admin/adminToolbar";
import AdminModal from "../../../components/admin/adminModal";
import AdminStatusBadge from "../../../components/admin/adminStatusBadge";
import { AdminAnimatedView, AdminStaggerGrid } from "../../../components/admin/adminPageTransition";
import { UserCard } from "../../../components/admin/adminViews";
import {
  approveAdminSeller,
  enrichSellersWithDetails,
  formatSellerDetail,
  getAdminSellerDetail,
  getAdminSellers,
  getApiErrorMessage as getSellerApiErrorMessage,
  isSellerPending,
  mapSellerToVerification,
  rejectAdminSeller,
  SELLER_API_STATUS,
  SELLER_FILTER_OPTIONS,
  splitSellerDetailFields,
} from "../../../services/adminSellerService";
import {
  classifyUserByRole,
  deleteAdminUser,
  enrichUsersWithRoles,
  filterUsersByRoleTab,
  GENDER_FILTER_OPTIONS,
  getAdminUserDetail,
  getAdminUsers,
  getApiErrorMessage,
  splitUserDetailFields,
  USER_ROLE_TABS,
  USER_STATUS_FILTER_OPTIONS,
} from "../../../services/adminUserService";
import "../../../components/admin/adminViews/index.scss";
import "../../../components/admin/adminDataTable/index.scss";
import "../../../components/admin/adminTabOverview/index.scss";

export const AdminUsers = () => {
  const PAGE_SIZE = 20;
  const [tab, setTab] = useState("customer");
  const [detail, setDetail] = useState(null);
  const [detailType, setDetailType] = useState(null);
  const [showSensitiveDetail, setShowSensitiveDetail] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [userSearchDebounced, setUserSearchDebounced] = useState("");
  const [userGender, setUserGender] = useState("");
  const [userStatus, setUserStatus] = useState("");
  const [userPage, setUserPage] = useState(1);
  const [userTotal, setUserTotal] = useState(0);
  const [sellers, setSellers] = useState([]);
  const [sellersLoading, setSellersLoading] = useState(false);
  const [sellerSearch, setSellerSearch] = useState("");
  const [sellerStatus, setSellerStatus] = useState("");
  const [sellerPage, setSellerPage] = useState(1);
  const [sellerTotal, setSellerTotal] = useState(0);
  const [tabCounts, setTabCounts] = useState({ customer: 0, admin: 0, seller: 0 });

  const refreshTabCounts = useCallback(async () => {
    try {
      const [usersResult, sellersResult] = await Promise.all([
        getAdminUsers({ page: 1, pageSize: 100 }),
        getAdminSellers({ page: 1, pageSize: 1 }),
      ]);
      const enriched = await enrichUsersWithRoles(usersResult.items, getAdminUserDetail);
      setTabCounts({
        customer: enriched.filter((u) => classifyUserByRole(u) === "customer").length,
        admin: enriched.filter((u) => classifyUserByRole(u) === "admin").length,
        seller: sellersResult.total,
      });
    } catch {
      // Giữ số đếm cũ nếu không tải được
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setUserSearchDebounced(userSearch), 400);
    return () => clearTimeout(timer);
  }, [userSearch]);

  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const result = await getAdminUsers({
        search: userSearchDebounced,
        gender: userGender || undefined,
        status: userStatus || undefined,
        page: userPage,
        pageSize: PAGE_SIZE,
      });
      const enriched = await enrichUsersWithRoles(result.items, getAdminUserDetail);
      setUsers(enriched);
      setUserTotal(result.total);
      await refreshTabCounts();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Không tải được danh sách người dùng"));
    } finally {
      setUsersLoading(false);
    }
  }, [userGender, userPage, userSearchDebounced, userStatus, refreshTabCounts]);

  const loadSellers = useCallback(async () => {
    setSellersLoading(true);
    try {
      const result = await getAdminSellers({
        status: sellerStatus || undefined,
        page: sellerPage,
        pageSize: PAGE_SIZE,
      });
      const enriched = await enrichSellersWithDetails(result.items, getAdminSellerDetail);
      setSellers(enriched);
      setSellerTotal(result.total);
      setTabCounts((prev) => ({ ...prev, seller: result.total }));
    } catch (error) {
      toast.error(getSellerApiErrorMessage(error, "Không tải được danh sách seller"));
    } finally {
      setSellersLoading(false);
    }
  }, [sellerStatus, sellerPage]);

  useEffect(() => {
    refreshTabCounts();
  }, [refreshTabCounts]);

  useEffect(() => {
    if (tab === "customer" || tab === "admin") loadUsers();
  }, [tab, loadUsers]);

  useEffect(() => {
    if (tab === "seller") loadSellers();
  }, [tab, loadSellers]);

  const usersByRole = useMemo(() => filterUsersByRoleTab(users, tab), [users, tab]);

  const filteredSellers = useMemo(() => {
    if (!sellerSearch.trim()) return sellers;
    const q = sellerSearch.toLowerCase();
    return sellers.filter((s) =>
      [s.name, s.businessName, s.owner, s.userId, s.sellerType, s.sellerTypeLabel, s.id]
        .some((v) => String(v ?? "").toLowerCase().includes(q))
    );
  }, [sellerSearch, sellers]);

  const closeDetail = () => {
    setDetail(null);
    setDetailType(null);
    setShowSensitiveDetail(false);
  };

  const openCustomerDetail = async (row) => {
    setDetailType("user");
    setShowSensitiveDetail(false);
    setDetail(splitUserDetailFields(row._raw ?? row));
    setDetailLoading(true);
    try {
      const full = await getAdminUserDetail(row.id);
      if (full) setDetail(splitUserDetailFields(full));
    } catch {
      toast.warning("Không tải được chi tiết đầy đủ, hiển thị tạm dữ liệu hiện có");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDeleteCustomer = async () => {
    if (!deleteTarget) return;
    setProcessingId(deleteTarget.id);
    try {
      await deleteAdminUser(deleteTarget.id);
      toast.success(`Đã xóa ${deleteTarget.name}`);
      setDeleteTarget(null);
      await loadUsers();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Không thể xóa người dùng"));
    } finally {
      setProcessingId(null);
    }
  };

  const openSellerDetail = async (row) => {
    setDetailType("seller");
    setShowSensitiveDetail(false);
    setDetail(splitSellerDetailFields(row._raw ?? row));
    setDetailLoading(true);
    try {
      const full = await getAdminSellerDetail(row.id);
      if (full) setDetail(splitSellerDetailFields(full));
    } catch {
      toast.warning("Không tải được chi tiết đầy đủ, hiển thị tạm dữ liệu hiện có");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleApprove = async (row) => {
    setProcessingId(row.id);
    try {
      await approveAdminSeller(row.id);
      toast.success(`Đã duyệt seller ${row.name}`);
      await loadSellers();
    } catch (error) {
      toast.error(getSellerApiErrorMessage(error, "Không thể duyệt seller"));
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    if (!rejectReason.trim()) {
      toast.warning("Vui lòng nhập lý do từ chối");
      return;
    }
    setProcessingId(rejectTarget.id);
    try {
      await rejectAdminSeller(rejectTarget.id, rejectReason.trim());
      toast.info(`Đã từ chối seller ${rejectTarget.name}`);
      setRejectTarget(null);
      setRejectReason("");
      await loadSellers();
    } catch (error) {
      toast.error(getSellerApiErrorMessage(error, "Không thể từ chối seller"));
    } finally {
      setProcessingId(null);
    }
  };

  const accountUserActions = (row) => {
    const busy = processingId === row.id;
    const actions = [
      { label: "Chi tiết", variant: "primary", onClick: () => openCustomerDetail(row) },
    ];
    if (tab !== "admin") {
      actions.push({ label: "Xóa", variant: "danger", onClick: () => setDeleteTarget(row), disabled: busy });
    }
    return actions;
  };

  const renderDetailFields = (fields) => (
    <dl className="adm-detail-grid">
      {Object.entries(fields ?? {}).map(([key, value]) => (
        <div key={key}>
          <dt>{key}</dt>
          <dd>{typeof value === "boolean" ? (value ? "Có" : "Không") : String(value)}</dd>
        </div>
      ))}
    </dl>
  );

  const sellerActions = (row) => {
    const busy = processingId === row.id;
    const actions = [{ label: "Chi tiết", variant: "primary", onClick: () => openSellerDetail(row) }];
    if (isSellerPending(row.apiStatus)) {
      actions.push(
        { label: busy ? "Đang xử lý..." : "Duyệt", variant: "success", onClick: () => handleApprove(row) },
        { label: "Từ chối", variant: "danger", onClick: () => { setRejectTarget(row); setRejectReason(""); } }
      );
    }
    return actions;
  };

  const customerOverview = {
    title: "Tổng quan khách hàng",
    description: "Tài khoản người dùng thường (role USER/Khách hàng).",
    stats: [
      { label: "Tổng tài khoản", value: userTotal, highlight: true },
      { label: "Khách hàng (trang)", value: usersByRole.length, hint: `trang ${userPage}` },
      { label: "Đang hoạt động", value: usersByRole.filter((u) => u.apiStatus === "ACTIVE").length },
      { label: "Trang", value: `${userPage}/${Math.max(1, Math.ceil(userTotal / PAGE_SIZE))}` },
    ],
  };

  const adminOverview = {
    title: "Tổng quan quản trị viên",
    description: "Tài khoản ADMIN, MODERATOR, SUPPORT, FINANCE...",
    stats: [
      { label: "Tổng tài khoản", value: userTotal, highlight: true },
      { label: "Quản trị (trang)", value: usersByRole.length, hint: `trang ${userPage}` },
      { label: "Đang hoạt động", value: usersByRole.filter((u) => u.apiStatus === "ACTIVE").length },
      { label: "Trang", value: `${userPage}/${Math.max(1, Math.ceil(userTotal / PAGE_SIZE))}` },
    ],
  };

  const sellerOverview = {
    title: "Tổng quan seller",
    description: "Đồng bộ từ API AdminSeller.",
    stats: [
      { label: "Tổng seller", value: sellerTotal, highlight: true },
      { label: "Trang hiện tại", value: filteredSellers.length, hint: `trang ${sellerPage}` },
      { label: "Chờ duyệt", value: sellers.filter((s) => isSellerPending(s.apiStatus)).length, warn: true },
      { label: "Đã duyệt", value: sellers.filter((s) => String(s.apiStatus).toLowerCase() === "approved").length },
    ],
  };

  const tabOverview = tab === "seller"
    ? sellerOverview
    : tab === "admin"
      ? adminOverview
      : customerOverview;

  const isAccountTab = tab === "customer" || tab === "admin";

  return (
    <div className="adm-page">
      <AdminPageHeader kicker="Người dùng" title="Quản lý người dùng" subtitle="Phân loại theo vai trò: Khách hàng, Quản trị viên, Seller." />
      <AdminTabs
        active={tab}
        onChange={setTab}
        tabs={USER_ROLE_TABS.map((item) => ({
          id: item.id,
          label: item.label,
          count: tabCounts[item.id] ?? 0,
        }))}
      />
      <AdminTabOverview {...tabOverview} />
      {isAccountTab ? (
        <AdminToolbar
          search={userSearch}
          onSearchChange={(v) => { setUserSearch(v); setUserPage(1); }}
          searchPlaceholder="Tìm theo tên, email, SĐT..."
          filters={[
            {
              key: "gender",
              label: "Tất cả giới tính",
              value: userGender,
              onChange: (v) => { setUserGender(v); setUserPage(1); },
              options: GENDER_FILTER_OPTIONS,
            },
            {
              key: "status",
              label: "Tất cả trạng thái",
              value: userStatus,
              onChange: (v) => { setUserStatus(v); setUserPage(1); },
              options: USER_STATUS_FILTER_OPTIONS,
            },
          ]}
          actions={[{ label: "Tải lại", variant: "secondary", onClick: loadUsers }]}
        />
      ) : (
        <AdminToolbar
          search={sellerSearch}
          onSearchChange={setSellerSearch}
          searchPlaceholder="Tìm tên shop, chủ shop, email..."
          filters={[{
            key: "status",
            label: "Tất cả trạng thái",
            value: sellerStatus,
            onChange: (v) => { setSellerStatus(v); setSellerPage(1); },
            options: SELLER_FILTER_OPTIONS,
          }]}
          actions={[{ label: "Tải lại", variant: "secondary", onClick: loadSellers }]}
        />
      )}
      <AdminAnimatedView viewKey={tab}>
        {isAccountTab ? usersLoading ? (
          <p className="adm-page__empty">Đang tải danh sách người dùng...</p>
        ) : usersByRole.length === 0 ? (
          <p className="adm-page__empty">
            {tab === "admin" ? "Không có quản trị viên phù hợp trên trang này." : "Không có khách hàng phù hợp trên trang này."}
          </p>
        ) : (
          <>
            <AdminStaggerGrid className="adm-user-grid">
              {usersByRole.map((row) => (
                <UserCard
                  key={row.id}
                  user={row}
                  type={tab === "admin" ? "admin" : "customer"}
                  actions={accountUserActions(row)}
                />
              ))}
            </AdminStaggerGrid>
            {Math.ceil(userTotal / PAGE_SIZE) > 1 && (
              <div className="adm-page__pagination">
                <button type="button" disabled={userPage <= 1} onClick={() => setUserPage((p) => p - 1)}>Trước</button>
                <span>Trang {userPage}/{Math.ceil(userTotal / PAGE_SIZE)}</span>
                <button type="button" disabled={userPage >= Math.ceil(userTotal / PAGE_SIZE)} onClick={() => setUserPage((p) => p + 1)}>Sau</button>
              </div>
            )}
          </>
        ) : sellersLoading ? (
          <p className="adm-page__empty">Đang tải danh sách seller...</p>
        ) : filteredSellers.length === 0 ? (
          <p className="adm-page__empty">Không có seller phù hợp.</p>
        ) : (
          <>
            <AdminStaggerGrid className="adm-user-grid">
              {filteredSellers.map((row) => (
                <UserCard key={row.id} user={row} type="seller" actions={sellerActions(row)} />
              ))}
            </AdminStaggerGrid>
            {Math.ceil(sellerTotal / PAGE_SIZE) > 1 && (
              <div className="adm-page__pagination">
                <button type="button" disabled={sellerPage <= 1} onClick={() => setSellerPage((p) => p - 1)}>Trước</button>
                <span>Trang {sellerPage}/{Math.ceil(sellerTotal / PAGE_SIZE)}</span>
                <button type="button" disabled={sellerPage >= Math.ceil(sellerTotal / PAGE_SIZE)} onClick={() => setSellerPage((p) => p + 1)}>Sau</button>
              </div>
            )}
          </>
        )}
      </AdminAnimatedView>
      <AdminModal
        open={!!detail}
        title={detailType === "seller" ? "Chi tiết seller" : "Chi tiết người dùng"}
        onClose={closeDetail}
        wide
      >
        {detail && (
          detailLoading ? <p>Đang tải chi tiết...</p> : (
            <div className="adm-detail-panel">
              {renderDetailFields(detail.public)}

              <div className="adm-sensitive-panel">
                <button
                  type="button"
                  className="adm-sensitive-panel__toggle"
                  onClick={() => setShowSensitiveDetail((v) => !v)}
                >
                  {showSensitiveDetail ? "Ẩn thông tin cá nhân" : "Hiển thị thông tin cá nhân"}
                </button>

                {showSensitiveDetail ? (
                  <div className="adm-sensitive-panel__content">
                    {renderDetailFields(detail.sensitive)}
                  </div>
                ) : (
                  <p className="adm-sensitive-panel__masked">
                    CCCD, địa chỉ, tài khoản ngân hàng đang được ẩn.
                  </p>
                )}
              </div>
            </div>
          )
        )}
      </AdminModal>
      <AdminModal open={!!deleteTarget} title="Xác nhận xóa người dùng" onClose={() => setDeleteTarget(null)}>
        {deleteTarget && (
          <div className="adm-form">
            <p>
              Bạn có chắc muốn xóa tài khoản <strong>{deleteTarget.name}</strong>
              {deleteTarget.email ? ` (${deleteTarget.email})` : ""}?
            </p>
            <p className="adm-form__warning">Hành động này không thể hoàn tác.</p>
            <div className="adm-form__actions">
              <button type="button" className="cancel" onClick={() => setDeleteTarget(null)}>Hủy</button>
              <button
                type="button"
                className="save danger"
                onClick={handleDeleteCustomer}
                disabled={processingId === deleteTarget.id}
              >
                {processingId === deleteTarget.id ? "Đang xóa..." : "Xác nhận xóa"}
              </button>
            </div>
          </div>
        )}
      </AdminModal>
      <AdminModal open={!!rejectTarget} title="Từ chối seller" onClose={() => { setRejectTarget(null); setRejectReason(""); }}>
        {rejectTarget && (
          <div className="adm-form">
            <label>
              Lý do từ chối
              <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={4} />
            </label>
            <div className="adm-form__actions">
              <button type="button" className="cancel" onClick={() => { setRejectTarget(null); setRejectReason(""); }}>Hủy</button>
              <button type="button" className="save" onClick={handleReject}>Xác nhận từ chối</button>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
};

export const AdminSellerVerification = () => {
  const PAGE_SIZE = 20;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(SELLER_API_STATUS.PENDING);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [detail, setDetail] = useState(null);
  const [showSensitiveDetail, setShowSensitiveDetail] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const renderDetailFields = (fields) => (
    <dl className="adm-detail-grid">
      {Object.entries(fields ?? {}).map(([key, value]) => (
        <div key={key}>
          <dt>{key}</dt>
          <dd>{typeof value === "boolean" ? (value ? "Có" : "Không") : String(value)}</dd>
        </div>
      ))}
    </dl>
  );

  const loadVerifications = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAdminSellers({
        status: statusFilter || undefined,
        page,
        pageSize: PAGE_SIZE,
      });
      const enriched = await enrichSellersWithDetails(result.items, getAdminSellerDetail);
      setItems(enriched.map((s) => mapSellerToVerification(s._raw ?? s)).filter(Boolean));
      setTotal(result.total);
    } catch (error) {
      toast.error(getSellerApiErrorMessage(error, "Không tải được danh sách xác minh seller"));
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    loadVerifications();
  }, [loadVerifications]);

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter((item) =>
      [item.seller, item.businessName, item.owner, item.userId, item.sellerType, item.id, item.taxCode]
        .some((v) => String(v ?? "").toLowerCase().includes(q))
    );
  }, [items, search]);

  const isPending = (row) => isSellerPending(row.apiStatus);

  const handleApprove = async (row) => {
    setProcessingId(row.id);
    try {
      await approveAdminSeller(row.id);
      toast.success(`Đã duyệt KYC: ${row.seller}`);
      await loadVerifications();
    } catch (error) {
      toast.error(getSellerApiErrorMessage(error, "Không thể duyệt hồ sơ"));
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectTarget || !rejectReason.trim()) {
      toast.warning("Vui lòng nhập lý do từ chối");
      return;
    }
    setProcessingId(rejectTarget.id);
    try {
      await rejectAdminSeller(rejectTarget.id, rejectReason.trim());
      toast.info(`Đã từ chối: ${rejectTarget.seller}`);
      setRejectTarget(null);
      setRejectReason("");
      await loadVerifications();
    } catch (error) {
      toast.error(getSellerApiErrorMessage(error, "Không thể từ chối hồ sơ"));
    } finally {
      setProcessingId(null);
    }
  };

  const openDetail = async (row) => {
    setShowSensitiveDetail(false);
    setDetail(splitSellerDetailFields(row._raw ?? row));
    setDetailLoading(true);
    try {
      const raw = await getAdminSellerDetail(row.id);
      if (raw) setDetail(splitSellerDetailFields(raw));
    } catch {
      toast.warning("Không tải được chi tiết đầy đủ");
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="adm-page">
      <AdminPageHeader kicker="KYC" title="Xác minh Seller" subtitle="Duyệt seller qua API AdminSeller." />
      <AdminTabOverview
        title="Tổng quan xác minh"
        description="Dữ liệu lấy trực tiếp từ /admin/sellers."
        stats={[
          { label: "Tổng hồ sơ", value: total, highlight: true },
          { label: "Đang hiển thị", value: filtered.length },
          { label: "Chờ duyệt", value: items.filter(isPending).length, warn: true },
          { label: "Trang", value: `${page}/${Math.max(1, Math.ceil(total / PAGE_SIZE))}` },
        ]}
      />
      <AdminToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm seller, chủ shop..."
        filters={[{
          key: "status",
          label: "Tất cả trạng thái",
          value: statusFilter,
          onChange: (v) => { setStatusFilter(v); setPage(1); },
          options: SELLER_FILTER_OPTIONS,
        }]}
        actions={[{ label: "Tải lại", variant: "secondary", onClick: loadVerifications }]}
      />
      {loading ? (
        <p className="adm-page__empty">Đang tải dữ liệu...</p>
      ) : filtered.length === 0 ? (
        <p className="adm-page__empty">Không có hồ sơ phù hợp.</p>
      ) : (
        <AdminStaggerGrid className="adm-card-grid">
          {filtered.map((item) => (
            <article key={item.id} className="adm-card">
              <header>
                <div><h3>{item.seller}</h3><p>{item.owner} · {item.submittedAt}</p></div>
                <AdminStatusBadge status={item.status} />
              </header>
              <dl className="adm-detail-grid">
                <div><dt>Loại seller</dt><dd>{item.sellerTypeLabel ?? item.sellerType ?? "—"}</dd></div>
                <div><dt>Địa chỉ</dt><dd>{item.address ?? "—"}</dd></div>
                <div><dt>Giấy phép KD</dt><dd>{item.businessLicense ?? "—"}</dd></div>
                <div><dt>Tài khoản NH</dt><dd>{item.bankAccount ?? "—"}</dd></div>
                <div><dt>Mã số thuế</dt><dd>{item.taxCode ?? "—"}</dd></div>
              </dl>
              <footer>
                <button type="button" className="adm-toolbar__btn adm-toolbar__btn--secondary" onClick={() => openDetail(item)}>Xem chi tiết</button>
                {isPending(item) && (
                  <>
                    <button
                      type="button"
                      className="adm-toolbar__btn adm-toolbar__btn--primary"
                      onClick={() => handleApprove(item)}
                      disabled={processingId === item.id}
                    >
                      {processingId === item.id ? "Đang xử lý..." : "Duyệt"}
                    </button>
                    <button
                      type="button"
                      className="adm-toolbar__btn adm-toolbar__btn--danger"
                      onClick={() => { setRejectTarget(item); setRejectReason(""); }}
                      disabled={processingId === item.id}
                    >
                      Từ chối
                    </button>
                  </>
                )}
              </footer>
            </article>
          ))}
        </AdminStaggerGrid>
      )}
      {Math.ceil(total / PAGE_SIZE) > 1 && (
        <div className="adm-page__pagination">
          <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Trước</button>
          <span>Trang {page}/{Math.ceil(total / PAGE_SIZE)}</span>
          <button type="button" disabled={page >= Math.ceil(total / PAGE_SIZE)} onClick={() => setPage((p) => p + 1)}>Sau</button>
        </div>
      )}
      <AdminModal open={!!detail} title="Chi tiết KYC" onClose={() => { setDetail(null); setShowSensitiveDetail(false); }} wide>
        {detail && (
          detailLoading ? <p>Đang tải...</p> : (
            <div className="adm-detail-panel">
              {renderDetailFields(detail.public)}
              <div className="adm-sensitive-panel">
                <button
                  type="button"
                  className="adm-sensitive-panel__toggle"
                  onClick={() => setShowSensitiveDetail((v) => !v)}
                >
                  {showSensitiveDetail ? "Ẩn thông tin cá nhân" : "Hiển thị thông tin cá nhân"}
                </button>
                {showSensitiveDetail ? (
                  <div className="adm-sensitive-panel__content">
                    {renderDetailFields(detail.sensitive)}
                  </div>
                ) : (
                  <p className="adm-sensitive-panel__masked">
                    CCCD, địa chỉ, tài khoản ngân hàng đang được ẩn.
                  </p>
                )}
              </div>
            </div>
          )
        )}
      </AdminModal>
      <AdminModal open={!!rejectTarget} title="Từ chối hồ sơ seller" onClose={() => { setRejectTarget(null); setRejectReason(""); }}>
        {rejectTarget && (
          <div className="adm-form">
            <label>
              Lý do
              <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={4} />
            </label>
            <div className="adm-form__actions">
              <button type="button" className="cancel" onClick={() => { setRejectTarget(null); setRejectReason(""); }}>Hủy</button>
              <button type="button" className="save" onClick={handleReject}>Xác nhận</button>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
};
