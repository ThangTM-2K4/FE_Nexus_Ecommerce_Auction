import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as profileService from '../../../services/profileService';
import { uploadAvatar } from '../../../services/avatarService';
import { getApiErrorMessage } from '../../../utils/apiResponse';
import { useAuth } from '../../../context/AuthContext';
import UserAvatar from '../../common/userAvatar';
import Button from '../../common/button';
import Select from '../../common/select';
import Modal from '../../common/modal';
import './index.scss';

const GENDERS = [
  { value: 'male', label: 'Nam' },
  { value: 'female', label: 'Nữ' },
  { value: 'other', label: 'Khác' },
];

// Chỉ PENDING mới khoá nút "Xác minh" — REJECTED phải cho nộp lại.
const ID_PENDING_LABEL = { PENDING: 'Đang chờ duyệt' };

/**
 * Trạng thái xác minh nằm NGAY TRONG ô nhập (góc phải).
 * - Đã xác minh -> nhãn tĩnh "✓ Đã xác minh"
 * - Đang chờ duyệt -> nhãn tĩnh theo pendingLabel
 * - Chưa xác minh -> nút "Xác minh" bấm được (mở ô OTP hoặc sang trang CCCD)
 */
function VerifySlot({ verified, pendingLabel, onVerify, to, busy }) {
  if (verified) return <span className="profile-slot profile-slot--verified">✓ Đã xác minh</span>;
  if (pendingLabel) return <span className="profile-slot profile-slot--pending">{pendingLabel}</span>;

  if (to) {
    return (
      <Link to={to} className="profile-slot profile-slot--action">
        Xác minh
      </Link>
    );
  }

  return (
    <button type="button" className="profile-slot profile-slot--action" onClick={onVerify} disabled={busy}>
      {busy ? 'Đang gửi...' : 'Xác minh'}
    </button>
  );
}

/**
 * Popup nhập OTP xác minh (email / số điện thoại). Dùng chung common Modal
 * nên có sẵn nút "← Quay lại" trên header + nút "Trở lại" ở footer như các trang khác.
 */
function OtpModal({
  open,
  title,
  hint,
  target,
  value,
  onChange,
  onConfirm,
  onResend,
  onClose,
  confirming,
  resending,
}) {
  const footer = (
    <Button
      variant="accent"
      className="otp-modal__confirm"
      disabled={confirming || !value.trim()}
      onClick={onConfirm}
    >
      {confirming ? 'Đang xác nhận...' : 'Xác nhận'}
    </Button>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      showBack
      onBack={onClose}
      footer={footer}
      className="otp-modal"
    >
      <div className="otp-modal__body">
        <span className="otp-modal__icon" aria-hidden="true">🔒</span>
        <p className="otp-modal__hint">
          {hint}
          <strong>{target}</strong>
        </p>
        <input
          type="text"
          inputMode="numeric"
          autoFocus
          className="otp-modal__input"
          placeholder="• • • • • •"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))}
          onKeyDown={(e) => e.key === 'Enter' && onConfirm()}
        />
        <button
          type="button"
          className="otp-modal__resend"
          onClick={onResend}
          disabled={resending}
        >
          {resending ? 'Đang gửi lại...' : 'Không nhận được mã? Gửi lại'}
        </button>
      </div>
    </Modal>
  );
}

export default function ProfileInfo({ userId, profile, onUpdate }) {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(null);

  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');

  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState('');

  const avatarInputRef = useRef(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarUploadError, setAvatarUploadError] = useState('');

  useEffect(() => {
    if (profile) setForm({ ...profile });
  }, [profile]);

  const handlePickAvatar = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setAvatarUploadError('');
    setAvatarUploading(true);

    try {
      const avatarUrl = await uploadAvatar(file, {
        onPreview: (previewUrl) => updateUser({ avatar: previewUrl }),
      });

      updateUser({ avatar: avatarUrl });
      onUpdate({ ...profile, avatar: avatarUrl });
      setForm((prev) => ({ ...prev, avatar: avatarUrl }));
      toast.success('Cập nhật ảnh đại diện thành công');
    } catch (err) {
      const message = err?.message || getApiErrorMessage(err, 'Tải ảnh đại diện thất bại');
      setAvatarUploadError(message);
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const run = async (key, fn, successMsg) => {
    setLoading(key);
    try {
      const result = await fn();
      if (successMsg) toast.success(successMsg);
      return result;
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Thao tác thất bại'));
      return null;
    } finally {
      setLoading(null);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await profileService.updateProfile(userId, form);
      onUpdate(updated);
      toast.success('Cập nhật hồ sơ thành công');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Cập nhật hồ sơ thất bại'));
    } finally {
      setSaving(false);
    }
  };

  // ---- Email ----
  // Mở modal nhập OTP NGAY, không đợi gửi thành công: nếu backend chặn vì vừa
  // gửi (rate-limit "Please wait before requesting another OTP") thì OTP cũ vẫn
  // dùng được — người dùng cần ô để nhập, không nên chặn.
  const handleSendEmailOtp = async () => {
    setEmailOtpSent(true);
    await run(
      'email-send',
      () => profileService.requestEmailVerification(userId),
      'Đã gửi mã xác minh tới email'
    );
  };

  const handleVerifyEmail = async () => {
    if (!emailOtp.trim()) return toast.error('Nhập mã OTP email');
    const updated = await run(
      'email',
      () => profileService.verifyEmailOtp(userId, emailOtp.trim()),
      'Xác minh email thành công'
    );
    if (updated) {
      onUpdate(updated);
      setEmailOtp('');
      setEmailOtpSent(false);
    }
  };

  // ---- Số điện thoại ---- lưu số (PUT /users/me) rồi gửi OTP
  // Mở modal nhập OTP NGAY sau khi số hợp lệ (xem chú thích ở handleSendEmailOtp).
  const handleSendPhoneOtp = async () => {
    const phone = (form.phone || '').trim();
    if (!/^0\d{9}$/.test(phone)) {
      return toast.error('Nhập số điện thoại hợp lệ (10 số, bắt đầu bằng 0)');
    }
    setPhoneOtpSent(true);
    await run(
      'phone-send',
      async () => {
        // Lưu SĐT trước; nếu số đã có sẵn trên hồ sơ backend có thể trả lỗi,
        // vẫn tiếp tục gửi OTP tới số hiện tại.
        try {
          await profileService.updatePhoneNumber(userId, phone);
        } catch {
          /* bỏ qua, thử gửi OTP tới SĐT đang có */
        }
        await profileService.requestPhoneOtp(userId);
        return true;
      },
      'Đã gửi mã OTP tới số điện thoại'
    );
  };

  const handleVerifyPhone = async () => {
    if (!phoneOtp.trim()) return toast.error('Nhập mã OTP');
    const updated = await run(
      'phone',
      () => profileService.verifyPhoneOtp(userId, phoneOtp.trim()),
      'Xác thực số điện thoại thành công'
    );
    if (updated) {
      onUpdate(updated);
      setPhoneOtp('');
      setPhoneOtpSent(false);
    }
  };

  const idStatusLabel = ID_PENDING_LABEL[profile.identityStatus] || null;

  return (
    <section className="profile-section profile-info" id="verification">
      <div className="profile-section-header">
        <h2>Thông tin & xác minh</h2>
      </div>

      <div className="profile-info__grid">
        <div className="profile-info__avatar-block">
          <UserAvatar
            avatar={user?.avatar}
            name={user?.fullName || form.fullName}
            className="profile-info__avatar"
            loading={avatarUploading}
            alt="Ảnh đại diện"
          />
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/jpeg,image/png,.jpg,.jpeg,.png"
            hidden
            onChange={handlePickAvatar}
          />
          <button
            type="button"
            className="profile-info__upload-btn"
            onClick={() => avatarInputRef.current?.click()}
            disabled={avatarUploading}
          >
            {avatarUploading ? 'Đang tải...' : 'Chọn ảnh'}
          </button>
          {avatarUploadError ? (
            <p className="profile-info__upload-error" role="alert">
              {avatarUploadError}
            </p>
          ) : (
            <p className="profile-info__upload-hint">
              Dung lượng tối đa 1MB
              <br />
              Định dạng: .JPEG, .PNG
            </p>
          )}
        </div>

        <div className="profile-info__fields">
          {/* EMAIL */}
          <div className="profile-info__field">
            <div className="profile-info__label-row">
              <label htmlFor="profile-email">Email</label>
            </div>
            <div className="profile-info__control">
              <input
                id="profile-email"
                name="email"
                type="email"
                value={form.email || ''}
                onChange={handleChange}
              />
              <VerifySlot
                verified={profile.isEmailVerified}
                onVerify={handleSendEmailOtp}
                busy={loading === 'email-send'}
              />
            </div>
          </div>

          {/* SỐ ĐIỆN THOẠI */}
          <div className="profile-info__field">
            <div className="profile-info__label-row">
              <label htmlFor="profile-phone">Số điện thoại</label>
            </div>
            <div className="profile-info__control">
              <input
                id="profile-phone"
                name="phone"
                type="tel"
                placeholder="VD: 0901234567"
                value={form.phone || ''}
                onChange={handleChange}
              />
              <VerifySlot
                verified={profile.isPhoneVerified}
                onVerify={handleSendPhoneOtp}
                busy={loading === 'phone-send'}
              />
            </div>
          </div>

          {/* TÊN */}
          <div className="profile-info__field">
            <div className="profile-info__label-row">
              <label htmlFor="profile-fullname">Tên</label>
            </div>
            <input
              id="profile-fullname"
              name="fullName"
              value={form.fullName || ''}
              onChange={handleChange}
            />
          </div>

          {/* GIỚI TÍNH */}
          <div className="profile-info__field">
            <div className="profile-info__label-row">
              <span className="profile-info__field-label">Giới tính</span>
            </div>
            <Select
              name="gender"
              value={form.gender || ''}
              onChange={handleChange}
              options={GENDERS}
              placeholder="Chọn giới tính"
            />
          </div>

          {/* NGÀY SINH */}
          <div className="profile-info__field">
            <div className="profile-info__label-row">
              <label htmlFor="profile-dob">Ngày sinh</label>
            </div>
            <input
              id="profile-dob"
              name="dateOfBirth"
              type="date"
              value={form.dateOfBirth || ''}
              onChange={handleChange}
            />
          </div>

          {/* CCCD — không mở ô OTP, bấm "Xác minh" sang trang nhập CCCD */}
          <div className="profile-info__field">
            <div className="profile-info__label-row">
              <label>CCCD</label>
            </div>
            <div className="profile-info__control profile-info__control--readonly">
              <span className="profile-info__cccd-value">
                {profile.cccdNumber || 'Chưa có thông tin giấy tờ tùy thân'}
              </span>
              <VerifySlot
                verified={profile.isNationalIdVerified}
                pendingLabel={idStatusLabel}
                to="/profile/personal-info"
              />
            </div>
          </div>
        </div>
      </div>

      <OtpModal
        open={!profile.isEmailVerified && emailOtpSent}
        title="Xác minh Email"
        hint="Nhập mã OTP đã gửi tới email"
        target={form.email}
        value={emailOtp}
        onChange={setEmailOtp}
        onConfirm={handleVerifyEmail}
        onResend={handleSendEmailOtp}
        onClose={() => {
          setEmailOtpSent(false);
          setEmailOtp('');
        }}
        confirming={loading === 'email'}
        resending={loading === 'email-send'}
      />

      <OtpModal
        open={!profile.isPhoneVerified && phoneOtpSent}
        title="Xác minh Số điện thoại"
        hint="Nhập mã OTP đã gửi tới số"
        target={form.phone}
        value={phoneOtp}
        onChange={setPhoneOtp}
        onConfirm={handleVerifyPhone}
        onResend={handleSendPhoneOtp}
        onClose={() => {
          setPhoneOtpSent(false);
          setPhoneOtp('');
        }}
        confirming={loading === 'phone'}
        resending={loading === 'phone-send'}
      />

      <div className="profile-info__actions">
        <Button variant="accent" onClick={handleSave} disabled={saving}>
          {saving ? 'Đang lưu...' : 'Lưu'}
        </Button>
      </div>
    </section>
  );
}
