import { useEffect, useState } from 'react';
import Radio from '@/components/common/radio';
import { formatPrice } from '@/utils/formatPrice';
import { getAvailableShippingMethods, DEFAULT_SHIPPING_METHODS } from '@/services/shippingService';
import './index.scss';

export { DEFAULT_SHIPPING_METHODS as SHIPPING_METHODS };

export default function CheckoutShipping({ selectedMethodId, onSelectMethod }) {
  const [methods, setMethods] = useState(DEFAULT_SHIPPING_METHODS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getAvailableShippingMethods()
      .then((data) => {
        if (!active) return;
        if (Array.isArray(data) && data.length > 0) {
          setMethods(data);
          // If no method selected yet, auto-select first method
          if (!selectedMethodId) {
            onSelectMethod?.(data[0]);
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="checkout-shipping">
      <h2 className="checkout-shipping__title">Phương Thức Vận Chuyển</h2>
      <div className="checkout-shipping__options">
        {loading && <p style={{ fontSize: '0.88rem', color: '#718096' }}>Đang tải các phương thức vận chuyển...</p>}

        {!loading &&
          methods.map((method) => {
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

