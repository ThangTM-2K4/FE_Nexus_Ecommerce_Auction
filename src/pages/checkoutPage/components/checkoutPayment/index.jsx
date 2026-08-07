import { useEffect, useState } from 'react';
import Radio from '@/components/common/radio';
import { formatPrice } from '@/utils/formatPrice';
import { getWalletState } from '@/services/walletService';
import './index.scss';

export default function CheckoutPayment({
  paymentMethod,
  onPaymentChange,
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
    <section className="checkout-payment-card">
      <h2 className="checkout-payment-card__title">Phương thức thanh toán</h2>
      <div className="checkout-payment-card__options">
        {/* COD Option */}
        <div
          className={`checkout-payment-card__item ${paymentMethod === 'cod' ? 'is-selected' : ''}`}
          onClick={() => onPaymentChange('cod')}
        >
          <Radio
            id="payment-cod"
            name="payment-method"
            value="cod"
            checked={paymentMethod === 'cod'}
            onChange={onPaymentChange}
            label={
              <div className="checkout-payment-card__item-label">
                <span>📦</span>
                <span>Thanh toán khi nhận hàng (COD)</span>
              </div>
            }
          />
        </div>

        {/* Bank Transfer Option */}
        <div
          className={`checkout-payment-card__item ${paymentMethod === 'transfer' ? 'is-selected' : ''}`}
          onClick={() => onPaymentChange('transfer')}
        >
          <Radio
            id="payment-transfer"
            name="payment-method"
            value="transfer"
            checked={paymentMethod === 'transfer'}
            onChange={onPaymentChange}
            label={
              <div className="checkout-payment-card__item-label">
                <span>🏦</span>
                <span>Chuyển khoản qua ngân hàng / QR Code</span>
              </div>
            }
          />
        </div>

        {/* VNPay Option */}
        <div
          className={`checkout-payment-card__item ${paymentMethod === 'vnpay' ? 'is-selected' : ''}`}
          onClick={() => onPaymentChange('vnpay')}
        >
          <Radio
            id="payment-vnpay"
            name="payment-method"
            value="vnpay"
            checked={paymentMethod === 'vnpay'}
            onChange={onPaymentChange}
            label={
              <div className="checkout-payment-card__item-label">
                <span>💳</span>
                <span>Thanh toán online qua cổng VNPay</span>
                <span className="checkout-payment-card__icons">
                  <span className="payment-icon-tag">ATM</span>
                  <span className="payment-icon-tag">VISA</span>
                  <span className="payment-icon-tag">MasterCard</span>
                </span>
              </div>
            }
          />
        </div>

        {/* Nexus Wallet Option */}
        <div
          className={`checkout-payment-card__item ${paymentMethod === 'nexus_wallet' ? 'is-selected' : ''}`}
          onClick={() => onPaymentChange('nexus_wallet')}
        >
          <Radio
            id="payment-nexus-wallet"
            name="payment-method"
            value="nexus_wallet"
            checked={paymentMethod === 'nexus_wallet'}
            onChange={onPaymentChange}
            label={
              <div className="checkout-payment-card__item-label">
                <span>👛</span>
                <span>Thanh toán bằng Ví Nexus</span>
                <span className="checkout-payment-card__badge">Khuyên dùng</span>
              </div>
            }
          />
          {paymentMethod === 'nexus_wallet' && (
            <div className="checkout-payment-card__wallet-info">
              <div className="checkout-payment-card__balance-row">
                <span>Số dư Ví Nexus khả dụng:</span>
                <strong>{loadingWallet ? 'Đang tải...' : formatPrice(walletBalance)}</strong>
              </div>
              {!loadingWallet && !hasEnoughBalance && (
                <p className="checkout-payment-card__warn">
                  ⚠️ Số dư Ví Nexus không đủ để thanh toán đơn hàng này (Cần thêm {formatPrice(totalAmount - walletBalance)}). Vui lòng nạp thêm tiền vào ví hoặc chọn phương thức khác.
                </p>
              )}
              {!loadingWallet && hasEnoughBalance && (
                <p className="checkout-payment-card__success">
                  ✓ Số dư ví đủ để thanh toán trực tiếp cho đơn hàng.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}


