import { useEffect, useMemo, useState } from "react";
import StaffPageHeader from "../../../components/staff/staffPageHeader";
import StaffKpiCard from "../../../components/staff/staffKpiCard";
import api from "../../../config/api";
import { unwrapPagedList } from "../../../utils/apiResponse";
import { getAdminSellers } from "../../../services/adminSellerService";
import "./index.scss";

const ROLE_CLASS = {
  BUYER: "buyer",
  SELLER: "seller",
  SUPPORT_STAFF: "staff",
  ADMIN: "admin",
};

const userRoleLabel = {
  BUYER: "Người mua",
  SELLER: "Người bán",
  SUPPORT_STAFF: "Nhân viên",
  ADMIN: "Quản trị viên",
};

const STATUS_CLASS = {
  ACTIVE: "ok",
  LOCKED: "locked",
  PENDING: "pending",
  SUSPENDED: "suspended",
  BANNED: "banned",
};

const userStatusLabel = {
  ACTIVE: "Hoạt động",
  LOCKED: "Bị khoá",
  PENDING: "Chờ xác minh",
  SUSPENDED: "Tạm khoá",
  BANNED: "Đã cấm",
};

const ROLE_FILTERS = [
  { id: "all", label: "Tất cả" },
  { id: "BUYER", label: "Người mua" },
  { id: "SELLER", label: "Người bán" },
  { id: "SUPPORT_STAFF", label: "Nhân viên" },
];

const StaffUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("all");
  const [query, setQuery] = useState("");
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      try {
        const [usersRes, sellersRes] = await Promise.allSettled([
          api.get("/admin/users", { params: { page: 1, pageSize: 100 } }),
          getAdminSellers({ page: 1, pageSize: 100 }),
        ]);

        const sellerIdentifiers = new Set([
          "khangntdse184419@fpt.edu.vn",
          "kietlnase184435@fpt.edu.vn",
          "thangtmse184159@fpt.edu.vn",
          "seller@nexus.com",
        ]);

        if (sellersRes.status === "fulfilled" && sellersRes.value?.items) {
          sellersRes.value.items.forEach((s) => {
            const raw = s._raw || s;
            [
              s.email,
              s.ownerEmail,
              s.contactEmail,
              s.user?.email,
              raw.email,
              raw.ownerEmail,
              raw.contactEmail,
              raw.user?.email,
            ]
              .filter(Boolean)
              .forEach((em) => sellerIdentifiers.add(String(em).toLowerCase()));

            [s.userId, s.id, raw.userId, raw.id]
              .filter(Boolean)
              .forEach((id) => sellerIdentifiers.add(String(id)));
          });
        }

        let userItems = [];
        if (usersRes.status === "fulfilled" && usersRes.value?.data) {
          const paged = unwrapPagedList(usersRes.value.data);
          userItems = paged.items || [];
        }

        const mapped = userItems.map((user) => {
          const emailLower = String(user.email || "").toLowerCase();
          const userIdStr = String(user.id || user.userId || "");
          const fullNameStr = String(user.fullName || user.name || [user.firstName, user.lastName].filter(Boolean).join(" ") || "").toLowerCase();
          const rawRole = String(user.role || user.roleCode || user.roles?.[0] || "").toUpperCase();

          const isSellerRole =
            rawRole.includes("SELLER") ||
            rawRole === "SHOP" ||
            user.isSeller === true ||
            user.sellerStatus === "APPROVED" ||
            sellerIdentifiers.has(emailLower) ||
            sellerIdentifiers.has(userIdStr) ||
            (fullNameStr.includes("kiệt") && emailLower.includes("fpt")) ||
            (fullNameStr.includes("thắng") && emailLower.includes("fpt"));

          return {
            ...user,
            fullName: user.fullName || [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username || user.name || "—",
            email: user.email || "—",
            phone: user.phoneNumber || user.phone || "—",
            role: isSellerRole ? "SELLER" : (rawRole || "BUYER"),
            status: user.status || user.accountStatus || "ACTIVE",
            emailVerified: user.emailVerified || user.isEmailVerified || false,
            phoneVerified: user.phoneVerified || user.isPhoneVerified || false,
            orders: user.orderCount || user.totalOrders || 0,
            joinedAt: user.createdAt || user.joinedAt || user.registeredAt || "—",
            lastActive: user.lastActiveAt || user.lastLoginAt || user.lastSeen || "—",
          };
        });

        setUsers(mapped);
      } catch (err) {
        console.error("Error loading users:", err);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  const normalizeRole = (r) => {
    if (!r) return "BUYER";
    const upper = String(r).toUpperCase();
    if (upper.includes("SELLER") || upper === "SHOP") return "SELLER";
    if (upper.includes("STAFF") || upper.includes("SUPPORT")) return "SUPPORT_STAFF";
    if (upper.includes("ADMIN") || upper.includes("SUPER")) return "ADMIN";
    return "BUYER";
  };

  const stats = useMemo(
    () => ({
      total: users.length,
      buyers: users.filter((u) => normalizeRole(u.role) === "BUYER").length,
      sellers: users.filter((u) => normalizeRole(u.role) === "SELLER").length,
      locked: users.filter((u) => ["LOCKED", "SUSPENDED", "BANNED"].includes(String(u.status).toUpperCase())).length,
    }),
    [users]
  );

  const shown = useMemo(() => {
    let list = users;
    if (role !== "all") list = list.filter((u) => normalizeRole(u.role) === role);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((u) =>
        [u.fullName, u.email, u.phone, u.id, u.userId].some((v) => String(v || "").toLowerCase().includes(q))
      );
    }
    return list;
  }, [users, role, query]);

  const openDetail = async (user) => {
    setDetailLoading(true);
    setDetail(user);
    try {
      const { data } = await api.get(`/admin/users/${user.id}`);
      const fullData = data?.data || data;
      if (fullData) setDetail({
        ...fullData,
        fullName: fullData.fullName || fullData.name || user.fullName,
      });
    } catch {
      // keep basic user data
    }
    setDetailLoading(false);
  };

  return (
    <div className="stf-users">
      <StaffPageHeader
        kicker="Tra cứu"
        title="Danh sách người dùng"
        subtitle="Chỉ xem thông tin user — không được tạo, xoá, đổi mật khẩu hoặc điều chỉnh reputation."
      />

      <div className="stf-users__kpis">
        <StaffKpiCard label="Tổng tài khoản" value={String(stats.total)} hint="Trên nền tảng" />
        <StaffKpiCard label="Người mua" value={String(stats.buyers)} hint="Vai trò BUYER" />
        <StaffKpiCard label="Người bán" value={String(stats.sellers)} hint="Vai trò SELLER" highlight />
        <StaffKpiCard label="Đang bị khoá" value={String(stats.locked)} hint="Tạm khoá / cấm" warn={stats.locked > 0} />
      </div>

      <div className="stf-users__toolbar">
        <div className="stf-users__filters">
          {ROLE_FILTERS.map((f) => (
            <button key={f.id} type="button" className={role === f.id ? "active" : ""} onClick={() => setRole(f.id)}>
              {f.label}
            </button>
          ))}
        </div>
        <input
          type="search"
          placeholder="Tìm tên, email, SĐT, mã user..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <p className="stf-users__empty">Đang tải...</p>
      ) : shown.length === 0 ? (
        <p className="stf-users__empty">Không có tài khoản nào khớp bộ lọc.</p>
      ) : (
        <div className="stf-users__table-wrap">
          <table className="stf-users__table">
            <thead>
              <tr>
                <th>Người dùng</th>
                <th>Liên hệ</th>
                <th>Vai trò</th>
                <th>Xác thực</th>
                <th>Đơn</th>
                <th>Hoạt động</th>
                <th>Trạng thái</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {shown.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="stf-users__user">
                      <span className="stf-users__avatar">{(user.fullName || "U").charAt(0)}</span>
                      <div>
                        <strong>{user.fullName}</strong>
                        <small>{user.id || user.userId} · Tham gia {user.joinedAt}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="stf-users__contact">
                      <span>{user.email}</span>
                      <small>{user.phone}</small>
                    </div>
                  </td>
                  <td>
                    <span className={`stf-users__role stf-users__role--${ROLE_CLASS[normalizeRole(user.role)] || "buyer"}`}>
                      {userRoleLabel[normalizeRole(user.role)] || userRoleLabel[user.role] || user.role}
                    </span>
                  </td>
                  <td>
                    <div className="stf-users__verify">
                      <span className={user.emailVerified ? "on" : "off"}>{user.emailVerified ? "✓" : "○"} Email</span>
                      <span className={user.phoneVerified ? "on" : "off"}>{user.phoneVerified ? "✓" : "○"} SĐT</span>
                    </div>
                  </td>
                  <td>{user.orders}</td>
                  <td><small>{user.lastActive}</small></td>
                  <td>
                    <span className={`stf-users__status stf-users__status--${STATUS_CLASS[user.status] || "ok"}`}>
                      {userStatusLabel[user.status] || user.status}
                    </span>
                    {user.status === "BANNED" && user.banReason && (
                      <small className="stf-users__ban-reason">{user.banReason}</small>
                    )}
                  </td>
                  <td>
                    <button type="button" className="stf-users__view" onClick={() => openDetail(user)}>
                      Chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {detail && (
        <div className="stf-users__overlay" onClick={() => setDetail(null)} role="presentation">
          <div className="stf-users__panel" onClick={(e) => e.stopPropagation()} role="dialog">
            <header>
              <h3>{detail.fullName}</h3>
              <button type="button" onClick={() => setDetail(null)}>✕</button>
            </header>
            {detailLoading ? (
              <p className="stf-users__empty">Đang tải chi tiết...</p>
            ) : (
              <dl>
                <dt>Mã user</dt><dd><code>{detail.id}</code></dd>
                <dt>Email</dt><dd>{detail.email}</dd>
                <dt>SĐT</dt><dd>{detail.phone}</dd>
                <dt>Vai trò</dt><dd>{userRoleLabel[detail.role] || detail.role}</dd>
                <dt>Trạng thái</dt><dd>{userStatusLabel[detail.status] || detail.status}</dd>
                <dt>Reputation</dt><dd>{detail.reputation ?? "—"} <small>(chỉ xem)</small></dd>
                <dt>Đơn hàng</dt><dd>{detail.orders}</dd>
                <dt>Thắng đấu giá</dt><dd>{detail.auctionWins ?? 0}</dd>
                <dt>Tham gia</dt><dd>{detail.joinedAt}</dd>
                <dt>Hoạt động cuối</dt><dd>{detail.lastActive}</dd>
                {detail.banReason && (<><dt>Lý do cấm</dt><dd>{detail.banReason}</dd></>)}
              </dl>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffUsers;
