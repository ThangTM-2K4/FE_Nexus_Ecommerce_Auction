import { FaEnvelope, FaPhone, FaShieldAlt, FaIdBadge, FaClock, FaLock } from "react-icons/fa";
import AdminPageHeader from "../../../components/admin/adminPageHeader";
import { useAuth } from "../../../context/AuthContext";
import { getRoleTokens } from "../../../config/ProtectedRoute";
import "./index.scss";

const ROLE_LABEL = {
  ADMIN: "Quản trị viên",
  SUPER_ADMIN: "Quản trị viên cấp cao",
};

// Quyền hạn đặc thù của Admin — toàn quyền hệ thống
const PERMISSIONS = [
  "Quản lý toàn bộ người dùng & phân quyền",
  "Duyệt & từ chối hồ sơ người bán",
  "Quản lý sản phẩm, danh mục & thương hiệu",
  "Giám sát phiên đấu giá & giao dịch",
  "Xử lý khiếu nại, tranh chấp & báo cáo vi phạm",
  "Quản lý thanh toán, ví & hoa hồng",
  "Xem nhật ký kiểm toán & phát hiện gian lận",
  "Cấu hình hệ thống & nội dung nền tảng",
];

const AdminProfile = () => {
  const { user } = useAuth();

  const fullName = user?.fullName || "Admin";
  const initials = fullName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const roleToken =
    getRoleTokens(user).find((t) => ROLE_LABEL[t]) || "ADMIN";
  const roleLabel = ROLE_LABEL[roleToken] || "Quản trị viên";

  const infoRows = [
    { icon: FaEnvelope, label: "Email", value: user?.email || "—" },
    { icon: FaPhone, label: "Số điện thoại", value: user?.phone || "Chưa cập nhật" },
    { icon: FaShieldAlt, label: "Vai trò", value: roleLabel },
    { icon: FaIdBadge, label: "Mã admin", value: user?.id ? `ADM-${user.id}` : "—" },
    { icon: FaClock, label: "Trạng thái", value: "Đang hoạt động" },
    { icon: FaLock, label: "Cấp truy cập", value: "Toàn quyền hệ thống" },
  ];

  return (
    <div className="adm-profile">
      <AdminPageHeader
        kicker="Tài khoản"
        title="Hồ sơ Admin"
        subtitle="Thông tin tài khoản quản trị và phạm vi quyền hạn trên toàn hệ thống."
      />

      <section className="adm-profile__card">
        <div className="adm-profile__avatar">{initials}</div>
        <div className="adm-profile__identity">
          <h2>{fullName}</h2>
          <span className="adm-profile__role">{roleLabel}</span>
          <p>{user?.email}</p>
        </div>
      </section>

      <section className="adm-profile__grid">
        <div className="adm-profile__info">
          <h3>Thông tin tài khoản</h3>
          <ul>
            {infoRows.map(({ icon: Icon, label, value }) => (
              <li key={label}>
                <span className="adm-profile__info-icon">
                  <Icon />
                </span>
                <span className="adm-profile__info-label">{label}</span>
                <span className="adm-profile__info-value">{value}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="adm-profile__perms">
          <h3>Phạm vi quyền hạn</h3>
          <ul>
            {PERMISSIONS.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
};

export default AdminProfile;
