import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../../context/AuthContext';
import * as profileService from '../../../services/profileService';
import { syncProfileToSellerApplication } from '../../../services/sellerService';
import { readImageAsDataUrl } from '../../../utils/imageUpload';
import { getApiErrorMessage } from '../../../utils/apiResponse';
import Input from '../../common/input';
import Select from '../../common/select';
import Button from '../../common/button';
import './index.scss';

const GENDERS = [
  { value: 'Nam', label: 'Nam' },
  { value: 'Nữ', label: 'Nữ' },
  { value: 'Khác', label: 'Khác' },
];

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
  const { user } = useAuth();
  const isApprovedSeller = user?.sellerStatus === 'APPROVED';
  const [form, setForm] = useState({
    cccdFullName: '',
    cccdNumber: '',
    cccdGender: '',
    cccdDateOfBirth: '',
    cccdIssueDate: '',
    cccdExpiryDate: '',
    cccdIssuePlace: '',
    cccdAddress: '',
    frontImageUrl: '', // data URL để xem trước
    backImageUrl: '',
    frontImageKey: '', // URL/key ảnh sau khi upload lên server (dùng khi nộp)
    backImageKey: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm((prev) => ({
        ...prev,
        cccdFullName: profile.cccdFullName || '',
        cccdNumber: profile.cccdNumber || '',
        cccdGender: profile.cccdGender || '',
        cccdDateOfBirth: profile.cccdDateOfBirth || '',
        cccdIssueDate: profile.cccdIssueDate || '',
        cccdExpiryDate: profile.cccdExpiryDate || '',
        cccdIssuePlace: profile.cccdIssuePlace || '',
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
    form.cccdGender.trim() &&
    form.cccdDateOfBirth.trim() &&
    form.cccdIssueDate.trim() &&
    form.cccdExpiryDate.trim() &&
    form.cccdIssuePlace.trim() &&
    form.cccdAddress.trim() &&
    form.frontImageUrl &&
    form.backImageUrl;

  // Chọn ảnh từ máy: xem trước ngay bằng data URL, đồng thời upload lên server
  // (POST /uploads/identity) để lấy URL/key thật dùng khi nộp hồ sơ. Upload lỗi
  // thì vẫn giữ base64 làm phương án dự phòng (nộp best-effort).
  const handlePickImage = (previewKey, uploadKey) => async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // cho phép chọn lại cùng 1 file
    if (!file) return;
    try {
      const dataUrl = await readImageAsDataUrl(file);
      setForm((prev) => ({ ...prev, [previewKey]: dataUrl, [uploadKey]: '' }));
      try {
        const url = await profileService.uploadIdentityImage(file);
        if (url) setForm((prev) => ({ ...prev, [uploadKey]: url }));
      } catch {
        /* giữ base64, không chặn UX */
      }
    } catch (err) {
      toast.error(err.message || 'Không tải được ảnh');
    }
  };

  const clearImage = (previewKey, uploadKey) => () =>
    setForm((prev) => ({ ...prev, [previewKey]: '', [uploadKey]: '' }));

  // Lưu hồ sơ CCCD. goToSellerRegister = true thì lưu xong chuyển sang trang
  // đăng ký Người bán; false thì chỉ lưu (nhiều người chỉ muốn cập nhật hồ sơ).
  const handleSave = async (goToSellerRegister = false) => {
    if (!isValid || locked) return;
    setSaving(true);
    try {
      // Ưu tiên URL/key ảnh đã upload lên server; chưa upload được thì dùng base64.
      const frontImage = form.frontImageKey || form.frontImageUrl;
      const backImage = form.backImageKey || form.backImageUrl;

      // 1) Lưu thông tin cá nhân (họ tên, số CCCD, địa chỉ, ảnh) + đẩy địa chỉ lên backend.
      // Dữ liệu này được form đăng ký Người bán đọc lại để hiển thị cho staff duyệt.
      const cccdData = {
        cccdFullName: form.cccdFullName,
        cccdNumber: form.cccdNumber,
        cccdGender: form.cccdGender,
        cccdDateOfBirth: form.cccdDateOfBirth,
        cccdIssueDate: form.cccdIssueDate,
        cccdExpiryDate: form.cccdExpiryDate,
        cccdIssuePlace: form.cccdIssuePlace,
        cccdAddress: form.cccdAddress,
        cccdFrontImageUrl: frontImage,
        cccdBackImageUrl: backImage,
      };
      const saved = await profileService.updateCccdInfo(userId, cccdData);

      // 2) Nộp hồ sơ xác thực CCCD thật (staff duyệt để đủ điều kiện làm seller).
      // Best-effort: nếu backend từ chối ảnh base64 dài, vẫn giữ dữ liệu đã lưu local.
      let updated = saved;
      try {
        updated = await profileService.submitIdentityVerification(userId, {
          fullName: form.cccdFullName.trim(),
          gender: form.cccdGender.trim(),
          dateOfBirth: form.cccdDateOfBirth,
          identityNumber: form.cccdNumber.trim(),
          issueDate: form.cccdIssueDate,
          expiryDate: form.cccdExpiryDate,
          issuePlace: form.cccdIssuePlace.trim(),
          permanentAddress: form.cccdAddress.trim(),
          frontImageUrl: frontImage,
          backImageUrl: backImage,
        });
      } catch {
        /* giữ dữ liệu local, không chặn UX */
      }

      // 3) Đã có đơn/hồ sơ seller (đang chờ duyệt hoặc đã là người bán) thì
      // đồng bộ CCCD mới sang bên seller (Hồ Sơ Shop + trang staff duyệt).
      const syncedToSeller = syncProfileToSellerApplication(userId, cccdData);

      onUpdate(updated);

      if (goToSellerRegister) {
        toast.success('Đã lưu thông tin CCCD. Chuyển sang đăng ký Người bán...');
        navigate('/profile/become-seller');
      } else if (syncedToSeller) {
        toast.success('Đã lưu và đồng bộ sang hồ sơ Người bán');
      } else {
        toast.success('Đã lưu thông tin CCCD');
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Lưu hồ sơ thất bại'));
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
          {status === 'REJECTED' && profile?.identityRejectReason && (
            <> — Lý do: {profile.identityRejectReason}</>
          )}
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
        <div className="personal-info-cccd__row">
          <Select
            label="Giới tính"
            name="cccdGender"
            value={form.cccdGender}
            onChange={handleChange}
            options={GENDERS}
            placeholder="Chọn giới tính"
            disabled={locked}
          />
          <Input
            label="Ngày sinh"
            name="cccdDateOfBirth"
            type="date"
            value={form.cccdDateOfBirth}
            onChange={handleChange}
            disabled={locked}
          />
        </div>
        <div className="personal-info-cccd__row">
          <Input
            label="Ngày cấp"
            name="cccdIssueDate"
            type="date"
            value={form.cccdIssueDate}
            onChange={handleChange}
            disabled={locked}
          />
          <Input
            label="Ngày hết hạn"
            name="cccdExpiryDate"
            type="date"
            value={form.cccdExpiryDate}
            onChange={handleChange}
            disabled={locked}
          />
        </div>
        <Input
          label="Nơi cấp"
          name="cccdIssuePlace"
          value={form.cccdIssuePlace}
          onChange={handleChange}
          placeholder="VD: Cục Cảnh sát QLHC về TTXH"
          disabled={locked}
        />
        <div className="personal-info-cccd__address-wrap">
          <Input
            label="Địa chỉ thường trú"
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
          onPick={handlePickImage('frontImageUrl', 'frontImageKey')}
          onClear={clearImage('frontImageUrl', 'frontImageKey')}
          disabled={locked}
        />
        <CccdImageUpload
          label="Ảnh CCCD mặt sau"
          value={form.backImageUrl}
          onPick={handlePickImage('backImageUrl', 'backImageKey')}
          onClear={clearImage('backImageUrl', 'backImageKey')}
          disabled={locked}
        />
      </div>

      {!locked && (
        <div className="personal-info-cccd__actions">
          <Button variant="outline" disabled={!isValid || saving} onClick={() => handleSave(false)}>
            {saving ? 'Đang xử lý...' : 'Lưu Hồ Sơ'}
          </Button>
          {!isApprovedSeller && (
            <Button variant="accent" disabled={!isValid || saving} onClick={() => handleSave(true)}>
              {saving ? 'Đang xử lý...' : 'Lưu & Đăng Ký Người Bán'}
            </Button>
          )}
        </div>
      )}
    </section>
  );
}
