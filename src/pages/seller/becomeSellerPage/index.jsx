import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../../context/AuthContext";
import * as profileService from "../../../services/profileService";
import * as sellerService from "../../../services/sellerService";
import Header from "../../../components/homepage/header";
import Footer from "../../../components/homepage/footer";
import SellerTermsGate from "./SellerTermsGate";
import "./index.scss";

const STEPS = ["Thông tin cửa hàng", "Tài khoản ngân hàng"];

import { resolveBankLabel } from "../../../services/bankService";
import BankSelect from "../../../components/common/bankSelect";

// Dịch các thông báo lỗi tiếng Anh thường gặp từ backend sang tiếng Việt.
const translateApiError = (msg) => {
  const m = String(msg || "").toLowerCase();
  if (m.includes("verified phone")) {
    return "Bạn cần xác thực số điện thoại trước khi đăng ký người bán. Vào Hồ sơ → Xác minh tài khoản để xác thực SĐT.";
  }
  if (m.includes("verified email")) {
    return "Bạn cần xác thực email trước khi đăng ký người bán.";
  }
  if (m.includes("already") && m.includes("seller")) {
    return "Tài khoản này đã đăng ký người bán rồi.";
  }
  return msg;
};

// Lấy thông báo lỗi từ backend ở nhiều dạng field khác nhau
const extractApiError = (err, fallback) => {
  console.error("[become-seller] submit error:", err?.response?.status, err?.response?.data, err);
  const d = err?.response?.data;
  const raw =
    (typeof d === "string" && d.trim() ? d : null) ||
    d?.message ||
    d?.error ||
    d?.detail ||
    d?.title ||
    (Array.isArray(d?.errors) ? d.errors.join(", ") : d?.errors && Object.values(d.errors).flat().join(", ")) ||
    err?.message ||
    fallback;
  return translateApiError(raw);
};

const initialForm = {
  businessType: "individual",
  shopName: "",
  taxCode: "",
  businessLicense: "",
  pickupAddress: "",
  bankName: "",
  bankNameCustom: "",
  accountNumber: "",
  accountHolder: "",
};

function FileInput({ label, name, form, setForm, required }) {
  const handleUpload = () => {
    setForm((prev) => ({
      ...prev,
      [name]: `${label} — da-tai-len.pdf`,
    }));
    toast.info(`Đã tải lên: ${label}`);
  };

  return (
    <div className="seller-field seller-field--full">
      <label className="field-label">
        {label}
        {required && <span className="required"> *</span>}
      </label>
      <button type="button" className="seller-upload-btn" onClick={handleUpload}>
        {form[name] ? "✓ Đã tải lên" : "Chọn tệp"}
      </button>
      {form[name] && <small className="seller-file-name">{form[name]}</small>}
    </div>
  );
}

export default function BecomeSellerPage() {
  const { user, refreshUser, updateUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [profile, setProfile] = useState(null);
  const [application, setApplication] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [resubmitMode, setResubmitMode] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const load = async () => {
      const [p, app] = await Promise.all([
        profileService.getProfile(user.id),
        sellerService.getSellerApplication(user.id),
      ]);
      setProfile(p);
      setApplication(app);
      // Đồng bộ trạng thái seller từ backend (sellers/me) vào session để sau khi
      // staff duyệt, seller vào thẳng được Kênh Người Bán mà không cần đăng nhập lại.
      if (app?.status && app.status !== user.sellerStatus) {
        updateUser({ sellerStatus: app.status });
      }
      setForm((prev) => ({
        ...prev,
        pickupAddress: prev.pickupAddress || p.cccdAddress || '',
        businessLicense:
          prev.businessLicense || (p.cccdFrontImageUrl ? 'Ảnh CCCD đã tải lên' : ''),
      }));
      setLoading(false);
    };
    load();
  }, [user?.id, user?.sellerStatus]);

  const checks = sellerService.checkSellerPreconditions(profile || {});
  const readyToApply = sellerService.allPreconditionsMet(profile || {});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validateStep = (s) => {
    const next = {};
    if (s === 0) {
      if (!form.shopName.trim()) next.shopName = "Vui lòng nhập tên shop / doanh nghiệp";
      if (!form.taxCode.trim()) next.taxCode = "Vui lòng nhập mã số thuế";
      if (!form.pickupAddress.trim()) next.pickupAddress = "Vui lòng nhập địa chỉ lấy hàng";
    }
    if (s === 1) {
      if (!form.bankName) next.bankName = "Vui lòng chọn ngân hàng";
      if (form.bankName === "other" && !form.bankNameCustom.trim()) {
        next.bankNameCustom = "Vui lòng nhập tên ngân hàng";
      }
      if (!form.accountNumber.trim()) next.accountNumber = "Vui lòng nhập số tài khoản";
      if (!form.accountHolder.trim()) next.accountHolder = "Vui lòng nhập tên chủ tài khoản";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  const buildPayload = () => ({
    ...form,
    bankName: form.bankName === "other" ? form.bankNameCustom : form.bankName,
    cccdFullName: profile?.cccdFullName || "",
    cccdNumber: profile?.cccdNumber || "",
    cccdAddress: profile?.cccdAddress || "",
    cccdFrontImageUrl: profile?.cccdFrontImageUrl || "",
    cccdBackImageUrl: profile?.cccdBackImageUrl || "",
    email: profile?.email || "",
    phone: profile?.phone || "",
  });

  const handleSubmit = async () => {
    if (!validateStep(1)) return;
    setSubmitting(true);
    try {
      const app = await sellerService.submitSellerApplication(user.id, buildPayload());
      refreshUser();
      setApplication(app);
      setResubmitMode(false);
      setForm(initialForm);
      toast.success("Đã gửi đơn đăng ký người bán");
      navigate("/");
    } catch (err) {
      toast.error(extractApiError(err, "Gửi đơn thất bại"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResubmit = async () => {
    if (!validateStep(1)) return;
    setSubmitting(true);
    try {
      const app = await sellerService.resubmitSellerApplication(user.id, buildPayload());
      refreshUser();
      setApplication(app);
      setResubmitMode(false);
      setForm(initialForm);
      setStep(0);
      toast.success("Đã nộp lại đơn đăng ký");
    } catch (err) {
      toast.error(extractApiError(err, "Nộp lại thất bại"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="become-seller-page">
        <Header />
        <main className="become-seller-main">
          <p className="seller-loading">Đang tải...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (user?.sellerStatus === "APPROVED") {
    return (
      <div className="become-seller-page">
        <Header />
        <main className="become-seller-main">
          <div className="seller-card seller-status-card approved">
            <img src="/images/seller/status/approved.svg" alt="" className="seller-status-illustration" />
            <h1>Bạn đã là Người bán</h1>
            <p className="description">Tài khoản của bạn đã được phê duyệt. Truy cập Kênh Người Bán để bắt đầu.</p>
            <Link to="/seller-hub/overview" className="seller-submit-btn">
              Mở Kênh Người Bán
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (user?.sellerStatus === "PENDING" && application && step === 0 && !form.shopName) {
    return (
      <div className="become-seller-page">
        <Header />
        <main className="become-seller-main">
          <div className="seller-card seller-status-card pending">
            <img src="/images/seller/status/pending.svg" alt="" className="seller-status-illustration" />
            <h1>Đơn đang chờ duyệt</h1>
            <div className="seller-status-meta">
              <div>
                <span>Mã đơn</span>
                <strong>{application.applicationId || "—"}</strong>
              </div>
              <div>
                <span>Ngày nộp</span>
                <strong>
                  {application.submittedAt
                    ? new Date(application.submittedAt).toLocaleString("vi-VN")
                    : "—"}
                </strong>
              </div>
              <div>
                <span>Trạng thái</span>
                <strong className="status-pending">Đang chờ xem xét</strong>
              </div>
            </div>
            <div className="seller-timeline">
              <h3>Tiến trình</h3>
              {application.timeline?.map((item) => (
                <div key={item.step} className={`seller-timeline-item ${item.status}`}>
                  <span className="seller-timeline-dot" />
                  <div>
                    <strong>{item.step}</strong>
                    {item.date && <small>{new Date(item.date).toLocaleString("vi-VN")}</small>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (user?.sellerStatus === "REJECTED" && application && !resubmitMode) {
    return (
      <div className="become-seller-page">
        <Header />
        <main className="become-seller-main">
          <div className="seller-card seller-status-card rejected">
            <img src="/images/seller/status/rejected.svg" alt="" className="seller-status-illustration" />
            <h1>Đơn bị từ chối</h1>
            <p><strong>Lý do:</strong> {application.rejectionReason}</p>
            <p><strong>Ghi chú của nhân viên:</strong> {application.adminNote}</p>
            <button
              type="button"
              className="seller-submit-btn"
              onClick={() => {
                setForm(initialForm);
                setResubmitMode(true);
                setStep(0);
              }}
            >
              Nộp lại đơn
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!readyToApply) {
    return (
      <div className="become-seller-page">
        <Header />
        <main className="become-seller-main">
          <div className="seller-card seller-status-card blocked">
            <img src="/images/seller/status/blocked.svg" alt="" className="seller-status-illustration" />
            <h1>Chưa đủ điều kiện</h1>
            <p className="description">Hoàn thành các bước sau trước khi đăng ký người bán:</p>
            <ul className="seller-preconditions">
              <li className={checks.emailVerified ? "done" : "pending"}>
                {checks.emailVerified ? "✓" : "○"} Xác thực email
                <small>Đã xác thực lúc tạo tài khoản</small>
              </li>
              <li className={checks.phoneVerified ? "done" : "pending"}>
                {checks.phoneVerified ? "✓" : "○"} Xác thực số điện thoại
                <small>Nhập SĐT và xác thực tại mục Xác minh tài khoản</small>
              </li>
            </ul>
            <Link to="/profile#verification" className="seller-submit-btn">
              Hoàn thiện hồ sơ
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Cổng điều khoản: người dùng phải đọc và tích đồng ý điều khoản trước khi
  // vào form đăng ký / nộp lại đơn.
  if (!agreedTerms) {
    return <SellerTermsGate onAgree={() => setAgreedTerms(true)} />;
  }

  const isIndividual = form.businessType === "individual";
  const isResubmit = user?.sellerStatus === "REJECTED" && resubmitMode;
  const resolvedBank =
    form.bankName === "other" ? form.bankNameCustom : resolveBankLabel(form.bankName);

  return (
    <div className="become-seller-page">
      <Header />
      <main className="become-seller-main">
        <div className="seller-card seller-form-card">
          <Link to="/profile" className="seller-back">← Quay lại hồ sơ</Link>

          <h1>Đăng ký Người bán</h1>
          <p className="subtitle">Hoàn thành hồ sơ để mở cửa hàng trên nền tảng</p>

          <div className="seller-stepper">
            {STEPS.map((label, i) => (
              <div
                key={label}
                className={`seller-step ${i === step ? "active" : ""} ${i < step ? "done" : ""}`}
              >
                <span className="seller-step-num">{i + 1}</span>
                <span className="seller-step-label">{label}</span>
              </div>
            ))}
          </div>

          {step === 0 && (
            <div className="seller-form-grid">
              {(profile?.cccdNumber || profile?.cccdFrontImageUrl) && (
                <div className="seller-field seller-field--full">
                  <div className="seller-cccd-carry">
                    <h3>Giấy tờ định danh (lấy từ hồ sơ của bạn)</h3>
                    <div className="seller-cccd-carry__info">
                      {profile.cccdFullName && (
                        <div><span>Họ tên trên CCCD</span><strong>{profile.cccdFullName}</strong></div>
                      )}
                      {profile.cccdNumber && (
                        <div><span>Số CCCD</span><strong>{profile.cccdNumber}</strong></div>
                      )}
                      {profile.cccdAddress && (
                        <div><span>Địa chỉ thường trú</span><strong>{profile.cccdAddress}</strong></div>
                      )}
                    </div>
                    {(profile.cccdFrontImageUrl || profile.cccdBackImageUrl) && (
                      <div className="seller-cccd-carry__images">
                        {profile.cccdFrontImageUrl && (
                          <figure>
                            <img src={profile.cccdFrontImageUrl} alt="CCCD mặt trước" />
                            <figcaption>Mặt trước</figcaption>
                          </figure>
                        )}
                        {profile.cccdBackImageUrl && (
                          <figure>
                            <img src={profile.cccdBackImageUrl} alt="CCCD mặt sau" />
                            <figcaption>Mặt sau</figcaption>
                          </figure>
                        )}
                      </div>
                    )}
                    <small>
                      Giấy tờ này sẽ được gửi kèm đơn đăng ký cho nhân viên duyệt. Cần chỉnh sửa?{' '}
                      <Link to="/profile/personal-info">Cập nhật tại Thông tin cá nhân</Link>
                    </small>
                  </div>
                </div>
              )}

              <div className="seller-field seller-field--full">
                <label className="field-label">Loại hình kinh doanh</label>
                <div className="seller-type-group">
                  <label className={isIndividual ? "selected" : ""}>
                    <input
                      type="radio"
                      name="businessType"
                      value="individual"
                      checked={form.businessType === "individual"}
                      onChange={handleChange}
                    />
                    Cá nhân
                  </label>
                  <label className={!isIndividual ? "selected" : ""}>
                    <input
                      type="radio"
                      name="businessType"
                      value="business"
                      checked={form.businessType === "business"}
                      onChange={handleChange}
                    />
                    Doanh nghiệp
                  </label>
                </div>
              </div>

              <div className="seller-field seller-field--full">
                <label className="field-label" htmlFor="shopName">
                  {isIndividual ? "Tên shop" : "Tên doanh nghiệp"}
                  <span className="required"> *</span>
                </label>
                <input
                  id="shopName"
                  name="shopName"
                  value={form.shopName}
                  onChange={handleChange}
                  placeholder={isIndividual ? "Tên shop của bạn" : "Tên công ty / doanh nghiệp"}
                  className={errors.shopName ? "input-error" : ""}
                />
                {errors.shopName && <span className="field-error">{errors.shopName}</span>}
              </div>

              <div className="seller-field">
                <label className="field-label" htmlFor="taxCode">
                  Mã số thuế
                  <span className="required"> *</span>
                </label>
                <input
                  id="taxCode"
                  name="taxCode"
                  value={form.taxCode}
                  onChange={handleChange}
                  placeholder="0123456789"
                  className={errors.taxCode ? "input-error" : ""}
                />
                {errors.taxCode && <span className="field-error">{errors.taxCode}</span>}
              </div>

              <FileInput
                label={isIndividual ? "Giấy tờ định danh (CCCD/CMND)" : "Giấy phép kinh doanh"}
                name="businessLicense"
                form={form}
                setForm={setForm}
              />

              <div className="seller-field seller-field--full">
                <label className="field-label" htmlFor="pickupAddress">
                  Địa chỉ lấy hàng / địa chỉ shop
                  <span className="required"> *</span>
                </label>
                <textarea
                  id="pickupAddress"
                  name="pickupAddress"
                  value={form.pickupAddress}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
                  className={errors.pickupAddress ? "input-error" : ""}
                />
                {errors.pickupAddress && <span className="field-error">{errors.pickupAddress}</span>}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="seller-form-grid">
              <div className="seller-field">
                <BankSelect name="bankName" value={form.bankName} onChange={handleChange} includeOther />
                {errors.bankName && <span className="field-error">{errors.bankName}</span>}
              </div>

              {form.bankName === "other" && (
                <div className="seller-field">
                  <label className="field-label" htmlFor="bankNameCustom">
                    Tên ngân hàng
                    <span className="required"> *</span>
                  </label>
                  <input
                    id="bankNameCustom"
                    name="bankNameCustom"
                    value={form.bankNameCustom}
                    onChange={handleChange}
                    placeholder="Nhập tên ngân hàng"
                    className={errors.bankNameCustom ? "input-error" : ""}
                  />
                  {errors.bankNameCustom && <span className="field-error">{errors.bankNameCustom}</span>}
                </div>
              )}

              <div className="seller-field">
                <label className="field-label" htmlFor="accountNumber">
                  Số tài khoản
                  <span className="required"> *</span>
                </label>
                <input
                  id="accountNumber"
                  name="accountNumber"
                  value={form.accountNumber}
                  onChange={handleChange}
                  placeholder="0123456789"
                  className={errors.accountNumber ? "input-error" : ""}
                />
                {errors.accountNumber && <span className="field-error">{errors.accountNumber}</span>}
              </div>

              <div className="seller-field seller-field--full">
                <label className="field-label" htmlFor="accountHolder">
                  Tên chủ tài khoản
                  <span className="required"> *</span>
                </label>
                <input
                  id="accountHolder"
                  name="accountHolder"
                  value={form.accountHolder}
                  onChange={handleChange}
                  placeholder="NGUYEN VAN A"
                  className={errors.accountHolder ? "input-error" : ""}
                />
                {errors.accountHolder && <span className="field-error">{errors.accountHolder}</span>}
              </div>

              <div className="seller-field seller-field--full">
                <div className="seller-bank-note">
                  Thông tin ngân hàng dùng để chi trả doanh thu bán hàng. Vui lòng nhập chính xác tên chủ tài khoản.
                </div>
              </div>

              <div className="seller-field seller-field--full">
                <div className="seller-summary">
                  <h3>Xem lại thông tin</h3>
                  <div><span>Loại hình</span><strong>{isIndividual ? "Cá nhân" : "Doanh nghiệp"}</strong></div>
                  <div><span>Tên shop</span><strong>{form.shopName}</strong></div>
                  <div><span>Mã số thuế</span><strong>{form.taxCode}</strong></div>
                  <div><span>Địa chỉ</span><strong>{form.pickupAddress}</strong></div>
                  <div><span>Ngân hàng</span><strong>{resolvedBank} — {form.accountNumber}</strong></div>
                </div>
              </div>
            </div>
          )}

          <div className="seller-wizard-nav">
            {step > 0 && (
              <button type="button" className="seller-nav-btn outline" onClick={prevStep}>
                Quay lại
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button type="button" className="seller-submit-btn" onClick={nextStep}>
                Tiếp theo
              </button>
            ) : (
              <button
                type="button"
                className="seller-submit-btn"
                onClick={isResubmit ? handleResubmit : handleSubmit}
                disabled={submitting}
              >
                {submitting ? "Đang gửi..." : "Gửi đơn đăng ký"}
              </button>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
