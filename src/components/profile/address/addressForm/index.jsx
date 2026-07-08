import { useEffect, useState } from 'react';
import Input from '../../../common/input';
import Select from '../../../common/select';
import Checkbox from '../../../common/checkbox';
import { PROVINCE_OPTIONS, DISTRICT_OPTIONS } from '../../../../data/mockAddresses';
import './index.scss';

const emptyForm = {
  fullName: '',
  phone: '',
  provinceCode: '',
  districtCode: '',
  addressLine: '',
  type: 'home',
  isDefault: false,
};

export default function AddressForm({ mode = 'create', initial, onSubmit }) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (initial) {
      const provinceCode = PROVINCE_OPTIONS.find((p) => p.label === initial.province)?.value || '';
      const districtCode = DISTRICT_OPTIONS[provinceCode]?.find((d) => d.label === initial.district)?.value || '';
      setForm({
        fullName: initial.fullName || '',
        phone: initial.phone || '',
        provinceCode,
        districtCode,
        addressLine: initial.addressLine || '',
        type: initial.type || 'home',
        isDefault: initial.isDefault || false,
      });
    } else {
      setForm(emptyForm);
    }
  }, [initial, mode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'provinceCode') next.districtCode = '';
      return next;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const province = PROVINCE_OPTIONS.find((p) => p.value === form.provinceCode)?.label || '';
    const district = DISTRICT_OPTIONS[form.provinceCode]?.find((d) => d.value === form.districtCode)?.label || '';
    onSubmit?.({ ...form, province, district });
  };

  const districtOptions = form.provinceCode ? DISTRICT_OPTIONS[form.provinceCode] || [] : [];

  return (
    <form className="address-form" onSubmit={handleSubmit}>
      <div className="address-form__row">
        <Input label="Họ và tên" name="fullName" value={form.fullName} onChange={handleChange} />
        <Input label="Số điện thoại" name="phone" value={form.phone} onChange={handleChange} />
      </div>

      <Select
        label="Tỉnh/Thành Phố, Quận/Huyện"
        name="provinceCode"
        value={form.provinceCode}
        onChange={handleChange}
        options={PROVINCE_OPTIONS}
        placeholder="Chọn Tỉnh/Thành phố"
      />
      <Select
        name="districtCode"
        value={form.districtCode}
        onChange={handleChange}
        options={districtOptions}
        placeholder="Chọn Quận/Huyện"
      />

      <Input label="Địa chỉ cụ thể" name="addressLine" value={form.addressLine} onChange={handleChange} />

      <div className="address-form__map">
        <button type="button" className="address-form__map-btn">+ Thêm vị trí</button>
      </div>

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
