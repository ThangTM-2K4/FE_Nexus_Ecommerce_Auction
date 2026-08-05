import { useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-toastify';
import { createTopUpCheckout } from '../../services/walletService';
import { useAuth } from '../../context/AuthContext';
import './TopUpModal.scss';

const PRESET_AMOUNTS = [100000, 200000, 500000, 1000000, 2000000, 5000000];

export default function TopUpModal({ onClose, onSuccess }) {
  const { user, isBuyerMode } = useAuth();
  const [amount, setAmount] = useState(500000);
  const [customAmount, setCustomAmount] = useState('');
  const [provider, setProvider] = useState('VNPAY');
  const [loading, setLoading] = useState(false);

  const selectedAmount = customAmount ? Number(customAmount) : amount;

  const handleTopUp = async () => {
    if (!selectedAmount || selectedAmount < 10000) {
      toast.error('Số tiền nạp tối thiểu là 10.000 ₫');
      return;
    }

    setLoading(true);
    try {
      const res = await createTopUpCheckout({
        amount: selectedAmount,
        provider,
        walletType: 'BUYER',
      });

      if (res?.checkoutUrl && res.checkoutUrl.startsWith('http')) {
        toast.info('Đang chuyển hướng sang cổng thanh toán ' + provider + '...');
        window.location.href = res.checkoutUrl;
      } else {
        toast.success(`Tạo yêu cầu nạp tiền thành công! +${selectedAmount.toLocaleString('vi-VN')} ₫.`);
        onSuccess?.();
        onClose?.();
      }
    } catch (err) {
      const status = err?.response?.status;
      const apiDetail = err?.response?.data?.detail || err?.response?.data?.title;
      if (status === 409) {
        toast.warning(apiDetail || 'Giao dịch nạp tiền trước đó đang chờ xử lý. Vui lòng thử lại sau hoặc kiểm tra lại lịch sử nạp.');
      } else {
        toast.error(apiDetail || err?.message || 'Tạo yêu cầu nạp tiền thất bại');
      }
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="topup-modal-overlay" onClick={(e) => { e.stopPropagation(); onClose?.(); }} role="presentation">
      <div className="topup-modal" onClick={(e) => e.stopPropagation()} role="dialog">
        <div className="topup-modal-header">
          <h3>💳 Nạp tiền vào Ví Nexus Pay</h3>
          <button type="button" className="topup-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="topup-modal-body">
          <p className="topup-hint">
            Tài khoản: <strong>{user?.fullName}</strong> ({isBuyerMode ? 'Ví Người mua' : 'Ví Người bán'})
          </p>

          <div className="topup-section-title">Chọn số tiền nạp (VND):</div>
          <div className="topup-preset-grid">
            {PRESET_AMOUNTS.map((val) => (
              <button
                key={val}
                type="button"
                className={`topup-preset-btn ${!customAmount && amount === val ? 'active' : ''}`}
                onClick={() => {
                  setAmount(val);
                  setCustomAmount('');
                }}
              >
                {val.toLocaleString('vi-VN')} ₫
              </button>
            ))}
          </div>

          <div className="topup-input-group">
            <label htmlFor="custom-amount-input">Số tiền khác:</label>
            <input
              id="custom-amount-input"
              type="number"
              min="10000"
              step="10000"
              placeholder="Nhập số tiền..."
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
            />
          </div>

          <div className="topup-section-title">Phương thức thanh toán:</div>
          <div className="topup-provider-grid">
            <button
              type="button"
              className={`topup-provider-btn ${provider === 'VNPAY' ? 'active' : ''}`}
              onClick={() => setProvider('VNPAY')}
            >
              <span className="provider-logo">💳</span>
              <div>
                <strong>Cổng thanh toán VNPay</strong>
                <small>Thẻ ATM / QR Code / Internet Banking</small>
              </div>
            </button>
          </div>

          <div className="topup-summary">
            <span>Tổng tiền nạp:</span>
            <strong className="topup-total-val">{selectedAmount.toLocaleString('vi-VN')} ₫</strong>
          </div>
        </div>

        <div className="topup-modal-footer">
          <button type="button" className="topup-cancel-btn" onClick={onClose} disabled={loading}>
            Hủy
          </button>
          <button type="button" className="topup-submit-btn" onClick={handleTopUp} disabled={loading}>
            {loading ? 'Đang xử lý...' : `Thanh toán ${provider}`}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
