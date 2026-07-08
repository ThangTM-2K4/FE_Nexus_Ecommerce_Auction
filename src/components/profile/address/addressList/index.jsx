import AddressCard from '../addressCard';
import './index.scss';

export default function AddressList({ addresses, onEdit, onDelete, onSetDefault }) {
  return (
    <div className="address-list">
      {addresses.map((addr) => (
        <AddressCard
          key={addr.id}
          address={addr}
          onEdit={onEdit}
          onDelete={onDelete}
          onSetDefault={onSetDefault}
        />
      ))}
    </div>
  );
}
