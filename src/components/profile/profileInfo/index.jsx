import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import * as profileService from '../../../services/profileService';
import Button from '../../common/button';
import './index.scss';

const GENDERS = [
  { value: 'male', label: 'Nam' },
  { value: 'female', label: 'Nữ' },
  { value: 'other', label: 'Khác' },
];

export default function ProfileInfo({ userId, profile, onUpdate }) {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) setForm({ ...profile });
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await profileService.updateProfile(userId, form);
      onUpdate(updated);
      toast.success('Cập nhật hồ sơ thành công');
    } catch {
      toast.error('Cập nhật thất bại');
    } finally {
      setSaving(false);
    }
  };

  const initials = form.fullName
    ?.split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <section className="profile-info">
      <div className="profile-info__grid">
        <div className="profile-info__fields">
          <div className="profile-info__field">
            <label>Tên đăng nhập</label>
            <input name="username" value={form.username || ''} onChange={handleChange} />
          </div>
          <div className="profile-info__field">
            <label>Tên</label>
            <input name="fullName" value={form.fullName || ''} onChange={handleChange} />
          </div>
          <div className="profile-info__field">
            <label>Email</label>
            <input name="email" type="email" value={form.email || ''} onChange={handleChange} />
          </div>
          <div className="profile-info__field">
            <label>Số điện thoại</label>
            <input name="phone" value={form.phone || ''} onChange={handleChange} />
          </div>
          <div className="profile-info__field">
            <label>Giới tính</label>
            <select name="gender" value={form.gender || ''} onChange={handleChange}>
              <option value="">Chọn giới tính</option>
              {GENDERS.map((g) => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>
          </div>
          <div className="profile-info__field">
            <label>Ngày sinh</label>
            <input name="dateOfBirth" type="date" value={form.dateOfBirth || ''} onChange={handleChange} />
          </div>
        </div>

        <div className="profile-info__avatar-block">
          <div className="profile-info__avatar">{initials || '?'}</div>
          <button type="button" className="profile-info__upload-btn">
            Chọn ảnh
          </button>
          <p className="profile-info__upload-hint">Dung lượng tối đa 1MB<br />Định dạng: .JPEG, .PNG</p>
        </div>
      </div>

      <div className="profile-info__actions">
        <Button variant="accent" onClick={handleSave} disabled={saving}>
          {saving ? 'Đang lưu...' : 'Lưu'}
        </Button>
      </div>
    </section>
  );
}
