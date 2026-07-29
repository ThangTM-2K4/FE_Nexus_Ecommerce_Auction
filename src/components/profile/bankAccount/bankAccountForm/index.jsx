import { useEffect, useMemo, useState } from 'react';
import BankSelect from '../../../common/bankSelect';
import Input from '../../../common/input';
import Checkbox from '../../../common/checkbox';
import { useBanks } from '../../../../services/bankService';
import BankCardPreview from '../bankCardPreview';
import './index.scss';

const emptyForm = {
  bankCode: '',
  accountNumber: '',
  accountHolder: '',
  isDefault: true,
};

export default function BankAccountForm({ initial, onSubmit }) {
  const [form, setForm] = useState(emptyForm);
  const { banks } = useBanks();

  useEffect(() => {
    if (initial) {
      setForm({ ...emptyForm, ...initial });
    } else {
      setForm(emptyForm);
    }
  }, [initial]);

  const selectedBank = useMemo(
    () => banks.find((b) => b.value === form.bankCode) || null,
    [banks, form.bankCode]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckbox = (checked) => {
    setForm((prev) => ({ ...prev, isDefault: checked }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.({
      ...form,
      bankName: selectedBank?.label || '',
      bankLogo: selectedBank?.logo || '',
    });
  };

  return (
    <form className="bank-account-form" onSubmit={handleSubmit}>
      {/* Thẻ xem trước đổi màu + logo ngay khi chọn ngân hàng */}
      <BankCardPreview
        bank={selectedBank}
        accountNumber={form.accountNumber}
        accountHolder={form.accountHolder}
      />

      <BankSelect
        label="Tên Ngân Hàng"
        name="bankCode"
        value={form.bankCode}
        onChange={handleChange}
        className="bank-account-form__bank-select"
      />
      <Input
        label="Số Tài Khoản"
        name="accountNumber"
        value={form.accountNumber}
        onChange={handleChange}
        placeholder="Nhập số tài khoản"
      />
      <Input
        label="Tên Đầy Đủ (Viết In Hoa, Không Dấu)"
        name="accountHolder"
        value={form.accountHolder}
        onChange={handleChange}
        placeholder="NGUYEN VAN A"
      />
      <Checkbox label="Đặt làm mặc định" checked={form.isDefault} onChange={handleCheckbox} id="bank-default" />

      <button type="submit" className="bank-account-form__submit" hidden>
        submit
      </button>
    </form>
  );
}
