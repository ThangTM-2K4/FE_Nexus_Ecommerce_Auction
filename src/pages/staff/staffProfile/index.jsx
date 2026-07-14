import { FaEnvelope, FaPhone, FaShieldAlt, FaIdBadge, FaClock } from "react-icons/fa";
import StaffPageHeader from "../../../components/staff/staffPageHeader";
import { useAuth } from "../../../context/AuthContext";
import { getRoleTokens } from "../../../config/ProtectedRoute";
import "./index.scss";

const ROLE_LABEL = {
  STAFF: "Nhân viên quản lý",
  ADMIN: "Quản trị viên",
};

// Quyền hạn hiển thị theo các mục trong Kênh Quản Lý (staff hub).
const PERMISSIONS = [
  "Duyệt hồ sơ người bán",
  "Duyệt sản phẩm đăng bán",
  "Kiểm duyệt phiên đấu giá",
  "Xử lý khiếu nại & tranh chấp",
  "Giám sát đơn hàng",
  "Xử lý báo cáo vi phạm",
];

const StaffProfile = () => {
  const { user } = useAuth();

  const fullName = user?.fullName || "Nhân viên";
  const initials = fullName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const roleToken = getRoleTokens(user).find((t) => ROLE_LABEL[t]) || "STAFF";
  const roleLabel = ROLE_LABEL[roleToken] || "Nhân viên vận hành";

  const infoRows = [
    { icon: FaEnvelope, label: "Email", value: user?.email || "—" },
    { icon: FaPhone, label: "Số điện thoại", value: user?.phone || "Chưa cập nhật" },
    { icon: FaShieldAlt, label: "Vai trò", value: roleLabel },
    { icon: FaIdBadge, label: "Mã nhân viên", value: user?.id ? `NV-${user.id}` : "—" },
    { icon: FaClock, label: "Trạng thái", value: "Đang hoạt động" },
  ];

  return (
    <div className="stf-profile">
      <StaffPageHeader
        kicker="Tài khoản"
        title="Hồ sơ của tôi"
        subtitle="Thông tin tài khoản nhân viên và phạm vi quyền hạn trong Kênh Quản Lý."
      />

      <section className="stf-profile__card">
        <div className="stf-profile__avatar">{initials || "ST"}</div>
        <div className="stf-profile__identity">
          <h2>{fullName}</h2>
          <span className="stf-profile__role">{roleLabel}</span>
          <p>{user?.email}</p>
        </div>
      </section>

      <section className="stf-profile__grid">
        <div className="stf-profile__info">
          <h3>Thông tin tài khoản</h3>
          <ul>
            {infoRows.map(({ icon: Icon, label, value }) => (
              <li key={label}>
                <span className="stf-profile__info-icon">
                  <Icon />
                </span>
                <span className="stf-profile__info-label">{label}</span>
                <span className="stf-profile__info-value">{value}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="stf-profile__perms">
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

export default StaffProfile;
