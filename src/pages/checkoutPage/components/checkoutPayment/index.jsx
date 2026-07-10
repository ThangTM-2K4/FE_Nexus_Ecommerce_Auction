import Radio from '@/components/common/radio';
import './index.scss';

const PAYMENT_OPTIONS = [
  { value: 'cod', label: 'Thanh toán khi nhận hàng (COD)' },
  { value: 'transfer', label: 'Chuyển khoản/QR' },
];

export default function CheckoutPayment({ paymentMethod, onPaymentChange, note, onNoteChange }) {
  return (
    <section className="checkout-payment">
      <h2 className="checkout-payment__title">Phương Thức Thanh Toán</h2>
      <div className="checkout-payment__options">
        {PAYMENT_OPTIONS.map((opt) => (
          <Radio
            key={opt.value}
            id={`payment-${opt.value}`}
            name="payment-method"
            value={opt.value}
            label={opt.label}
            checked={paymentMethod === opt.value}
            onChange={onPaymentChange}
          />
        ))}
      </div>

      <label className="checkout-payment__note-label" htmlFor="checkout-note">
        Lời nhắn cho người bán (tuỳ chọn)
      </label>
      <textarea
        id="checkout-note"
        className="checkout-payment__note"
        value={note}
        onChange={(e) => onNoteChange(e.target.value)}
        placeholder="Ghi chú cho shop..."
        rows={3}
      />
    </section>
  );
}
