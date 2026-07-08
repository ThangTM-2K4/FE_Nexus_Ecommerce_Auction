import './index.scss';

const TYPE_LABELS = { home: 'Nhà Riêng', office: 'Văn Phòng' };

export default function AddressCard({ address, onEdit, onDelete, onSetDefault }) {
  const fullAddress = [address.addressLine, address.district, address.province].filter(Boolean).join(', ');

  return (
    <article className="address-card">
      <div className="address-card__head">
        <div>
          <span className="address-card__name">{address.fullName}</span>
          <span className="address-card__phone">{address.phone}</span>
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
