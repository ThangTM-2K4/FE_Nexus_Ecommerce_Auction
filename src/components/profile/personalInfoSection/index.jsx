import { useState } from 'react';
import { toast } from 'react-toastify';
import * as profileService from '../../../services/profileService';
import { getApiErrorMessage } from '../../../utils/apiResponse';
import Select from '../../common/select';

const GENDERS = [
  { value: 'male', label: 'Nam' },
  { value: 'female', label: 'Nữ' },
  { value: 'other', label: 'Khác' },
];

export default function PersonalInfoSection({ userId, profile, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});

  const startEdit = () => {
    setForm({ ...profile });
    setEditing(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await profileService.updateProfile(userId, form);
      onUpdate(updated);
      setEditing(false);
      toast.success('Cập nhật thông tin thành công');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Cập nhật thông tin thất bại'));
    } finally {
      setSaving(false);
    }
  };

  const data = editing ? form : profile;
  const initials = data.fullName
    ?.split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <section className="profile-section" id="personal-info">
      <div className="profile-section-header">
        <h2>Thông tin cá nhân</h2>
        {!editing ? (
          <button type="button" className="profile-btn profile-btn--outline" onClick={startEdit}>
            Chỉnh sửa
          </button>
        ) : (
          <div className="profile-section-actions">
            <button type="button" className="profile-btn profile-btn--ghost" onClick={() => setEditing(false)}>
              Hủy
            </button>
            <button type="button" className="profile-btn profile-btn--primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        )}
      </div>

      <div className="profile-personal-grid">
        <div className="profile-avatar-block">
          <span className="profile-avatar">{initials}</span>
          {editing && (
            <button type="button" className="profile-btn profile-btn--ghost profile-btn--sm">
              Đổi ảnh (mock)
            </button>
          )}
        </div>

        <div className="profile-fields">
          <div className="profile-field">
            <label>Họ và tên</label>
            {editing ? (
              <input name="fullName" value={data.fullName || ''} onChange={handleChange} />
            ) : (
              <span>{data.fullName || '—'}</span>
            )}
          </div>
          <div className="profile-field">
            <label>Tên đăng nhập</label>
            {editing ? (
              <input name="username" value={data.username || ''} onChange={handleChange} />
            ) : (
              <span>{data.username || '—'}</span>
            )}
          </div>
          <div className="profile-field">
            <label>Email</label>
            {editing ? (
              <input name="email" type="email" value={data.email || ''} onChange={handleChange} />
            ) : (
              <span>{data.email || '—'}</span>
            )}
          </div>
          <div className="profile-field">
            <label>Số điện thoại</label>
            {editing ? (
              <input name="phone" value={data.phone || ''} onChange={handleChange} />
            ) : (
              <span>{data.phone || '—'}</span>
            )}
          </div>
          <div className="profile-field">
            <label>Ngày sinh</label>
            {editing ? (
              <input name="dateOfBirth" type="date" value={data.dateOfBirth || ''} onChange={handleChange} />
            ) : (
              <span>{data.dateOfBirth ? new Date(data.dateOfBirth).toLocaleDateString('vi-VN') : '—'}</span>
            )}
          </div>
          <div className="profile-field">
            <label>Giới tính</label>
            {editing ? (
              <Select
                name="gender"
                value={data.gender || ''}
                onChange={handleChange}
                options={GENDERS}
                placeholder="Chọn giới tính"
              />
            ) : (
              <span>{GENDERS.find((g) => g.value === data.gender)?.label || '—'}</span>
            )}
          </div>
          <div className="profile-field profile-field--full">
            <label>Địa chỉ</label>
            {editing ? (
              <input name="address" value={data.address || ''} onChange={handleChange} />
            ) : (
              <span>{data.address || '—'}</span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
