import { useEffect, useState } from 'react';
import Select from '../../../common/select';
import Input from '../../../common/input';
import Checkbox from '../../../common/checkbox';
import { useBanks } from '../../../../services/bankService';
import './index.scss';

const emptyForm = {
  bankCode: '',
  accountNumber: '',
  accountHolder: '',
  nationalId: '',
  isDefault: true,
};

export default function BankAccountForm({ initial, onSubmit }) {
  const [form, setForm] = useState(emptyForm);
  const { banks, loading: banksLoading } = useBanks();

  useEffect(() => {
    if (initial) {
      setForm({ ...emptyForm, ...initial });
    } else {
      setForm(emptyForm);
    }
  }, [initial]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckbox = (checked) => {
    setForm((prev) => ({ ...prev, isDefault: checked }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const bankLabel = banks.find((b) => b.value === form.bankCode)?.label || '';
    onSubmit?.({ ...form, bankName: bankLabel });
  };

  return (
    <form className="bank-account-form" onSubmit={handleSubmit}>
      <Select
        label="Tên Ngân Hàng"
        name="bankCode"
        value={form.bankCode}
        onChange={handleChange}
        options={banks}
        placeholder={banksLoading ? 'Đang tải danh sách ngân hàng...' : 'Chọn ngân hàng'}
        disabled={banksLoading}
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
      <Input
        label="Số CMND"
        name="nationalId"
        value={form.nationalId}
        onChange={handleChange}
        placeholder="Số CMND/CCCD"
      />
      <Checkbox label="Đặt làm mặc định" checked={form.isDefault} onChange={handleCheckbox} id="bank-default" />

      <button type="submit" className="bank-account-form__submit" hidden>
        submit
      </button>
    </form>
  );
}
