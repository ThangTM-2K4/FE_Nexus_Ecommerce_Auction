import { useMemo } from 'react';
import Select from '../select';
import { useBanks } from '../../../services/bankService';
import './index.scss';

/** Một dòng ngân hàng trong danh sách: logo + tên viết tắt + tên đầy đủ. */
const BankOption = (opt) => (
  <span className="bank-option">
    <span className="bank-option__logo">
      {opt.logo ? <img src={opt.logo} alt="" loading="lazy" /> : <span>{opt.code?.[0] || '?'}</span>}
    </span>
    <span className="bank-option__text">
      <span className="bank-option__name">{opt.shortName || opt.label}</span>
      {opt.name && <span className="bank-option__full">{opt.name}</span>}
    </span>
  </span>
);

/** Ngân hàng đã chọn hiển thị trong ô đóng: logo nhỏ + tên. */
const BankValue = (opt) => (
  <span className="bank-option bank-option--compact">
    <span className="bank-option__logo">
      {opt.logo ? <img src={opt.logo} alt="" /> : <span>{opt.code?.[0] || '?'}</span>}
    </span>
    <span className="bank-option__name">{opt.shortName || opt.label}</span>
  </span>
);

const OTHER_OPTION = { value: 'other', label: 'Ngân hàng khác', shortName: 'Ngân hàng khác' };

/**
 * Ô chọn ngân hàng dùng chung (Hồ Sơ, Ví người bán, Đăng ký người bán).
 *
 * Bọc <Select> nên thừa hưởng: popup luôn sổ xuống + bo góc. Tự nạp danh sách
 * ngân hàng qua useBanks nên nơi gọi không phải tự lo.
 *
 * includeOther: thêm mục "Ngân hàng khác" để người dùng tự gõ tên.
 */
export default function BankSelect({
  label = 'Ngân hàng',
  name = 'bankName',
  value,
  onChange,
  includeOther = false,
  className = '',
}) {
  const { banks, loading } = useBanks();

  const options = useMemo(
    () => (includeOther ? [...banks, OTHER_OPTION] : banks),
    [banks, includeOther]
  );

  return (
    <Select
      label={label}
      name={name}
      value={value}
      onChange={onChange}
      options={options}
      placeholder={loading ? 'Đang tải danh sách ngân hàng...' : 'Chọn ngân hàng'}
      disabled={loading}
      renderOption={BankOption}
      renderValue={BankValue}
      className={`bank-select ${className}`.trim()}
    />
  );
}
