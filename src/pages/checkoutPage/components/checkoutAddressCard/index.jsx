import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '@/components/common/button';
import Modal from '@/components/common/modal';
import './index.scss';

function formatAddressLine(address) {
  return [
    address.street ?? address.addressLine,
    address.ward ?? address.district,
    address.province,
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
}) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const name = address?.recipientName ?? address?.fullName;
  const phone = address?.recipientPhone ?? address?.phone;
  const line = address ? formatAddressLine(address) : '';

  const handleSelect = (id) => {
    onSelectAddress?.(id);
    setPickerOpen(false);
  };

  return (
    <>
      <section className="checkout-address-card">
        <header className="checkout-address-card__head">
          <h2>Địa Chỉ Nhận Hàng</h2>
          <Button
            variant="outline"
            className="common-btn--sm"
            onClick={() => setPickerOpen(true)}
            disabled={loading}
          >
            Thay Đổi
          </Button>
        </header>

        <div className="checkout-address-card__body">
          {loading && <p className="checkout-address-card__hint">Đang tải địa chỉ...</p>}

          {!loading && !address && (
            <div className="checkout-address-card__empty">
              <p>Bạn chưa có địa chỉ nhận hàng.</p>
              <Link to="/profile/address" className="checkout-address-card__link">
                + Thêm địa chỉ mới
              </Link>
            </div>
          )}

          {!loading && address && (
            <>
              <p className="checkout-address-card__name">
                {name} <span>{phone}</span>
              </p>
              <p className="checkout-address-card__line">{line}</p>
            </>
          )}
        </div>
      </section>

      <Modal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        title="Chọn địa chỉ nhận hàng"
      >
        {addresses.length === 0 ? (
          <div className="checkout-address-picker__empty">
            <p>Chưa có địa chỉ nào.</p>
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

        <div className="checkout-address-picker__footer">
          <Link to="/profile/address" className="checkout-address-picker__link">
            Quản lý địa chỉ
          </Link>
        </div>
      </Modal>
    </>
  );
}
