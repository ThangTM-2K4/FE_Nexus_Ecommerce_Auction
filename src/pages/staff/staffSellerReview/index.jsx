import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import StaffPageHeader from "../../../components/staff/staffPageHeader";
import StaffKpiCard from "../../../components/staff/staffKpiCard";
import RejectReasonModal from "../../../components/staff/rejectReasonModal";
import ImageLightbox from "../../../components/common/imageLightbox";
import { sellerRejectReasons } from "../../../data/staffMockData";
import { getApiErrorMessage } from "../../../utils/apiResponse";
import {
  getAdminSellers,
  approveAdminSeller,
  rejectAdminSeller,
} from "../../../services/adminSellerService";
import "./index.scss";

const STATUS_LABEL = {
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Đã từ chối",
  Pending: "Chờ duyệt",
  Approved: "Đã duyệt",
  Rejected: "Đã từ chối",
};

const STATUS_CLASS = {
  PENDING: "status-pending",
  APPROVED: "status-approved",
  REJECTED: "status-rejected",
  Pending: "status-pending",
  Approved: "status-approved",
  Rejected: "status-rejected",
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
      // Sử dụng API thật từ adminSellerService - cùng API với admin
      const data = await getAdminSellers({ page: 1, pageSize: 100 });
      setApplications(data?.items || []);
    } catch (err) {
      console.error("Error loading seller applications:", err);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const normalizeStatus = (s) => {
    if (!s) return "PENDING";
    const upper = String(s).toUpperCase();
    if (["APPROVED", "ACTIVE"].includes(upper)) return "APPROVED";
    if (["REJECTED", "DECLINED"].includes(upper)) return "REJECTED";
    return "PENDING";
  };

  const counts = useMemo(
    () => ({
      PENDING: applications.filter((a) => normalizeStatus(a.apiStatus || a.status) === "PENDING").length,
      APPROVED: applications.filter((a) => normalizeStatus(a.apiStatus || a.status) === "APPROVED").length,
      REJECTED: applications.filter((a) => normalizeStatus(a.apiStatus || a.status) === "REJECTED").length,
      ALL: applications.length,
    }),
    [applications]
  );

  const shown = useMemo(
    () => {
      if (tab === "ALL") return applications;
      return applications.filter((a) => normalizeStatus(a.apiStatus || a.status) === tab);
    },
    [applications, tab]
  );

  const handleApprove = async (app) => {
    setProcessingId(app.id);
    try {
      await approveAdminSeller(app.id);
      toast.success("Đã duyệt đơn — người bán & CCCD được xác minh");
      await loadApplications();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Không thể duyệt đơn"));
    } finally {
      setProcessingId(null);
    }
  };

  const handleConfirmReject = async (reason, note) => {
    if (!rejectTarget) return;
    const fullReason = note ? `${reason} — ${note}` : reason;
    setProcessingId(rejectTarget.id);
    try {
      await rejectAdminSeller(rejectTarget.id, fullReason);
      toast.info("Đã từ chối đơn đăng ký người bán");
      setRejectTarget(null);
      await loadApplications();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Không thể từ chối đơn"));
    } finally {
      setProcessingId(null);
    }
  };

  // Ảnh xem được (JPG/PNG...) mở trong lightbox; PDF mở tab mới.
  const isViewableImage = (url) =>
    typeof url === "string" && /^(data:image|https?:.*\.(png|jpe?g|webp|gif)(\?|#|$))/i.test(url);
  const isLicenseAttached = (app) =>
    typeof app.businessLicense === "string" && /^data:|^https?:/.test(app.businessLicense);

  const openImages = (app, startIndex) => {
    const images = [];
    if (app.frontImageUrl) images.push({ src: app.frontImageUrl, caption: "CCCD mặt trước" });
    if (app.backImageUrl) images.push({ src: app.backImageUrl, caption: "CCCD mặt sau" });
    if (isViewableImage(app.businessLicense)) {
      images.push({ src: app.businessLicense, caption: "Giấy phép kinh doanh" });
    }
    if (images.length) setLightbox({ images, index: startIndex });
  };

  const openLicense = (app) => {
    if (isViewableImage(app.businessLicense)) {
      const idx = (app.frontImageUrl ? 1 : 0) + (app.backImageUrl ? 1 : 0);
      openImages(app, idx);
    } else {
      window.open(app.businessLicense, "_blank", "noopener,noreferrer");
    }
  };

  const hasImages = (app) => Boolean(app.identityFrontImageUrl || app.frontImageUrl || app.identityBackImageUrl || app.backImageUrl);

  const getStatus = (app) => normalizeStatus(app.apiStatus || app.status);

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
            const status = getStatus(app);
            const cccdVerified = status === "APPROVED";
            return (
              <article key={app.id} className="stf-seller-review__card">
                <header>
                  <div>
                    <h3>{app.businessName || app.owner || app.fullName || "Người bán"}</h3>
                    <p>{app.sellerTypeLabel || app.sellerType || app.category || "—"} · {app.subtitle || app.name || "—"}</p>
                  </div>
                  <span className={`stf-seller-review__status ${STATUS_CLASS[status] || ""}`}>
                    {STATUS_LABEL[status] || app.status}
                  </span>
                </header>

                <div className="stf-seller-review__grid">
                  {/* Cột trái: thông tin cửa hàng & liên hệ */}
                  <section className="stf-seller-review__col">
                    <h4>Thông tin cửa hàng</h4>
                    <dl>
                      <div><dt>Email</dt><dd>{app.email || "—"}</dd></div>
                      <div><dt>Số điện thoại</dt><dd>{app.phone || app.phoneNumber || "—"}</dd></div>
                      <div><dt>Loại hình</dt><dd>{app.sellerTypeLabel || app.sellerType || "—"}</dd></div>
                      <div><dt>Mã số thuế</dt><dd>{app.taxCode || "—"}</dd></div>
                      <div><dt>Địa chỉ lấy hàng</dt><dd>{app.address || app.pickupAddress || "—"}</dd></div>
                      <div><dt>Ngân hàng</dt><dd>{app.bankName || "—"} {app.bankAccountNumber ? `· ${app.bankAccountNumber}` : ""}<br/>{app.bankAccountHolder || app.accountHolder || ""}</dd></div>
                      <div><dt>Ngày nộp</dt><dd>{app.submittedAt || "—"}</dd></div>
                      <div><dt>Mã đơn</dt><dd>{app.id}</dd></div>
                    </dl>
                  </section>

                  {/* Cột phải: XÁC MINH CCCD */}
                  <section className="stf-seller-review__col stf-seller-review__identity">
                    <h4>
                      Xác minh CCCD
                      <span className={`stf-seller-review__idbadge ${cccdVerified ? "verified" : "pending"}`}>
                        {cccdVerified ? "✓ Đã xác minh" : "Chờ xác minh"}
                      </span>
                    </h4>
                    <dl>
                      <div><dt>Số CCCD</dt><dd>{app.identityNumber || app.cccd || "—"}</dd></div>
                      <div><dt>Địa chỉ</dt><dd>{app.cccdAddress || "—"}</dd></div>
                    </dl>

                    {hasImages(app) ? (
                      <div className="stf-seller-review__imgs">
                        {(app.identityFrontImageUrl || app.frontImageUrl) && (
                          <button type="button" onClick={() => openImages(app, 0)}>
                            <img src={app.identityFrontImageUrl || app.frontImageUrl} alt="CCCD mặt trước" />
                            <span>CCCD mặt trước 🔍</span>
                          </button>
                        )}
                        {(app.identityBackImageUrl || app.backImageUrl) && (
                          <button type="button" onClick={() => openImages(app, 1)}>
                            <img src={app.identityBackImageUrl || app.backImageUrl} alt="CCCD mặt sau" />
                            <span>CCCD mặt sau 🔍</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      <p className="stf-seller-review__no-img">Chưa có ảnh CCCD đính kèm.</p>
                    )}

                    <div className="stf-seller-review__license">
                      <strong>Giấy phép kinh doanh:</strong>
                      {app.businessLicenseUrl || app.businessLicense ? (
                        <button
                          type="button"
                          className="stf-seller-review__license-btn"
                          onClick={() => {
                            const url = app.businessLicenseUrl || app.businessLicense;
                            window.open(url, "_blank", "noopener,noreferrer");
                          }}
                        >
                          <span className="stf-seller-review__license-file">📄</span>
                          <span>Xem giấy phép kinh doanh 🔍</span>
                        </button>
                      ) : (
                        <span className="stf-seller-review__no-img">
                          Chưa có tệp đính kèm.
                        </span>
                      )}
                    </div>
                  </section>
                </div>

                {(status === "REJECTED" && (app.rejectReason || app.rejectionReason)) && (
                  <div className="stf-seller-review__reject-box">
                    {app.rejectReason && <p><strong>Lý do từ chối:</strong> {app.rejectReason}</p>}
                    {app.rejectionReason && <p><strong>Lý do từ chối:</strong> {app.rejectionReason}</p>}
                  </div>
                )}

                {status === "PENDING" && (
                  <footer>
                    <button
                      type="button"
                      className="reject"
                      disabled={processingId === app.id}
                      onClick={() => setRejectTarget(app)}
                    >
                      Từ chối
                    </button>
                    <button
                      type="button"
                      className="approve"
                      disabled={processingId === app.id}
                      onClick={() => handleApprove(app)}
                    >
                      {processingId === app.id ? "Đang xử lý..." : "Phê duyệt & xác minh CCCD"}
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
        targetLabel={rejectTarget ? `${rejectTarget.businessName || rejectTarget.owner || "Người bán"}` : ""}
        reasons={sellerRejectReasons}
        processing={processingId === rejectTarget?.id}
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
