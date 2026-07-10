import Button from '@/components/common/button';
import './index.scss';

export default function CheckoutAddressCard({ address }) {
  if (!address) return null;

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
          {address.fullName} <span>{address.phone}</span>
        </p>
        <p className="checkout-address-card__line">
          {address.addressLine}, {address.district}, {address.province}
        </p>
      </div>
    </section>
  );
}
