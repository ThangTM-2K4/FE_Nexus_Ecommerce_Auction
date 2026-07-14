import { useEffect, useMemo, useState } from "react";
import StaffPageHeader from "../../../components/staff/staffPageHeader";
import StaffKpiCard from "../../../components/staff/staffKpiCard";
import { getPlatformUsers, getPlatformUserDetail } from "../../../services/staffService";
import { userRoleLabel, userStatusLabel } from "../../../data/staffDirectoryData";
import "./index.scss";

const STATUS_CLASS = { ACTIVE: "ok", SUSPENDED: "suspended", BANNED: "banned" };
const ROLE_CLASS = { BUYER: "buyer", SELLER: "seller", SUPPORT_STAFF: "staff", ADMIN: "admin" };

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
    getPlatformUsers().then((data) => {
      setUsers(data);
      setLoading(false);
    });
  }, []);

  const stats = useMemo(
    () => ({
      total: users.length,
      buyers: users.filter((u) => u.role === "BUYER").length,
      sellers: users.filter((u) => u.role === "SELLER").length,
      locked: users.filter((u) => u.status !== "ACTIVE").length,
    }),
    [users]
  );

  const shown = useMemo(() => {
    let list = users;
    if (role !== "all") list = list.filter((u) => u.role === role);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((u) =>
        [u.fullName, u.email, u.phone, u.id].some((v) => String(v).toLowerCase().includes(q))
      );
    }
    return list;
  }, [users, role, query]);

  const openDetail = async (user) => {
    setDetailLoading(true);
    setDetail(user);
    const full = await getPlatformUserDetail(user.id);
    if (full) setDetail(full);
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
                      <span className="stf-users__avatar">{user.fullName.charAt(0)}</span>
                      <div>
                        <strong>{user.fullName}</strong>
                        <small>{user.id} · Tham gia {user.joinedAt}</small>
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
                    <span className={`stf-users__role stf-users__role--${ROLE_CLASS[user.role]}`}>
                      {userRoleLabel[user.role] || user.role}
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
                    <span className={`stf-users__status stf-users__status--${STATUS_CLASS[user.status]}`}>
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
