import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import * as profileService from '../../../services/profileService';
import Input from '../../common/input';
import Button from '../../common/button';
import './index.scss';

const MAX_ADDRESS_LEN = 200;

export default function PersonalInfoCccd({ userId, profile, onUpdate }) {
  const [form, setForm] = useState({
    cccdFullName: '',
    cccdNumber: '',
    cccdAddress: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        cccdFullName: profile.cccdFullName || '',
        cccdNumber: profile.cccdNumber || '',
        cccdAddress: profile.cccdAddress || '',
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'cccdAddress' && value.length > MAX_ADDRESS_LEN) return;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const isValid = form.cccdFullName.trim() && form.cccdNumber.trim() && form.cccdAddress.trim();

  const handleConfirm = async () => {
    if (!isValid) return;
    setSaving(true);
    try {
      const updated = await profileService.updateProfile(userId, form);
      onUpdate(updated);
      toast.success('Xác nhận thông tin CCCD thành công');
    } catch {
      toast.error('Xác nhận thất bại');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="personal-info-cccd">
      <h1 className="personal-info-cccd__title">Thông tin cá nhân</h1>
      <p className="personal-info-cccd__desc">
        Bạn vui lòng nhập chính xác thông tin CCCD để đơn hàng được thông quan theo quy định từ ngày 9/7.
        Thông tin sẽ được bảo mật theo Chính sách Bảo mật Shopee
      </p>
      <hr className="personal-info-cccd__divider" />

      <div className="personal-info-cccd__fields">
        <Input
          label="Họ và tên"
          name="cccdFullName"
          value={form.cccdFullName}
          onChange={handleChange}
          placeholder="Họ và tên đầy đủ trên CCCD"
        />
        <Input
          label="Số CCCD"
          name="cccdNumber"
          value={form.cccdNumber}
          onChange={handleChange}
          placeholder="Số định danh cá nhân trên CCCD"
        />
        <div className="personal-info-cccd__address-wrap">
          <Input
            label="Địa chỉ"
            name="cccdAddress"
            value={form.cccdAddress}
            onChange={handleChange}
            placeholder="Địa chỉ Nơi thường trú trên CCCD"
          />
          <span className="personal-info-cccd__counter">
            {form.cccdAddress.length}/{MAX_ADDRESS_LEN}
          </span>
        </div>
      </div>

      <div className="personal-info-cccd__actions">
        <Button variant="accent" disabled={!isValid || saving} onClick={handleConfirm}>
          {saving ? 'Đang xử lý...' : 'Xác Nhận'}
        </Button>
      </div>
    </section>
  );
}
