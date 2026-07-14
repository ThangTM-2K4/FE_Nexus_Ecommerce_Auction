import Button from '@/components/common/button';
import './index.scss';

export default function CheckoutAddressCard({ address }) {
  if (!address) return null;

  const name = address.recipientName ?? address.fullName;
  const phone = address.recipientPhone ?? address.phone;
  const line = [
    address.street ?? address.addressLine,
    address.ward ?? address.district,
    address.province,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <section className="checkout-address-card">
      <header className="checkout-address-card__head">
        <h2>Địa Chỉ Nhận Hàng</h2>
        <Button variant="outline" className="common-btn--sm">
          Thay Đổi
        </Button>
      </header>
      <div className="checkout-address-card__body">
        <p className="checkout-address-card__name">
          {name} <span>{phone}</span>
        </p>
        <p className="checkout-address-card__line">{line}</p>
      </div>
    </section>
  );
}
