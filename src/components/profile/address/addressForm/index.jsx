import { useEffect, useState } from 'react';
import Input from '../../../common/input';
import Select from '../../../common/select';
import Checkbox from '../../../common/checkbox';
import { useProvinces, useWards } from '../../../../services/locationService';
import './index.scss';

const emptyForm = {
  fullName: '',
  phone: '',
  provinceCode: '',
  provinceName: '',
  wardCode: '',
  wardName: '',
  addressLine: '',
  type: 'home',
  isDefault: false,
};

export default function AddressForm({ mode = 'create', initial, onSubmit }) {
  const [form, setForm] = useState(emptyForm);
  const { provinces, loading: loadingProvinces } = useProvinces();
  const { wards, loading: loadingWards } = useWards(form.provinceCode);

  // Nạp dữ liệu ban đầu (giữ tên tỉnh/phường để khớp lại khi list tải xong).
  useEffect(() => {
    if (initial) {
      setForm({
        ...emptyForm,
        // Ưu tiên field API mới, fallback field cũ để tương thích ngược.
        fullName: initial.recipientName || initial.fullName || '',
        phone: initial.recipientPhone || initial.phone || '',
        provinceName: initial.province || '',
        wardName: initial.ward || initial.district || '',
        addressLine: initial.street || initial.addressLine || '',
        type: initial.type || 'home',
        isDefault: initial.isDefault || false,
      });
    } else {
      setForm(emptyForm);
    }
  }, [initial, mode]);

  // Khớp tên tỉnh (từ initial) → provinceCode khi danh sách tỉnh đã tải.
  useEffect(() => {
    if (form.provinceName && !form.provinceCode && provinces.length) {
      const match = provinces.find((p) => p.label === form.provinceName);
      if (match) setForm((prev) => ({ ...prev, provinceCode: match.value }));
    }
  }, [provinces, form.provinceName, form.provinceCode]);

  // Khớp tên phường (từ initial) → wardCode khi danh sách phường đã tải.
  useEffect(() => {
    if (form.wardName && !form.wardCode && wards.length) {
      const match = wards.find((w) => w.label === form.wardName);
      if (match) setForm((prev) => ({ ...prev, wardCode: match.value }));
    }
  }, [wards, form.wardName, form.wardCode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProvinceChange = (e) => {
    const provinceCode = e.target.value;
    const provinceName = provinces.find((p) => p.value === provinceCode)?.label || '';
    // Đổi tỉnh → reset phường/xã đã chọn.
    setForm((prev) => ({ ...prev, provinceCode, provinceName, wardCode: '', wardName: '' }));
  };

  const handleWardChange = (e) => {
    const wardCode = e.target.value;
    const wardName = wards.find((w) => w.value === wardCode)?.label || '';
    setForm((prev) => ({ ...prev, wardCode, wardName }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Emit theo contract API mới: recipientName / recipientPhone / province / ward / street.
    onSubmit?.({
      recipientName: form.fullName,
      recipientPhone: form.phone,
      province: form.provinceName,
      ward: form.wardName,
      street: form.addressLine,
      type: form.type,
      isDefault: form.isDefault,
    });
  };

  return (
    <form className="address-form" onSubmit={handleSubmit}>
      <div className="address-form__row">
        <Input label="Họ và tên" name="fullName" value={form.fullName} onChange={handleChange} />
        <Input label="Số điện thoại" name="phone" value={form.phone} onChange={handleChange} />
      </div>

      <div className="address-form__row">
        <Select
          label="Tỉnh / Thành phố"
          name="provinceCode"
          value={form.provinceCode}
          onChange={handleProvinceChange}
          options={provinces}
          placeholder={loadingProvinces ? 'Đang tải tỉnh/thành...' : 'Chọn Tỉnh/Thành phố'}
          disabled={loadingProvinces}
        />
        <Select
          label="Phường / Xã"
          name="wardCode"
          value={form.wardCode}
          onChange={handleWardChange}
          options={wards}
          placeholder={
            !form.provinceCode
              ? 'Chọn Tỉnh/Thành phố trước'
              : loadingWards
                ? 'Đang tải phường/xã...'
                : 'Chọn Phường/Xã'
          }
          disabled={!form.provinceCode || loadingWards}
        />
      </div>

      <Input
        label="Địa chỉ cụ thể"
        name="addressLine"
        value={form.addressLine}
        onChange={handleChange}
        placeholder="Số nhà, tên đường..."
      />

      <div className="address-form__type">
        <span>Loại địa chỉ:</span>
        <div className="address-form__type-btns">
          <button
            type="button"
            className={form.type === 'home' ? 'is-active' : ''}
            onClick={() => setForm((p) => ({ ...p, type: 'home' }))}
          >
            Nhà Riêng
          </button>
          <button
            type="button"
            className={form.type === 'office' ? 'is-active' : ''}
            onClick={() => setForm((p) => ({ ...p, type: 'office' }))}
          >
            Văn Phòng
          </button>
        </div>
      </div>

      <Checkbox
        label="Đặt làm địa chỉ mặc định"
        checked={form.isDefault}
        onChange={(v) => setForm((p) => ({ ...p, isDefault: v }))}
        id="addr-default"
      />

      <button type="submit" className="address-form__submit" hidden>submit</button>
    </form>
  );
}
