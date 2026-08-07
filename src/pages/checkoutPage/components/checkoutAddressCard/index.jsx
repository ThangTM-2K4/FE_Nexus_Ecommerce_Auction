import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '@/components/common/button';
import Modal from '@/components/common/modal';
import './index.scss';

function formatAddressLine(address) {
  return [
    address?.street ?? address?.addressLine,
    address?.ward ?? address?.district,
    address?.province ?? address?.city,
  ]
    .filter(Boolean)
    .join(', ');
}

export default function CheckoutAddressCard({
  address,
  addresses = [],
  loading = false,
  selectedAddressId,
  onSelectAddress,
  onAddressChange,
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    country: 'Vietnam',
    addressLine: '',
    cityState: '',
  });

  useEffect(() => {
    if (address) {
      setForm({
        fullName: address.recipientName ?? address.fullName ?? '',
        phone: address.recipientPhone ?? address.phone ?? '',
        email: address.email ?? '',
        country: 'Vietnam',
        addressLine: address.street ?? address.addressLine ?? '',
        cityState: [address.ward, address.district, address.province ?? address.city].filter(Boolean).join(', ') || '',
      });
    }
  }, [address]);

  const handleChange = (field, val) => {
    const updated = { ...form, [field]: val };
    setForm(updated);
    onAddressChange?.(updated);
  };

  const handleSelect = (id) => {
    onSelectAddress?.(id);
    setPickerOpen(false);
  };

  return (
    <>
      <section className="checkout-shipping-info">
        <div className="checkout-shipping-info__header">
          <h2 className="checkout-shipping-info__title">Thông tin giao hàng</h2>
          {addresses.length > 0 && (
            <button
              type="button"
              className="checkout-shipping-info__saved-btn"
              onClick={() => setPickerOpen(true)}
            >
              Chọn địa chỉ đã lưu &gt;
            </button>
          )}
        </div>

        <div className="checkout-shipping-info__form">
          <div className="checkout-field">
            <input
              type="text"
              className="checkout-field__input"
              placeholder="Nhập họ và tên"
              value={form.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
            />
          </div>

          <div className="checkout-field checkout-field--phone">
            <input
              type="tel"
              className="checkout-field__input"
              placeholder="Nhập số điện thoại"
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
            />
            <span className="checkout-field__flag-badge" title="Việt Nam (+84)">
              🇻🇳
            </span>
          </div>

          <div className="checkout-field">
            <input
              type="email"
              className="checkout-field__input"
              placeholder="Nhập email (không bắt buộc)"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
            />
          </div>

          <div className="checkout-field checkout-field--readonly">
            <label className="checkout-field__floating-label">Quốc gia</label>
            <input
              type="text"
              className="checkout-field__input"
              value="Vietnam"
              readOnly
            />
          </div>

          <div className="checkout-field">
            <input
              type="text"
              className="checkout-field__input"
              placeholder="Địa chỉ, tên đường"
              value={form.addressLine}
              onChange={(e) => handleChange('addressLine', e.target.value)}
            />
          </div>

          <div className="checkout-field">
            <input
              type="text"
              className="checkout-field__input"
              placeholder="Tỉnh/TP, Phường/Xã"
              value={form.cityState}
              onChange={(e) => handleChange('cityState', e.target.value)}
            />
          </div>
        </div>
      </section>

      <Modal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        title="Chọn địa chỉ đã lưu"
      >
        {addresses.length === 0 ? (
          <div className="checkout-address-picker__empty">
            <p>Chưa có địa chỉ nào trong tài khoản.</p>
            <Link to="/profile/address" className="checkout-address-picker__link">
              Thêm địa chỉ mới
            </Link>
          </div>
        ) : (
          <ul className="checkout-address-picker">
            {addresses.map((item) => {
              const itemName = item.recipientName ?? item.fullName;
              const itemPhone = item.recipientPhone ?? item.phone;
              const isSelected = item.id === selectedAddressId;

              return (
                <li key={item.id}>
                  <button
                    type="button"
                    className={`checkout-address-picker__item ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => handleSelect(item.id)}
                  >
                    <div className="checkout-address-picker__top">
                      <span className="checkout-address-picker__name">{itemName}</span>
                      <span className="checkout-address-picker__phone">{itemPhone}</span>
                      {item.isDefault && (
                        <span className="checkout-address-picker__default">Mặc định</span>
                      )}
                    </div>
                    <p className="checkout-address-picker__line">{formatAddressLine(item)}</p>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Modal>
    </>
  );
}

