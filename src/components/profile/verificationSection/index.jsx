import { useState } from 'react';
import { toast } from 'react-toastify';
import * as profileService from '../../../services/profileService';

export default function VerificationSection({ userId, profile, onUpdate }) {
  const [loading, setLoading] = useState(null);

  const handleVerifyEmail = async () => {
    setLoading('email');
    try {
      const updated = await profileService.requestEmailVerification(userId);
      onUpdate(updated);
      toast.success('Xác minh email thành công');
    } catch {
      toast.error('Xác minh email thất bại');
    } finally {
      setLoading(null);
    }
  };

  const handleVerifyNationalId = async () => {
    setLoading('nationalId');
    try {
      const updated = await profileService.verifyNationalId(userId);
      onUpdate(updated);
      toast.success('Xác minh CMND/CCCD thành công');
    } catch {
      toast.error('Xác minh CMND/CCCD thất bại');
    } finally {
      setLoading(null);
    }
  };

  const handleVerifyPhone = async () => {
    setLoading('phone');
    try {
      const updated = await profileService.verifyPhone(userId);
      onUpdate(updated);
      toast.success('Xác minh số điện thoại thành công');
    } catch {
      toast.error('Xác minh số điện thoại thất bại');
    } finally {
      setLoading(null);
    }
  };

  return (
    <section className="profile-section" id="verification">
      <div className="profile-section-header">
        <h2>Xác minh tài khoản</h2>
      </div>

      <div className="profile-verify-grid">
        <div className="profile-verify-card">
          <div className="profile-verify-info">
            <strong>Email</strong>
            <span>{profile.email}</span>
          </div>
          <span className={`profile-badge ${profile.isEmailVerified ? 'verified' : 'unverified'}`}>
            {profile.isEmailVerified ? '✓ Đã xác minh' : 'Chưa xác minh'}
          </span>
          {!profile.isEmailVerified && (
            <button
              type="button"
              className="profile-btn profile-btn--primary profile-btn--sm"
              onClick={handleVerifyEmail}
              disabled={loading === 'email'}
            >
              {loading === 'email' ? 'Đang xác minh...' : 'Xác minh email'}
            </button>
          )}
        </div>

        <div className="profile-verify-card">
          <div className="profile-verify-info">
            <strong>Số điện thoại</strong>
            <span>{profile.phone}</span>
          </div>
          <span className={`profile-badge ${profile.isPhoneVerified ? 'verified' : 'unverified'}`}>
            {profile.isPhoneVerified ? '✓ Đã xác minh' : 'Chưa xác minh'}
          </span>
          {!profile.isPhoneVerified && (
            <button
              type="button"
              className="profile-btn profile-btn--primary profile-btn--sm"
              onClick={handleVerifyPhone}
              disabled={loading === 'phone'}
            >
              {loading === 'phone' ? 'Đang xác minh...' : 'Xác minh SĐT'}
            </button>
          )}
        </div>

        <div className="profile-verify-card">
          <div className="profile-verify-info">
            <strong>CMND / CCCD</strong>
            <span>Giấy tờ tùy thân</span>
          </div>
          <span className={`profile-badge ${profile.isNationalIdVerified ? 'verified' : 'unverified'}`}>
            {profile.isNationalIdVerified ? '✓ Đã xác minh' : 'Chưa xác minh'}
          </span>
          {!profile.isNationalIdVerified && (
            <button
              type="button"
              className="profile-btn profile-btn--primary profile-btn--sm"
              onClick={handleVerifyNationalId}
              disabled={loading === 'nationalId'}
            >
              {loading === 'nationalId' ? 'Đang xác minh...' : 'Xác minh CMND/CCCD'}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
