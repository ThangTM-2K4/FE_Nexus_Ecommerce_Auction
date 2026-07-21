import { getBankGradient } from '../../../../data/bankBrand';
import './index.scss';

/** Nhóm số tài khoản 4 chữ số cho dễ đọc; chưa nhập thì hiện ô trống mờ. */
const formatAccountNumber = (value) => {
  const digits = String(value || '').replace(/\s+/g, '');
  if (!digits) return '•••• •••• •••• ••••';
  return digits.replace(/(.{4})/g, '$1 ').trim();
};

/**
 * Thẻ xem trước mang màu + logo của ngân hàng đang chọn.
 * Chưa chọn ngân hàng thì hiện trạng thái rỗng (gradient theo palette chung).
 */
export default function BankCardPreview({ bank, accountNumber, accountHolder }) {
  const gradient = getBankGradient(bank?.code);

  return (
    <div
      className="bank-card-preview"
      style={{ background: gradient }}
      data-empty={!bank}
    >
      {/* Logo ngân hàng phóng to, mờ, làm hình nền cho nổi bật */}
      {bank?.logo && (
        <img className="bank-card-preview__watermark" src={bank.logo} alt="" aria-hidden="true" />
      )}

      <div className="bank-card-preview__top">
        {bank?.logo ? (
          <span className="bank-card-preview__logo">
            <img src={bank.logo} alt={bank.shortName || bank.label} loading="lazy" />
          </span>
        ) : (
          <span className="bank-card-preview__logo bank-card-preview__logo--empty">?</span>
        )}
        <span className="bank-card-preview__chip" aria-hidden="true" />
      </div>

      <p className="bank-card-preview__number">{formatAccountNumber(accountNumber)}</p>

      <div className="bank-card-preview__bottom">
        <div className="bank-card-preview__field">
          <span className="bank-card-preview__field-label">Chủ tài khoản</span>
          <span className="bank-card-preview__field-value">
            {accountHolder?.trim() ? accountHolder.toUpperCase() : 'CHƯA NHẬP'}
          </span>
        </div>
        <div className="bank-card-preview__field bank-card-preview__field--right">
          <span className="bank-card-preview__field-label">Ngân hàng</span>
          <span className="bank-card-preview__field-value">
            {bank?.shortName || bank?.label || 'Chưa chọn'}
          </span>
        </div>
      </div>
    </div>
  );
}
