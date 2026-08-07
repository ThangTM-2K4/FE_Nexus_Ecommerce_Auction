import { useEffect, useState } from 'react';
import Radio from '@/components/common/radio';
import { formatPrice } from '@/utils/formatPrice';
import { getWalletState } from '@/services/walletService';
import './index.scss';

export default function CheckoutPayment({
  paymentMethod,
  onPaymentChange,
  note,
  onNoteChange,
  totalAmount = 0,
}) {
  const [walletBalance, setWalletBalance] = useState(1500000);
  const [loadingWallet, setLoadingWallet] = useState(true);

  useEffect(() => {
    let active = true;
    getWalletState()
      .then((res) => {
        if (!active) return;
        const available = res?.walletStats?.availableBalance ?? res?.walletStats?.buyerAvailable ?? 1500000;
        setWalletBalance(available);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoadingWallet(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const hasEnoughBalance = walletBalance >= totalAmount;

  return (
    <section className="checkout-payment">
      <h2 className="checkout-payment__title">Phương Thức Thanh Toán</h2>
      <div className="checkout-payment__options">
        <Radio
          id="payment-cod"
          name="payment-method"
          value="cod"
          label="Thanh toán khi nhận hàng (COD)"
          checked={paymentMethod === 'cod'}
          onChange={onPaymentChange}
        />
        <Radio
          id="payment-transfer"
          name="payment-method"
          value="transfer"
          label="Chuyển khoản / QR"
          checked={paymentMethod === 'transfer'}
          onChange={onPaymentChange}
        />

        <div className={`checkout-payment__wallet-option ${paymentMethod === 'nexus_wallet' ? 'is-selected' : ''}`}>
          <Radio
            id="payment-nexus-wallet"
            name="payment-method"
            value="nexus_wallet"
            checked={paymentMethod === 'nexus_wallet'}
            onChange={onPaymentChange}
            label={
              <div className="checkout-payment__wallet-label">
                <span className="checkout-payment__wallet-title">Thanh toán bằng Ví Nexus</span>
                <span className="checkout-payment__wallet-badge">Khuyên dùng</span>
              </div>
            }
          />
          {paymentMethod === 'nexus_wallet' && (
            <div className="checkout-payment__wallet-info">
              <div className="checkout-payment__wallet-balance-row">
                <span>Số dư Ví Nexus khả dụng:</span>
                <strong>{loadingWallet ? 'Đang tải...' : formatPrice(walletBalance)}</strong>
              </div>
              {!loadingWallet && !hasEnoughBalance && (
                <p className="checkout-payment__wallet-warn">
                  ⚠️ Số dư Ví Nexus không đủ để thanh toán đơn hàng này (Cần thêm {formatPrice(totalAmount - walletBalance)}). Vui lòng nạp thêm tiền vào ví hoặc chọn phương thức khác.
                </p>
              )}
              {!loadingWallet && hasEnoughBalance && (
                <p className="checkout-payment__wallet-success">
                  ✓ Số dư ví đủ để thanh toán trực tiếp cho đơn hàng.
                </p>
              )}
            </div>
          )}
        </div>
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

