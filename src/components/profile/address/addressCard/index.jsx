import './index.scss';

const TYPE_LABELS = { home: 'Nhà Riêng', office: 'Văn Phòng' };

export default function AddressCard({ address, onEdit, onDelete, onSetDefault }) {
  const street = address.street ?? address.addressLine;
  const ward = address.ward ?? address.district;
  const name = address.recipientName ?? address.fullName;
  const phone = address.recipientPhone ?? address.phone;
  const fullAddress = [street, ward, address.province].filter(Boolean).join(', ');

  return (
    <article className="address-card">
      <div className="address-card__head">
        <div>
          <span className="address-card__name">{name}</span>
          <span className="address-card__phone">{phone}</span>
        </div>
        <div className="address-card__tags">
          <span className="address-card__type">{TYPE_LABELS[address.type] || address.type}</span>
          {address.isDefault && <span className="address-card__default">Mặc định</span>}
        </div>
      </div>
      <p className="address-card__line">{fullAddress}</p>
      <div className="address-card__actions">
        <button type="button" onClick={() => onEdit(address)}>Sửa</button>
        <button type="button" onClick={() => onDelete(address.id)}>Xóa</button>
        {!address.isDefault && (
          <button type="button" className="address-card__set-default" onClick={() => onSetDefault(address.id)}>
            Thiết lập mặc định
          </button>
        )}
      </div>
    </article>
  );
}
