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
];

// Chỉ hiển thị được base64 (data:) hoặc URL đầy đủ (http). Nếu value là KEY server
// (vd "identity/abc.jpg") thì <img> sẽ vỡ ảnh -> coi như không có ảnh xem trước.
const isDisplayableImage = (v) =>
  typeof v === 'string' && (v.startsWith('data:') || v.startsWith('http'));

// Che số CCCD, chỉ để lộ 4 số cuối: 079198001234 -> ********1234
const maskCccd = (num) => {
  const s = String(num || '').trim();
  if (s.length <= 4) return s;
  return '*'.repeat(s.length - 4) + s.slice(-4);
};

// Hiển thị ngày ISO (yyyy-mm-dd) dạng dd/mm/yyyy cho dễ đọc.
const formatDate = (iso) => {
  const s = String(iso || '').trim();
  const [y, m, d] = s.split('-');
  return d && m && y ? `${d}/${m}/${y}` : s || '—';
};

// Ô tải ảnh CCCD trực tiếp từ máy (không dán URL nữa)
function CccdImageUpload({ label, value, onPick, onClear, disabled, error }) {
  // Nếu ảnh tải hỏng (vd URL nội bộ backend không truy cập được) thì coi như chưa
  // có ảnh -> hiện lại nút chọn ảnh thay vì icon ảnh vỡ.
  const [loadError, setLoadError] = useState(false);
  useEffect(() => setLoadError(false), [value]);
  const canShow = isDisplayableImage(value) && !loadError;
  return (
    <div className="personal-info-cccd__upload">
      <span className="personal-info-cccd__upload-label">{label}</span>
      {canShow ? (
        <div className="personal-info-cccd__preview">
          <img src={value} alt={label} onError={() => setLoadError(true)} />
          {!disabled && (
            <button type="button" className="personal-info-cccd__preview-remove" onClick={onClear}>
              Xoá ảnh
            </button>
          )}
        </div>
      ) : (
        <label
          className={`personal-info-cccd__upload-btn ${disabled ? 'is-disabled' : ''} ${
            error ? 'has-error' : ''
          }`.trim()}
        >
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
      {error && <span className="personal-info-cccd__error">{error}</span>}
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
    frontImageUrl: '', // data URL để XEM TRƯỚC (hiển thị được, không vỡ ảnh)
    backImageUrl: '',
    frontImageKey: '', // KEY ảnh sau khi upload lên server (dùng khi NỘP, không hiển thị)
    backImageKey: '',
    frontImageFile: null, // giữ File để upload lại lúc lưu nếu upload nền chưa xong/lỗi
    backImageFile: null,
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

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
        frontImageKey: profile.cccdFrontImageKey || '',
        backImageKey: profile.cccdBackImageKey || '',
      }));
    }
  }, [profile]);

  const status = profile?.identityStatus || null;
  const statusMeta = status ? STATUS_META[status] : null;
  // Đã xác minh hoặc đang chờ duyệt thì khoá không cho nộp lại
  const locked = status === 'APPROVED' || status === 'VERIFIED' || status === 'PENDING';

  // Xoá lỗi của field ngay khi người dùng sửa lại
  const clearError = (name) =>
    setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'cccdAddress' && value.length > MAX_ADDRESS_LEN) return;
    setForm((prev) => ({ ...prev, [name]: value }));
    clearError(name);
  };

  // Kiểm tra bắt buộc: thiếu bất kỳ field nào cũng chặn lưu & hiện lỗi đỏ.
  const validate = () => {
    const e = {};
    if (!form.cccdFullName.trim()) e.cccdFullName = 'Vui lòng nhập họ và tên';
    if (!form.cccdNumber.trim()) e.cccdNumber = 'Vui lòng nhập số CCCD';
    else if (!/^(\d{9}|\d{12})$/.test(form.cccdNumber.trim()))
      e.cccdNumber = 'Số CCCD phải gồm 9 hoặc 12 chữ số';
    if (!form.cccdGender.trim()) e.cccdGender = 'Vui lòng chọn giới tính';
    if (!form.cccdDateOfBirth.trim()) e.cccdDateOfBirth = 'Vui lòng chọn ngày sinh';
    if (!form.cccdIssueDate.trim()) e.cccdIssueDate = 'Vui lòng chọn ngày cấp';
    if (!form.cccdExpiryDate.trim()) e.cccdExpiryDate = 'Vui lòng chọn ngày hết hạn';
    else if (form.cccdIssueDate && form.cccdExpiryDate <= form.cccdIssueDate)
      e.cccdExpiryDate = 'Ngày hết hạn phải sau ngày cấp';
    if (!form.cccdIssuePlace.trim()) e.cccdIssuePlace = 'Vui lòng nhập nơi cấp';
    if (!form.cccdAddress.trim()) e.cccdAddress = 'Vui lòng nhập địa chỉ thường trú';
    if (!form.frontImageUrl) e.frontImageUrl = 'Vui lòng tải ảnh CCCD mặt trước';
    if (!form.backImageUrl) e.backImageUrl = 'Vui lòng tải ảnh CCCD mặt sau';
    return e;
  };

  // Chọn ảnh từ máy: xem trước ngay bằng data URL, đồng thời upload lên server
  // (POST /uploads/identity) để lấy URL/key thật dùng khi nộp hồ sơ. Upload lỗi
  // thì vẫn giữ base64 làm phương án dự phòng (nộp best-effort).
  const handlePickImage = (previewKey, uploadKey, fileKey) => async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // cho phép chọn lại cùng 1 file
    if (!file) return;
    try {
      const dataUrl = await readImageAsDataUrl(file);
      // Giữ File để nếu upload nền lỗi thì còn upload lại được lúc bấm Lưu.
      setForm((prev) => ({ ...prev, [previewKey]: dataUrl, [uploadKey]: '', [fileKey]: file }));
      clearError(previewKey);
      try {
        const key = await profileService.uploadIdentityImage(file);
        if (key) setForm((prev) => ({ ...prev, [uploadKey]: key }));
      } catch {
        /* upload lại lúc lưu; không chặn UX */
      }
    } catch (err) {
      toast.error(err.message || 'Không tải được ảnh');
    }
  };

  const clearImage = (previewKey, uploadKey, fileKey) => () =>
    setForm((prev) => ({ ...prev, [previewKey]: '', [uploadKey]: '', [fileKey]: null }));

  // Lưu hồ sơ CCCD. goToSellerRegister = true thì lưu xong chuyển sang trang
  // đăng ký Người bán; false thì chỉ lưu (nhiều người chỉ muốn cập nhật hồ sơ).
  const handleSave = async (goToSellerRegister = false) => {
    if (locked) return;
    const foundErrors = validate();
    if (Object.keys(foundErrors).length) {
      setErrors(foundErrors);
      toast.error('Vui lòng điền đầy đủ và đúng thông tin CCCD');
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      // Đảm bảo có KEY ảnh trên server để nộp hồ sơ. Nếu lúc chọn ảnh upload nền
      // chưa xong/lỗi, thử upload lại tại đây bằng File đã giữ.
      let frontKey = form.frontImageKey;
      let backKey = form.backImageKey;
      try {
        if (!frontKey && form.frontImageFile)
          frontKey = await profileService.uploadIdentityImage(form.frontImageFile);
        if (!backKey && form.backImageFile)
          backKey = await profileService.uploadIdentityImage(form.backImageFile);
      } catch {
        /* nếu vẫn thiếu key, bước nộp bên dưới sẽ báo lỗi rõ ràng */
      }

      // 1) Lưu thông tin cá nhân vào hồ sơ. Ảnh XEM TRƯỚC lưu bằng base64 (hiển thị
      // được, không vỡ ảnh); KEY server lưu riêng để nộp/nộp lại. Dữ liệu này được
      // form đăng ký Người bán đọc lại để hiển thị cho staff duyệt.
      const cccdData = {
        cccdFullName: form.cccdFullName,
        cccdNumber: form.cccdNumber,
        cccdGender: form.cccdGender,
        cccdDateOfBirth: form.cccdDateOfBirth,
        cccdIssueDate: form.cccdIssueDate,
        cccdExpiryDate: form.cccdExpiryDate,
        cccdIssuePlace: form.cccdIssuePlace,
        cccdAddress: form.cccdAddress,
        cccdFrontImageUrl: form.frontImageUrl, // base64 để HIỂN THỊ
        cccdBackImageUrl: form.backImageUrl,
        cccdFrontImageKey: frontKey, // key server để NỘP
        cccdBackImageKey: backKey,
      };
      await profileService.updateCccdInfo(userId, cccdData);

      // 2) Nộp hồ sơ xác thực CCCD vào DATABASE (POST /identity-verifications).
      // Đây là bước lưu thật — KHÔNG nuốt lỗi để người dùng biết nếu lưu thất bại.
      const updated = await profileService.submitIdentityVerification(userId, {
        fullName: form.cccdFullName.trim(),
        gender: form.cccdGender.trim(),
        dateOfBirth: form.cccdDateOfBirth,
        identityNumber: form.cccdNumber.trim(),
        issueDate: form.cccdIssueDate,
        expiryDate: form.cccdExpiryDate,
        issuePlace: form.cccdIssuePlace.trim(),
        permanentAddress: form.cccdAddress.trim(),
        frontImageKey: frontKey,
        backImageKey: backKey,
      });

      // 3) Đã có đơn/hồ sơ seller (đang chờ duyệt hoặc đã là người bán) thì
      // đồng bộ CCCD mới sang bên seller (Hồ Sơ Shop + trang staff duyệt).
      const syncedToSeller = syncProfileToSellerApplication(userId, cccdData);

      // Cập nhật key ảnh vào state để lần lưu sau không phải upload lại.
      setForm((prev) => ({ ...prev, frontImageKey: frontKey, backImageKey: backKey }));
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

      {locked ? (
        // Đã xác minh / đang chờ duyệt: chỉ hiển thị thông tin (đọc), không cho nhập.
        // Số CCCD che bớt, không hiển thị ảnh CCCD.
        <div className="personal-info-cccd__table-card">
          <table className="personal-info-cccd__table">
            <tbody>
              <tr>
                <td className="col-half">
                  <span className="tb-label">Họ và tên</span>
                  <strong className="tb-value">{form.cccdFullName || '—'}</strong>
                </td>
                <td className="col-half">
                  <span className="tb-label">Số CCCD</span>
                  <strong className="tb-value">{maskCccd(form.cccdNumber) || '—'}</strong>
                </td>
              </tr>
              <tr>
                <td className="col-half">
                  <span className="tb-label">Giới tính</span>
                  <strong className="tb-value">{form.cccdGender || '—'}</strong>
                </td>
                <td className="col-half">
                  <span className="tb-label">Ngày sinh</span>
                  <strong className="tb-value">{formatDate(form.cccdDateOfBirth)}</strong>
                </td>
              </tr>
              <tr>
                <td className="col-half">
                  <span className="tb-label">Ngày cấp</span>
                  <strong className="tb-value">{formatDate(form.cccdIssueDate)}</strong>
                </td>
                <td className="col-half">
                  <span className="tb-label">Ngày hết hạn</span>
                  <strong className="tb-value">{formatDate(form.cccdExpiryDate)}</strong>
                </td>
              </tr>
              <tr>
                <td colSpan={2} className="col-full">
                  <span className="tb-label">Nơi cấp</span>
                  <strong className="tb-value">{form.cccdIssuePlace || '—'}</strong>
                </td>
              </tr>
              <tr>
                <td colSpan={2} className="col-full">
                  <span className="tb-label">Địa chỉ thường trú</span>
                  <strong className="tb-value">{form.cccdAddress || '—'}</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
      <div className="personal-info-cccd__fields">
        <Input
          label="Họ và tên"
          name="cccdFullName"
          value={form.cccdFullName}
          onChange={handleChange}
          placeholder="Họ và tên đầy đủ trên CCCD"
          disabled={locked}
          error={errors.cccdFullName}
        />
        <Input
          label="Số CCCD"
          name="cccdNumber"
          value={form.cccdNumber}
          onChange={handleChange}
          placeholder="Số định danh cá nhân trên CCCD"
          disabled={locked}
          error={errors.cccdNumber}
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
            error={errors.cccdGender}
          />
          <Input
            label="Ngày sinh"
            name="cccdDateOfBirth"
            type="date"
            value={form.cccdDateOfBirth}
            onChange={handleChange}
            disabled={locked}
            error={errors.cccdDateOfBirth}
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
            error={errors.cccdIssueDate}
          />
          <Input
            label="Ngày hết hạn"
            name="cccdExpiryDate"
            type="date"
            value={form.cccdExpiryDate}
            onChange={handleChange}
            disabled={locked}
            error={errors.cccdExpiryDate}
          />
        </div>
        <Input
          label="Nơi cấp"
          name="cccdIssuePlace"
          value={form.cccdIssuePlace}
          onChange={handleChange}
          placeholder="VD: Cục Cảnh sát QLHC về TTXH"
          disabled={locked}
          error={errors.cccdIssuePlace}
        />
        <div className="personal-info-cccd__address-wrap">
          <Input
            label="Địa chỉ thường trú"
            name="cccdAddress"
            value={form.cccdAddress}
            onChange={handleChange}
            placeholder="Địa chỉ Nơi thường trú trên CCCD"
            disabled={locked}
            error={errors.cccdAddress}
          />
          <span className="personal-info-cccd__counter">
            {form.cccdAddress.length}/{MAX_ADDRESS_LEN}
          </span>
        </div>
        <CccdImageUpload
          label="Ảnh CCCD mặt trước"
          value={form.frontImageUrl}
          onPick={handlePickImage('frontImageUrl', 'frontImageKey', 'frontImageFile')}
          onClear={clearImage('frontImageUrl', 'frontImageKey', 'frontImageFile')}
          disabled={locked}
          error={errors.frontImageUrl}
        />
        <CccdImageUpload
          label="Ảnh CCCD mặt sau"
          value={form.backImageUrl}
          onPick={handlePickImage('backImageUrl', 'backImageKey', 'backImageFile')}
          onClear={clearImage('backImageUrl', 'backImageKey', 'backImageFile')}
          disabled={locked}
          error={errors.backImageUrl}
        />
      </div>
      )}

      {!locked && (
        <div className="personal-info-cccd__actions">
          <Button variant="outline" disabled={saving} onClick={() => handleSave(false)}>
            {saving ? 'Đang xử lý...' : 'Lưu Hồ Sơ'}
          </Button>
          {!isApprovedSeller && (
            <Button variant="accent" disabled={saving} onClick={() => handleSave(true)}>
              {saving ? 'Đang xử lý...' : 'Lưu & Đăng Ký Người Bán'}
            </Button>
          )}
        </div>
      )}
    </section>
  );
}
