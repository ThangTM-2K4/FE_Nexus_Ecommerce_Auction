import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import StaffPageHeader from "../../../components/staff/staffPageHeader";
import {
  getPendingSellerApplications,
  approveSellerApplication,
  rejectSellerApplication,
} from "../../../services/staffService";
import "./index.scss";

const StaffSellerReview = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const data = await getPendingSellerApplications();
      setApplications(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const handleApprove = async (userId) => {
    setProcessingId(userId);
    try {
      await approveSellerApplication(userId);
      toast.success("Đã duyệt đơn đăng ký seller");
      await loadApplications();
    } catch (err) {
      toast.error(err.message || "Không thể duyệt đơn");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (userId) => {
    setProcessingId(userId);
    try {
      await rejectSellerApplication(
        userId,
        "Tài liệu không đạt yêu cầu",
        "Vui lòng tải lại ảnh CMND/CCCD rõ nét."
      );
      toast.info("Đã từ chối đơn đăng ký seller");
      await loadApplications();
    } catch (err) {
      toast.error(err.message || "Không thể từ chối đơn");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="stf-seller-review">
      <StaffPageHeader
        kicker="Duyệt người bán"
        title="Hồ sơ đăng ký Seller"
        subtitle="Kiểm tra thông tin, tài liệu và phê duyệt hoặc từ chối đơn đăng ký."
      />

      {loading ? (
        <p className="stf-seller-review__empty">Đang tải danh sách...</p>
      ) : applications.length === 0 ? (
        <p className="stf-seller-review__empty">Không có đơn nào chờ duyệt.</p>
      ) : (
        <div className="stf-seller-review__list">
          {applications.map((app) => (
            <article key={app.applicationId} className="stf-seller-review__card">
              <header>
                <div>
                  <h3>{app.fullName}</h3>
                  <p>{app.shopName} · {app.category}</p>
                </div>
                <span className="stf-seller-review__status">{app.status}</span>
              </header>

              <dl>
                <div>
                  <dt>Email</dt>
                  <dd>{app.email}</dd>
                </div>
                <div>
                  <dt>Số điện thoại</dt>
                  <dd>{app.phone}</dd>
                </div>
                <div>
                  <dt>Ngày gửi</dt>
                  <dd>{app.submittedAt}</dd>
                </div>
                <div>
                  <dt>Mã đơn</dt>
                  <dd>{app.applicationId}</dd>
                </div>
              </dl>

              <div className="stf-seller-review__docs">
                <strong>Tài liệu đính kèm:</strong>
                <ul>
                  {app.documents.map((doc) => (
                    <li key={doc}>{doc}</li>
                  ))}
                </ul>
              </div>

              <footer>
                <button
                  type="button"
                  className="reject"
                  disabled={processingId === app.userId}
                  onClick={() => handleReject(app.userId)}
                >
                  Từ chối
                </button>
                <button
                  type="button"
                  className="approve"
                  disabled={processingId === app.userId}
                  onClick={() => handleApprove(app.userId)}
                >
                  {processingId === app.userId ? "Đang xử lý..." : "Phê duyệt"}
                </button>
              </footer>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default StaffSellerReview;
