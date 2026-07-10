import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as profileService from '../../../services/profileService';
import { readImageAsDataUrl } from '../../../utils/imageUpload';
import Input from '../../common/input';
import Button from '../../common/button';
import './index.scss';

// Ô tải ảnh CCCD trực tiếp từ máy (không dán URL nữa)
function CccdImageUpload({ label, value, onPick, onClear, disabled }) {
  return (
    <div className="personal-info-cccd__upload">
      <span className="personal-info-cccd__upload-label">{label}</span>
      {value ? (
        <div className="personal-info-cccd__preview">
          <img src={value} alt={label} />
          {!disabled && (
            <button type="button" className="personal-info-cccd__preview-remove" onClick={onClear}>
              Xoá ảnh
            </button>
          )}
        </div>
      ) : (
        <label className={`personal-info-cccd__upload-btn ${disabled ? 'is-disabled' : ''}`}>
          <span>📷 Chọn ảnh từ máy</span>
          <input
            type="file"
            accept="image/*"
            hidden
            disabled={disabled}
            onChange={onPick}
          />
        </label>
      )}
    </div>
  );
}

const MAX_ADDRESS_LEN = 200;

const STATUS_META = {
  PENDING: { label: 'Đang chờ nhân viên duyệt', cls: 'pending' },
  APPROVED: { label: 'Đã xác minh CCCD', cls: 'approved' },
  VERIFIED: { label: 'Đã xác minh CCCD', cls: 'approved' },
  REJECTED: { label: 'Hồ sơ bị từ chối, vui lòng nộp lại', cls: 'rejected' },
};

export default function PersonalInfoCccd({ userId, profile, onUpdate }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    cccdFullName: '',
    cccdNumber: '',
    cccdAddress: '',
    frontImageUrl: '',
    backImageUrl: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm((prev) => ({
        ...prev,
        cccdFullName: profile.cccdFullName || '',
        cccdNumber: profile.cccdNumber || '',
        cccdAddress: profile.cccdAddress || '',
        frontImageUrl: profile.cccdFrontImageUrl || '',
        backImageUrl: profile.cccdBackImageUrl || '',
      }));
    }
  }, [profile]);

  const status = profile?.identityStatus || null;
  const statusMeta = status ? STATUS_META[status] : null;
  // Đã xác minh hoặc đang chờ duyệt thì khoá không cho nộp lại
  const locked = status === 'APPROVED' || status === 'VERIFIED' || status === 'PENDING';

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'cccdAddress' && value.length > MAX_ADDRESS_LEN) return;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const isValid =
    form.cccdFullName.trim() &&
    form.cccdNumber.trim() &&
    form.cccdAddress.trim() &&
    form.frontImageUrl &&
    form.backImageUrl;

  // Chọn ảnh từ máy -> nén thành data URL lưu vào form
  const handlePickImage = (key) => async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // cho phép chọn lại cùng 1 file
    if (!file) return;
    try {
      const dataUrl = await readImageAsDataUrl(file);
      setForm((prev) => ({ ...prev, [key]: dataUrl }));
    } catch (err) {
      toast.error(err.message || 'Không tải được ảnh');
    }
  };

  const clearImage = (key) => () => setForm((prev) => ({ ...prev, [key]: '' }));

  const handleConfirm = async () => {
    if (!isValid || locked) return;
    setSaving(true);
    try {
      // 1) Lưu thông tin cá nhân (họ tên, số CCCD, địa chỉ, ảnh) + đẩy địa chỉ lên backend.
      // Dữ liệu này được form đăng ký Người bán đọc lại để hiển thị cho staff duyệt.
      const saved = await profileService.updateCccdInfo(userId, {
        cccdFullName: form.cccdFullName,
        cccdNumber: form.cccdNumber,
        cccdAddress: form.cccdAddress,
        cccdFrontImageUrl: form.frontImageUrl,
        cccdBackImageUrl: form.backImageUrl,
      });

      // 2) Nộp hồ sơ xác thực CCCD thật (staff duyệt để đủ điều kiện làm seller).
      // Best-effort: nếu backend từ chối ảnh base64 dài, vẫn giữ dữ liệu đã lưu local.
      let updated = saved;
      try {
        updated = await profileService.submitIdentityVerification(userId, {
          identityNumber: form.cccdNumber.trim(),
          frontImageUrl: form.frontImageUrl,
          backImageUrl: form.backImageUrl,
        });
      } catch {
        /* giữ dữ liệu local, không chặn UX */
      }

      onUpdate(updated);
      toast.success('Đã lưu thông tin CCCD. Chuyển sang đăng ký Người bán...');
      // Đẩy sang trang đăng ký seller (CCCD + ảnh sẽ gửi kèm cho staff khi hoàn tất đơn)
      navigate('/profile/become-seller');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Xác nhận thất bại');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="personal-info-cccd">
      <h1 className="personal-info-cccd__title">Thông tin cá nhân</h1>
      <p className="personal-info-cccd__desc">
        Bạn vui lòng nhập chính xác thông tin CCCD để đơn hàng được thông quan theo quy định từ ngày 9/7.
        Thông tin sẽ được dùng để xác minh danh tính và đủ điều kiện đăng ký Người bán.
      </p>

      {statusMeta && (
        <div className={`personal-info-cccd__status personal-info-cccd__status--${statusMeta.cls}`}>
          {statusMeta.label}
        </div>
      )}

      <hr className="personal-info-cccd__divider" />

      <div className="personal-info-cccd__fields">
        <Input
          label="Họ và tên"
          name="cccdFullName"
          value={form.cccdFullName}
          onChange={handleChange}
          placeholder="Họ và tên đầy đủ trên CCCD"
          disabled={locked}
        />
        <Input
          label="Số CCCD"
          name="cccdNumber"
          value={form.cccdNumber}
          onChange={handleChange}
          placeholder="Số định danh cá nhân trên CCCD"
          disabled={locked}
        />
        <div className="personal-info-cccd__address-wrap">
          <Input
            label="Địa chỉ"
            name="cccdAddress"
            value={form.cccdAddress}
            onChange={handleChange}
            placeholder="Địa chỉ Nơi thường trú trên CCCD"
            disabled={locked}
          />
          <span className="personal-info-cccd__counter">
            {form.cccdAddress.length}/{MAX_ADDRESS_LEN}
          </span>
        </div>
        <CccdImageUpload
          label="Ảnh CCCD mặt trước"
          value={form.frontImageUrl}
          onPick={handlePickImage('frontImageUrl')}
          onClear={clearImage('frontImageUrl')}
          disabled={locked}
        />
        <CccdImageUpload
          label="Ảnh CCCD mặt sau"
          value={form.backImageUrl}
          onPick={handlePickImage('backImageUrl')}
          onClear={clearImage('backImageUrl')}
          disabled={locked}
        />
      </div>

      {!locked && (
        <div className="personal-info-cccd__actions">
          <Button variant="accent" disabled={!isValid || saving} onClick={handleConfirm}>
            {saving ? 'Đang xử lý...' : 'Xác Nhận'}
          </Button>
        </div>
      )}
    </section>
  );
}
