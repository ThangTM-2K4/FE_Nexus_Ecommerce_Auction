import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as profileService from '../../../services/profileService';

export default function VerificationSection({ userId, profile, onUpdate }) {
  const [loading, setLoading] = useState(null);

  // Email
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');

  // Phone (luồng OTP thật 2 bước)
  const [phoneInput, setPhoneInput] = useState(profile.phone || '');
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState('');

  const run = async (key, fn, successMsg) => {
    setLoading(key);
    try {
      const result = await fn();
      if (successMsg) toast.success(successMsg);
      return result;
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Thao tác thất bại');
      return null;
    } finally {
      setLoading(null);
    }
  };

  // ---- Email ----
  const handleSendEmailOtp = () =>
    run('email-send', () => profileService.requestEmailVerification(userId), 'Đã gửi mã xác minh tới email')
      .then((r) => r && setEmailOtpSent(true));

  const handleVerifyEmail = async () => {
    if (!emailOtp.trim()) return toast.error('Nhập mã OTP email');
    const updated = await run('email', () => profileService.verifyEmailOtp(userId, emailOtp.trim()), 'Xác minh email thành công');
    if (updated) {
      onUpdate(updated);
      setEmailOtp('');
      setEmailOtpSent(false);
    }
  };

  // ---- Phone ---- Bước 1: lưu SĐT (PUT /users/me) rồi gửi OTP (request-otp)
  const handleSendPhoneOtp = async () => {
    const phone = phoneInput.trim();
    if (!/^0\d{9}$/.test(phone)) {
      return toast.error('Nhập số điện thoại hợp lệ (10 số, bắt đầu bằng 0)');
    }
    const ok = await run(
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
    if (ok) setPhoneOtpSent(true);
  };

  // Bước 2: nhập OTP → verify-otp → backend đánh dấu SĐT đã xác thực
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

  // ---- Identity (CCCD) ---- nhập/nộp ở trang "Thông tin cá nhân"
  const idStatusLabel = {
    PENDING: 'Đang chờ duyệt',
    APPROVED: 'Đã xác minh',
    REJECTED: 'Bị từ chối',
  }[profile.identityStatus] || null;

  return (
    <section className="profile-section" id="verification">
      <div className="profile-section-header">
        <h2>Xác minh tài khoản</h2>
      </div>

      <div className="profile-verify-grid">
        {/* EMAIL */}
        <div className="profile-verify-card">
          <div className="profile-verify-info">
            <strong>Email</strong>
            <span>{profile.email}</span>
          </div>
          <span className={`profile-badge ${profile.isEmailVerified ? 'verified' : 'unverified'}`}>
            {profile.isEmailVerified ? '✓ Đã xác minh' : 'Chưa xác minh'}
          </span>
          {!profile.isEmailVerified && (
            <div className="profile-verify-actions">
              {!emailOtpSent ? (
                <button
                  type="button"
                  className="profile-btn profile-btn--primary profile-btn--sm"
                  onClick={handleSendEmailOtp}
                  disabled={loading === 'email-send'}
                >
                  {loading === 'email-send' ? 'Đang gửi...' : 'Gửi mã xác minh'}
                </button>
              ) : (
                <>
                  <input
                    type="text"
                    className="profile-otp-input"
                    placeholder="Nhập mã OTP"
                    value={emailOtp}
                    onChange={(e) => setEmailOtp(e.target.value)}
                  />
                  <button
                    type="button"
                    className="profile-btn profile-btn--primary profile-btn--sm"
                    onClick={handleVerifyEmail}
                    disabled={loading === 'email'}
                  >
                    {loading === 'email' ? 'Đang xác minh...' : 'Xác minh'}
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* PHONE */}
        <div className="profile-verify-card">
          <div className="profile-verify-info">
            <strong>Số điện thoại</strong>
            <span>{profile.phone || 'Chưa có SĐT'}</span>
          </div>
          <span className={`profile-badge ${profile.isPhoneVerified ? 'verified' : 'unverified'}`}>
            {profile.isPhoneVerified ? '✓ Đã xác minh' : 'Chưa xác minh'}
          </span>
          {!profile.isPhoneVerified && (
            <div className="profile-verify-actions">
              {!phoneOtpSent ? (
                <>
                  <input
                    type="tel"
                    className="profile-otp-input"
                    placeholder="Số điện thoại (VD: 0901234567)"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                  />
                  <button
                    type="button"
                    className="profile-btn profile-btn--primary profile-btn--sm"
                    onClick={handleSendPhoneOtp}
                    disabled={loading === 'phone-send'}
                  >
                    {loading === 'phone-send' ? 'Đang gửi...' : 'Gửi mã OTP'}
                  </button>
                </>
              ) : (
                <>
                  <input
                    type="text"
                    className="profile-otp-input"
                    placeholder="Nhập mã OTP"
                    value={phoneOtp}
                    onChange={(e) => setPhoneOtp(e.target.value)}
                  />
                  <button
                    type="button"
                    className="profile-btn profile-btn--primary profile-btn--sm"
                    onClick={handleVerifyPhone}
                    disabled={loading === 'phone'}
                  >
                    {loading === 'phone' ? 'Đang xác thực...' : 'Xác thực'}
                  </button>
                  <button
                    type="button"
                    className="profile-btn profile-btn--ghost profile-btn--sm"
                    onClick={handleSendPhoneOtp}
                    disabled={loading === 'phone-send'}
                  >
                    Gửi lại
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* NATIONAL ID */}
        <div className="profile-verify-card">
          <div className="profile-verify-info">
            <strong>CMND / CCCD</strong>
            <span>Giấy tờ tùy thân</span>
          </div>
          <span className={`profile-badge ${profile.isNationalIdVerified ? 'verified' : 'unverified'}`}>
            {profile.isNationalIdVerified
              ? '✓ Đã xác minh'
              : idStatusLabel || 'Chưa xác minh'}
          </span>
          {!profile.isNationalIdVerified && profile.identityStatus !== 'PENDING' && (
            <div className="profile-verify-actions">
              <Link
                to="/profile/personal-info"
                className="profile-btn profile-btn--primary profile-btn--sm"
              >
                Xác thực CCCD
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
