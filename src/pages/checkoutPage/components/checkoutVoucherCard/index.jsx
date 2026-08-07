import { useState } from 'react';
import { toast } from 'react-toastify';
import { FiTag, FiChevronRight } from 'react-icons/fi';
import './index.scss';

export default function CheckoutVoucherCard({ onApplyVoucher }) {
  const [code, setCode] = useState('');

  const handleApply = () => {
    if (!code.trim()) {
      toast.error('Vui lòng nhập mã khuyến mãi');
      return;
    }
    toast.success(`Đã áp dụng mã ${code.trim().toUpperCase()}`);
    onApplyVoucher?.(code.trim());
  };

  return (
    <section className="checkout-voucher-card">
      <h2 className="checkout-voucher-card__title">Mã khuyến mãi</h2>

      <div className="checkout-voucher-card__select-row" onClick={() => toast.info('Chức năng chọn mã từ danh sách')}>
        <div className="checkout-voucher-card__select-left">
          <FiTag className="checkout-voucher-card__ticket-icon" />
          <span>Chọn mã</span>
        </div>
        <FiChevronRight className="checkout-voucher-card__arrow" />
      </div>


      <div className="checkout-voucher-card__input-row">
        <input
          type="text"
          className="checkout-voucher-card__input"
          placeholder="Nhập mã khuyến mãi"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <button
          type="button"
          className="checkout-voucher-card__apply-btn"
          onClick={handleApply}
        >
          Áp dụng
        </button>
      </div>
    </section>
  );
}
