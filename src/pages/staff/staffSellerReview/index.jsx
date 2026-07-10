import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import StaffPageHeader from "../../../components/staff/staffPageHeader";
import RejectReasonModal from "../../../components/staff/rejectReasonModal";
import { sellerRejectReasons } from "../../../data/staffMockData";
import {
  getPendingSellerApplications,
  approveSellerApplication,
  rejectSellerApplication,
} from "../../../services/staffService";
import "./index.scss";

const STATUS_LABEL = {
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Đã từ chối',
};

const STATUS_CLASS = {
  PENDING: 'status-pending',
  APPROVED: 'status-approved',
  REJECTED: 'status-rejected',
};

const StaffSellerReview = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);

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

  const handleApprove = async (app) => {
    setProcessingId(app.applicationId);
    try {
      await approveSellerApplication(app);
      toast.success("Đã duyệt đơn đăng ký người bán");
      await loadApplications();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Không thể duyệt đơn");
    } finally {
      setProcessingId(null);
    }
  };

  const handleConfirmReject = async (reason, note) => {
    if (!rejectTarget) return;
    setProcessingId(rejectTarget.applicationId);
    try {
      await rejectSellerApplication(rejectTarget, reason, note);
      toast.info("Đã từ chối đơn đăng ký người bán");
      setRejectTarget(null);
      await loadApplications();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Không thể từ chối đơn");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="stf-seller-review">
      <StaffPageHeader
        kicker="Duyệt người bán"
        title="Hồ sơ đăng ký người bán"
        subtitle="Kiểm tra thông tin, tài liệu và phê duyệt hoặc từ chối đơn đăng ký."
      />

      {loading ? (
        <p className="stf-seller-review__empty">Đang tải danh sách...</p>
      ) : applications.length === 0 ? (
        <p className="stf-seller-review__empty">Không có đơn nào.</p>
      ) : (
        <div className="stf-seller-review__list">
          {applications.map((app) => (
            <article key={app.applicationId} className="stf-seller-review__card">
              <header>
                <div>
                  <h3>{app.fullName}</h3>
                  <p>{app.shopName} · {app.category}</p>
                </div>
                <span className={`stf-seller-review__status ${STATUS_CLASS[app.status] || ''}`}>
                  {STATUS_LABEL[app.status] || app.status}
                </span>
              </header>

              <dl>
                <div><dt>Email</dt><dd>{app.email}</dd></div>
                <div><dt>Số điện thoại</dt><dd>{app.phone}</dd></div>
                <div><dt>Số CCCD</dt><dd>{app.cccdNumber}</dd></div>
                <div><dt>Địa chỉ CCCD</dt><dd>{app.cccdAddress}</dd></div>
                <div><dt>Loại hình</dt><dd>{app.category}</dd></div>
                <div><dt>Mã số thuế</dt><dd>{app.taxCode}</dd></div>
                <div><dt>Địa chỉ lấy hàng</dt><dd>{app.pickupAddress}</dd></div>
                <div><dt>Ngân hàng</dt><dd>{app.bankName} · {app.accountNumber} · {app.accountHolder}</dd></div>
                <div><dt>Ngày nộp đơn</dt><dd>{app.submittedAt}</dd></div>
                {app.reviewedAt && app.reviewedAt !== '—' && (
                  <div><dt>Ngày xử lý</dt><dd>{app.reviewedAt}</dd></div>
                )}
                <div><dt>Mã đơn</dt><dd>{app.applicationId}</dd></div>
                {app.status === 'REJECTED' && app.rejectionReason && (
                  <div><dt>Lý do từ chối</dt><dd>{app.rejectionReason}</dd></div>
                )}
                {app.status === 'REJECTED' && app.adminNote && (
                  <div><dt>Ghi chú</dt><dd>{app.adminNote}</dd></div>
                )}
              </dl>

              <div className="stf-seller-review__docs">
                <strong>Tài liệu đính kèm:</strong>
                <ul>
                  {app.documents.map((doc) => (
                    <li key={doc}>{doc}</li>
                  ))}
                </ul>
                {(app.frontImageUrl || app.backImageUrl) && (
                  <div className="stf-seller-review__imgs">
                    {app.frontImageUrl && (
                      <a href={app.frontImageUrl} target="_blank" rel="noreferrer">
                        <img src={app.frontImageUrl} alt="CCCD mặt trước" />
                        <span>CCCD mặt trước</span>
                      </a>
                    )}
                    {app.backImageUrl && (
                      <a href={app.backImageUrl} target="_blank" rel="noreferrer">
                        <img src={app.backImageUrl} alt="CCCD mặt sau" />
                        <span>CCCD mặt sau</span>
                      </a>
                    )}
                  </div>
                )}
              </div>

              {app.status === 'PENDING' && (
                <footer>
                  <button
                    type="button"
                    className="reject"
                    disabled={processingId === app.applicationId}
                    onClick={() => setRejectTarget(app)}
                  >
                    Từ chối
                  </button>
                  <button
                    type="button"
                    className="approve"
                    disabled={processingId === app.applicationId}
                    onClick={() => handleApprove(app)}
                  >
                    {processingId === app.applicationId ? "Đang xử lý..." : "Phê duyệt"}
                  </button>
                </footer>
              )}
            </article>
          ))}
        </div>
      )}

      <RejectReasonModal
        open={Boolean(rejectTarget)}
        title="Từ chối đơn đăng ký người bán"
        subtitle="Chọn lý do từ chối. Người dùng sẽ thấy lý do này và có thể nộp lại hồ sơ."
        targetLabel={rejectTarget ? `${rejectTarget.fullName} · ${rejectTarget.shopName}` : ""}
        reasons={sellerRejectReasons}
        processing={processingId === rejectTarget?.applicationId}
        onClose={() => setRejectTarget(null)}
        onConfirm={handleConfirmReject}
      />
    </div>
  );
};

export default StaffSellerReview;
