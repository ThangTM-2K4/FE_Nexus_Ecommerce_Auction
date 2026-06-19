import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../../context/AuthContext';
import * as profileService from '../../../services/profileService';
import * as sellerService from '../../../services/sellerService';
import * as reputationService from '../../../services/reputationService';
import Header from '../../../components/homepage/header';
import Footer from '../../../components/homepage/footer';
import './index.scss';

const STEPS = [
  'Thông tin cửa hàng',
  'Địa chỉ kinh doanh',
  'Thông tin thuế',
  'Tải tài liệu',
  'Xác nhận ngân hàng',
  'Xem lại & Gửi',
];

const initialForm = {
  shopName: '',
  shopDescription: '',
  businessType: 'individual',
  province: '',
  district: '',
  ward: '',
  streetAddress: '',
  citizenId: '',
  taxCode: '',
  businessRegistrationNumber: '',
  documents: {},
};

function MockFileInput({ label, name, form, setForm }) {
  const handleMockUpload = () => {
    setForm((prev) => ({
      ...prev,
      documents: {
        ...prev.documents,
        [name]: `${label} — uploaded_mock.pdf`,
      },
    }));
    toast.info(`Đã tải lên (mock): ${label}`);
  };

  return (
    <div className="seller-file-field">
      <label>{label}</label>
      <button type="button" className="seller-upload-btn" onClick={handleMockUpload}>
        {form.documents[name] ? '✓ Đã tải lên' : 'Chọn tệp (mock)'}
      </button>
      {form.documents[name] && <small>{form.documents[name]}</small>}
    </div>
  );
}

export default function BecomeSellerPage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [profile, setProfile] = useState(null);
  const [application, setApplication] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [resubmitMode, setResubmitMode] = useState(false);
  const [buyerScore, setBuyerScore] = useState(0);

  useEffect(() => {
    const load = async () => {
      const [p, app] = await Promise.all([
        profileService.getProfile(user.id),
        sellerService.getSellerApplication(user.id),
      ]);
      setProfile(p);
      setApplication(app);
      const rep = await reputationService.getUserReputation(user.id, p, user.sellerStatus);
      setBuyerScore(rep.buyerProfile.score);
      setLoading(false);
    };
    load();
  }, [user?.id, user?.sellerStatus]);

  const checks = sellerService.checkSellerPreconditions(profile || {});
  const allMet = sellerService.allPreconditionsMet(profile || {});
  const canApply = reputationService.canApplySeller(buyerScore);
  const readyToApply = allMet && canApply;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const app = await sellerService.submitSellerApplication(user.id, form);
      refreshUser();
      setApplication(app);
      setResubmitMode(false);
      setForm(initialForm);
      toast.success('Đã gửi đơn đăng ký người bán');
      navigate('/profile/become-seller');
    } catch {
      toast.error('Gửi đơn thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResubmit = async () => {
    setSubmitting(true);
    try {
      const app = await sellerService.resubmitSellerApplication(user.id, form);
      refreshUser();
      setApplication(app);
      setResubmitMode(false);
      setForm(initialForm);
      setStep(0);
      toast.success('Đã nộp lại đơn đăng ký');
    } catch {
      toast.error('Nộp lại thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSimulateApprove = async () => {
    await sellerService.simulateAdminApproval(user.id);
    refreshUser();
    const app = await sellerService.getSellerApplication(user.id);
    setApplication(app);
    toast.success('Admin đã phê duyệt (mock)');
  };

  const handleSimulateReject = async () => {
    await sellerService.simulateAdminRejection(
      user.id,
      'Tài liệu CMND không rõ nét',
      'Vui lòng chụp lại ảnh CMND/CCCD đủ ánh sáng và không bị che khuất.'
    );
    refreshUser();
    const app = await sellerService.getSellerApplication(user.id);
    setApplication(app);
    toast.info('Admin đã từ chối (mock)');
  };

  if (loading) {
    return (
      <div className="become-seller-page">
        <Header />
        <main className="become-seller-main"><p>Đang tải...</p></main>
        <Footer />
      </div>
    );
  }

  if (user?.sellerStatus === 'APPROVED') {
    return (
      <div className="become-seller-page">
        <Header />
        <main className="become-seller-main">
          <div className="seller-status-card approved">
            <h1>✓ Bạn đã là Người bán</h1>
            <p>Tài khoản của bạn đã được phê duyệt. Truy cập Seller Dashboard để bắt đầu.</p>
            <Link to="/seller" className="seller-action-btn">Mở Seller Dashboard</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (user?.sellerStatus === 'PENDING' && application && step === 0 && !form.shopName) {
    return (
      <div className="become-seller-page">
        <Header />
        <main className="become-seller-main">
          <Link to="/profile" className="seller-back">← Quay lại hồ sơ</Link>
          <div className="seller-status-card pending">
            <h1>Đơn đang chờ duyệt</h1>
            <div className="seller-status-meta">
              <div><span>Mã đơn</span><strong>{application.applicationId}</strong></div>
              <div><span>Ngày nộp</span><strong>{new Date(application.submittedAt).toLocaleString('vi-VN')}</strong></div>
              <div><span>Trạng thái</span><strong className="status-pending">Pending Review</strong></div>
            </div>

            <div className="seller-timeline">
              <h3>Tiến trình</h3>
              {application.timeline?.map((item) => (
                <div key={item.step} className={`seller-timeline-item ${item.status}`}>
                  <span className="seller-timeline-dot" />
                  <div>
                    <strong>{item.step}</strong>
                    {item.date && <small>{new Date(item.date).toLocaleString('vi-VN')}</small>}
                  </div>
                </div>
              ))}
            </div>

            <div className="seller-admin-sim">
              <p><em>Mock Admin Review:</em></p>
              <button type="button" onClick={handleSimulateApprove}>Phê duyệt (mock)</button>
              <button type="button" className="reject" onClick={handleSimulateReject}>Từ chối (mock)</button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (user?.sellerStatus === 'REJECTED' && application && !resubmitMode) {
    return (
      <div className="become-seller-page">
        <Header />
        <main className="become-seller-main">
          <Link to="/profile" className="seller-back">← Quay lại hồ sơ</Link>
          <div className="seller-status-card rejected">
            <h1>Đơn bị từ chối</h1>
            <p><strong>Lý do:</strong> {application.rejectionReason}</p>
            <p><strong>Ghi chú admin:</strong> {application.adminNote}</p>
            <button
              type="button"
              className="seller-action-btn"
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
          <Link to="/profile" className="seller-back">← Quay lại hồ sơ</Link>
          <div className="seller-status-card blocked">
            <h1>Chưa đủ điều kiện</h1>
            <p>Hoàn thành các bước sau trước khi đăng ký người bán:</p>
            <ul className="seller-preconditions">
              <li className={checks.emailVerified ? 'done' : 'pending'}>
                {checks.emailVerified ? '✓' : '○'} Xác minh email
              </li>
              <li className={checks.phoneVerified ? 'done' : 'pending'}>
                {checks.phoneVerified ? '✓' : '○'} Xác minh số điện thoại
              </li>
              <li className={checks.bankAccountAdded ? 'done' : 'pending'}>
                {checks.bankAccountAdded ? '✓' : '○'} Thêm tài khoản ngân hàng
              </li>
              <li className={canApply ? 'done' : 'pending'}>
                {canApply ? '✓' : '○'} Ít nhất 50 điểm uy tín Người mua ({buyerScore} điểm)
              </li>
            </ul>
            <Link to="/profile" className="seller-action-btn">Hoàn thiện hồ sơ</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isIndividual = form.businessType === 'individual';
  const isResubmit = user?.sellerStatus === 'REJECTED' && resubmitMode;

  return (
    <div className="become-seller-page">
      <Header />
      <main className="become-seller-main">
        <Link to="/profile" className="seller-back">← Quay lại hồ sơ</Link>
        <h1>Đăng ký Người bán</h1>

        <div className="seller-stepper">
          {STEPS.map((label, i) => (
            <div key={label} className={`seller-step ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
              <span className="seller-step-num">{i + 1}</span>
              <span className="seller-step-label">{label}</span>
            </div>
          ))}
        </div>

        <div className="seller-wizard">
          {step === 0 && (
            <div className="seller-step-content">
              <h2>Bước 1 — Thông tin cửa hàng</h2>
              <div className="seller-field">
                <label>Tên cửa hàng</label>
                <input name="shopName" value={form.shopName} onChange={handleChange} placeholder="Tên shop của bạn" />
              </div>
              <div className="seller-field">
                <label>Mô tả cửa hàng</label>
                <textarea name="shopDescription" value={form.shopDescription} onChange={handleChange} rows={4} placeholder="Giới thiệu ngắn về cửa hàng" />
              </div>
              <div className="seller-field">
                <label>Loại hình kinh doanh</label>
                <select name="businessType" value={form.businessType} onChange={handleChange}>
                  <option value="individual">Cá nhân</option>
                  <option value="company">Công ty</option>
                </select>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="seller-step-content">
              <h2>Bước 2 — Địa chỉ kinh doanh</h2>
              <div className="seller-field"><label>Tỉnh/Thành</label><input name="province" value={form.province} onChange={handleChange} /></div>
              <div className="seller-field"><label>Quận/Huyện</label><input name="district" value={form.district} onChange={handleChange} /></div>
              <div className="seller-field"><label>Phường/Xã</label><input name="ward" value={form.ward} onChange={handleChange} /></div>
              <div className="seller-field"><label>Địa chỉ chi tiết</label><input name="streetAddress" value={form.streetAddress} onChange={handleChange} /></div>
            </div>
          )}

          {step === 2 && (
            <div className="seller-step-content">
              <h2>Bước 3 — Thông tin thuế</h2>
              {isIndividual ? (
                <div className="seller-field">
                  <label>Số CMND/CCCD</label>
                  <input name="citizenId" value={form.citizenId} onChange={handleChange} />
                  <label>Mã số thuế</label>
                  <input name="citizenId" value={form.citizenId} onChange={handleChange} />
                  <label>Số đăng ký kinh doanh</label>
                  <input name="citizenId" value={form.citizenId} onChange={handleChange} />
                </div>
              ) : (
                <>
                  <div className="seller-field"><label>Mã số thuế</label><input name="taxCode" value={form.taxCode} onChange={handleChange} /></div>
                  <div className="seller-field"><label>Số đăng ký kinh doanh</label><input name="businessRegistrationNumber" value={form.businessRegistrationNumber} onChange={handleChange} /></div>
                </>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="seller-step-content">
              <h2>Bước 4 — Tải tài liệu</h2>
              {isIndividual ? (
                <>
                  <MockFileInput label="Mặt trước CMND/CCCD" name="frontId" form={form} setForm={setForm} />
                  <MockFileInput label="Mặt sau CMND/CCCD" name="backId" form={form} setForm={setForm} />
                  <MockFileInput label="Ảnh selfie cầm CMND" name="selfieId" form={form} setForm={setForm} />
                </>
              ) : (
                <>
                  <MockFileInput label="Giấy phép kinh doanh" name="businessLicense" form={form} setForm={setForm} />
                  <MockFileInput label="Giấy chứng nhận thuế" name="taxCertificate" form={form} setForm={setForm} />
                  <MockFileInput label="CMND người đại diện" name="representativeId" form={form} setForm={setForm} />
                </>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="seller-step-content">
              <h2>Bước 5 — Xác nhận tài khoản ngân hàng</h2>
              <div className="seller-bank-review">
                <p><strong>Ngân hàng:</strong> {profile.bankAccount?.bankName}</p>
                <p><strong>Số TK:</strong> {profile.bankAccount?.accountNumber}</p>
                <p><strong>Chủ TK:</strong> {profile.bankAccount?.accountHolder}</p>
              </div>
              <p className="seller-bank-note">Thông tin trên sẽ được dùng để chi trả doanh thu bán hàng.</p>
            </div>
          )}

          {step === 5 && (
            <div className="seller-step-content">
              <h2>Bước 6 — Xem lại & Gửi</h2>
              <div className="seller-summary">
                <div><span>Tên cửa hàng</span><strong>{form.shopName}</strong></div>
                <div><span>Loại hình</span><strong>{isIndividual ? 'Cá nhân' : 'Công ty'}</strong></div>
                <div><span>Địa chỉ</span><strong>{[form.streetAddress, form.ward, form.district, form.province].filter(Boolean).join(', ')}</strong></div>
                <div><span>Ngân hàng</span><strong>{profile.bankAccount?.bankName} — {profile.bankAccount?.accountNumber}</strong></div>
              </div>
            </div>
          )}

          <div className="seller-wizard-nav">
            {step > 0 && (
              <button type="button" className="seller-nav-btn outline" onClick={prevStep}>Quay lại</button>
            )}
            {step < STEPS.length - 1 ? (
              <button type="button" className="seller-nav-btn primary" onClick={nextStep}>Tiếp theo</button>
            ) : (
              <button
                type="button"
                className="seller-nav-btn primary"
                onClick={isResubmit ? handleResubmit : handleSubmit}
                disabled={submitting}
              >
                {submitting ? 'Đang gửi...' : 'Gửi đơn đăng ký'}
              </button>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
