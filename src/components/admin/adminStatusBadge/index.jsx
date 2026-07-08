import "./index.scss";

const STATUS_STYLES = {
  active: "success",
  hoạt_động: "success",
  completed: "success",
  hoàn_thành: "success",
  approved: "success",
  đã_duyệt: "success",
  resolved: "success",
  đã_xử_lý: "success",
  paid: "success",
  đã_thanh_toán: "success",
  delivered: "success",
  đã_giao: "success",
  open: "info",
  đang_mở: "info",
  live: "info",
  đang_diễn_ra: "info",
  pending: "warning",
  chờ_duyệt: "warning",
  chờ_xử_lý: "warning",
  processing: "warning",
  đang_xử_lý: "warning",
  ending: "warning",
  sắp_kết_thúc: "warning",
  locked: "danger",
  đã_khóa: "danger",
  rejected: "danger",
  từ_chối: "danger",
  banned: "danger",
  bị_cấm: "danger",
  cancelled: "danger",
  đã_hủy: "danger",
  hidden: "muted",
  ẩn: "muted",
  suspended: "danger",
  tạm_khóa: "danger",
  hold: "warning",
  tạm_giữ: "warning",
  closed: "muted",
  đã_đóng: "muted",
  out_of_stock: "danger",
  hết_hàng: "danger",
  low_stock: "warning",
  sắp_hết: "warning",
  high: "danger",
  cao: "danger",
  medium: "warning",
  trung_bình: "warning",
  low: "info",
  thành_công: "success",
  nghi_ngờ: "danger",
  bình_thường: "success",
  hiển_thị: "success",
  đã_gửi: "success",
  nháp: "muted",
  hết_hạn: "muted",
  đã_dừng: "danger",
  yêu_cầu_cập_nhật: "warning",
  đủ_hàng: "success",
  thấp: "info",
};

const AdminStatusBadge = ({ status }) => {
  const key = String(status || "")
    .toLowerCase()
    .replace(/\s+/g, "_");
  const variant = STATUS_STYLES[key] || "muted";

  return <span className={`adm-badge adm-badge--${variant}`}>{status}</span>;
};

export default AdminStatusBadge;
