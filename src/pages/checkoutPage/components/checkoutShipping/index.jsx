import Radio from '@/components/common/radio';
import { formatPrice } from '@/utils/formatPrice';
import './index.scss';

export const SHIPPING_METHODS = [
  {
    id: 'ghn',
    name: 'Giao Hàng Nhanh (GHN)',
    fee: 30000,
    eta: 'Dự kiến giao 2 - 3 ngày',
  },
  {
    id: 'ghtk',
    name: 'Giao Hàng Tiết Kiệm (GHTK)',
    fee: 22000,
    eta: 'Dự kiến giao 3 - 5 ngày',
  },
  {
    id: 'viettelpost',
    name: 'Viettel Post',
    fee: 25000,
    eta: 'Dự kiến giao 2 - 4 ngày',
  },
  {
    id: 'express',
    name: 'Hỏa Tốc (GrabExpress / Be)',
    fee: 45000,
    eta: 'Giao ngay trong 2 giờ',
  },
];

export default function CheckoutShipping({ selectedMethodId, onSelectMethod }) {
  return (
    <section className="checkout-shipping">
      <h2 className="checkout-shipping__title">Phương Thức Vận Chuyển</h2>
      <div className="checkout-shipping__options">
        {SHIPPING_METHODS.map((method) => {
          const isSelected = selectedMethodId === method.id;
          return (
            <div
              key={method.id}
              className={`checkout-shipping__option ${isSelected ? 'checkout-shipping__option--selected' : ''}`}
              onClick={() => onSelectMethod(method)}
            >
              <Radio
                id={`shipping-${method.id}`}
                name="shipping-method"
                value={method.id}
                checked={isSelected}
                onChange={() => onSelectMethod(method)}
                label={
                  <div className="checkout-shipping__label-content">
                    <div className="checkout-shipping__name-wrap">
                      <span className="checkout-shipping__name">{method.name}</span>
                      <span className="checkout-shipping__eta">{method.eta}</span>
                    </div>
                    <span className="checkout-shipping__fee">{formatPrice(method.fee)}</span>
                  </div>
                }
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
