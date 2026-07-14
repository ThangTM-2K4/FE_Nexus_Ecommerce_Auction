import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import StaffPageHeader from "../../../components/staff/staffPageHeader";
import StaffKpiCard from "../../../components/staff/staffKpiCard";
import RejectReasonModal from "../../../components/staff/rejectReasonModal";
import ImageLightbox from "../../../components/common/imageLightbox";
import { sellerRejectReasons } from "../../../data/staffMockData";
import {
  getPendingSellerApplications,
  approveSellerApplication,
  rejectSellerApplication,
} from "../../../services/staffService";
import "./index.scss";

const STATUS_LABEL = {
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Đã từ chối",
};

const STATUS_CLASS = {
  PENDING: "status-pending",
  APPROVED: "status-approved",
  REJECTED: "status-rejected",
};

const TABS = [
  { id: "PENDING", label: "Chờ duyệt" },
  { id: "APPROVED", label: "Đã duyệt" },
  { id: "REJECTED", label: "Đã từ chối" },
  { id: "ALL", label: "Tất cả" },
];

const StaffSellerReview = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [tab, setTab] = useState("PENDING");
  const [lightbox, setLightbox] = useState(null); // { images, index }

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

  const counts = useMemo(
    () => ({
      PENDING: applications.filter((a) => a.status === "PENDING").length,
      APPROVED: applications.filter((a) => a.status === "APPROVED").length,
      REJECTED: applications.filter((a) => a.status === "REJECTED").length,
      ALL: applications.length,
    }),
    [applications]
  );

  const shown = useMemo(
    () => (tab === "ALL" ? applications : applications.filter((a) => a.status === tab)),
    [applications, tab]
  );

  const handleApprove = async (app) => {
    setProcessingId(app.applicationId);
    try {
      await approveSellerApplication(app);
      toast.success("Đã duyệt đơn — người bán & CCCD được xác minh");
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

  const openImages = (app, startIndex) => {
    const images = [];
    if (app.frontImageUrl) images.push({ src: app.frontImageUrl, caption: "CCCD mặt trước" });
    if (app.backImageUrl) images.push({ src: app.backImageUrl, caption: "CCCD mặt sau" });
    if (app.businessLicense && /^data:|^https?:/.test(app.businessLicense)) {
      images.push({ src: app.businessLicense, caption: "Giấy phép kinh doanh" });
    }
    if (images.length) setLightbox({ images, index: startIndex });
  };

  const hasImages = (app) => Boolean(app.frontImageUrl || app.backImageUrl);

  return (
    <div className="stf-seller-review">
      <StaffPageHeader
        kicker="Duyệt người bán"
        title="Hồ sơ đăng ký người bán"
        subtitle="Kiểm tra hồ sơ, xác minh CCCD và phê duyệt hoặc từ chối đơn đăng ký. Duyệt đơn đồng nghĩa xác minh danh tính người bán."
      />

      <div className="stf-seller-review__kpis">
        <StaffKpiCard label="Chờ duyệt" value={String(counts.PENDING)} hint="Cần xử lý" warn={counts.PENDING > 0} />
        <StaffKpiCard label="Đã duyệt" value={String(counts.APPROVED)} hint="Người bán đang hoạt động" highlight />
        <StaffKpiCard label="Đã từ chối" value={String(counts.REJECTED)} hint="Có thể nộp lại" />
        <StaffKpiCard label="Tổng hồ sơ" value={String(counts.ALL)} hint="Toàn bộ đơn" />
      </div>

      <div className="stf-seller-review__tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={tab === t.id ? "active" : ""}
            onClick={() => setTab(t.id)}
          >
            {t.label} ({counts[t.id]})
          </button>
        ))}
      </div>

      {loading ? (
        <p className="stf-seller-review__empty">Đang tải danh sách...</p>
      ) : shown.length === 0 ? (
        <p className="stf-seller-review__empty">Không có đơn nào ở mục này.</p>
      ) : (
        <div className="stf-seller-review__list">
          {shown.map((app) => {
            const cccdVerified = app.status === "APPROVED";
            return (
              <article key={app.applicationId} className="stf-seller-review__card">
                <header>
                  <div>
                    <h3>{app.fullName}</h3>
                    <p>{app.shopName} · {app.category}</p>
                  </div>
                  <span className={`stf-seller-review__status ${STATUS_CLASS[app.status] || ""}`}>
                    {STATUS_LABEL[app.status] || app.status}
                  </span>
                </header>

                <div className="stf-seller-review__grid">
                  {/* Cột trái: thông tin cửa hàng & liên hệ */}
                  <section className="stf-seller-review__col">
                    <h4>Thông tin cửa hàng</h4>
                    <dl>
                      <div><dt>Email</dt><dd>{app.email}</dd></div>
                      <div><dt>Số điện thoại</dt><dd>{app.phone}</dd></div>
                      <div><dt>Loại hình</dt><dd>{app.category}</dd></div>
                      <div><dt>Mã số thuế</dt><dd>{app.taxCode}</dd></div>
                      <div><dt>Địa chỉ lấy hàng</dt><dd>{app.pickupAddress}</dd></div>
                      <div><dt>Ngân hàng</dt><dd>{app.bankName} · {app.accountNumber}<br/>{app.accountHolder}</dd></div>
                      <div><dt>Ngày nộp</dt><dd>{app.submittedAt}</dd></div>
                      <div><dt>Mã đơn</dt><dd>{app.applicationId}</dd></div>
                    </dl>
                  </section>

                  {/* Cột phải: XÁC MINH CCCD (gộp từ trang xác minh cũ) */}
                  <section className="stf-seller-review__col stf-seller-review__identity">
                    <h4>
                      Xác minh CCCD
                      <span className={`stf-seller-review__idbadge ${cccdVerified ? "verified" : "pending"}`}>
                        {cccdVerified ? "✓ Đã xác minh" : "Chờ xác minh"}
                      </span>
                    </h4>
                    <dl>
                      <div><dt>Họ tên trên CCCD</dt><dd>{app.fullName}</dd></div>
                      <div><dt>Số CCCD</dt><dd>{app.cccdNumber}</dd></div>
                      <div><dt>Địa chỉ thường trú</dt><dd>{app.cccdAddress}</dd></div>
                    </dl>

                    {hasImages(app) ? (
                      <div className="stf-seller-review__imgs">
                        {app.frontImageUrl && (
                          <button type="button" onClick={() => openImages(app, 0)}>
                            <img src={app.frontImageUrl} alt="CCCD mặt trước" />
                            <span>CCCD mặt trước 🔍</span>
                          </button>
                        )}
                        {app.backImageUrl && (
                          <button type="button" onClick={() => openImages(app, app.frontImageUrl ? 1 : 0)}>
                            <img src={app.backImageUrl} alt="CCCD mặt sau" />
                            <span>CCCD mặt sau 🔍</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      <p className="stf-seller-review__no-img">Chưa có ảnh CCCD đính kèm (hồ sơ nộp qua API).</p>
                    )}

                    <div className="stf-seller-review__docs">
                      <strong>Tài liệu:</strong>
                      <ul>
                        {app.documents.map((doc) => (
                          <li key={doc}>{doc}</li>
                        ))}
                      </ul>
                    </div>
                  </section>
                </div>

                {(app.status === "REJECTED" && (app.rejectionReason || app.adminNote)) && (
                  <div className="stf-seller-review__reject-box">
                    {app.rejectionReason && <p><strong>Lý do từ chối:</strong> {app.rejectionReason}</p>}
                    {app.adminNote && <p><strong>Ghi chú:</strong> {app.adminNote}</p>}
                  </div>
                )}

                {app.status === "PENDING" && (
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
                      {processingId === app.applicationId ? "Đang xử lý..." : "Phê duyệt & xác minh CCCD"}
                    </button>
                  </footer>
                )}
              </article>
            );
          })}
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

      {lightbox && (
        <ImageLightbox
          images={lightbox.images}
          index={lightbox.index}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
};

export default StaffSellerReview;
