import { useEffect, useState } from 'react';
import Select from '../../../common/select';
import Input from '../../../common/input';
import Checkbox from '../../../common/checkbox';
import { BANK_OPTIONS } from '../../../../data/bankOptions';
import { BRANCH_OPTIONS } from '../../../../data/mockBankAccounts';
import './index.scss';

const emptyForm = {
  bankCode: '',
  branchCode: '',
  accountNumber: '',
  accountHolder: '',
  nationalId: '',
  isDefault: true,
};

export default function BankAccountForm({ initial, onSubmit }) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (initial) {
      setForm({ ...emptyForm, ...initial });
    } else {
      setForm(emptyForm);
    }
  }, [initial]);

  // #region agent log
  useEffect(() => {
    fetch('http://127.0.0.1:7573/ingest/6a36bee6-8fdb-46c9-a0c0-b55c9704312f', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '239b2f' },
      body: JSON.stringify({
        sessionId: '239b2f',
        runId: 'post-fix',
        hypothesisId: 'A',
        location: 'bankAccountForm/index.jsx:mount',
        message: 'BankAccountForm mounted with options',
        data: {
          bankOptionsCount: BANK_OPTIONS?.length ?? 0,
          branchKeys: Object.keys(BRANCH_OPTIONS || {}),
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
  }, []);
  // #endregion

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'bankCode') next.branchCode = '';
      return next;
    });
  };

  const handleCheckbox = (checked) => {
    setForm((prev) => ({ ...prev, isDefault: checked }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const branchLabel = BRANCH_OPTIONS[form.bankCode]?.find((b) => b.value === form.branchCode)?.label || '';
    onSubmit?.({ ...form, branchName: branchLabel });
  };

  const branchOptions = form.bankCode ? BRANCH_OPTIONS[form.bankCode] || [] : [];

  return (
    <form className="bank-account-form" onSubmit={handleSubmit}>
      <Select
        label="Tên Ngân Hàng"
        name="bankCode"
        value={form.bankCode}
        onChange={handleChange}
        options={BANK_OPTIONS}
        placeholder="Chọn ngân hàng"
      />
      <Select
        label="Tên Chi Nhánh"
        name="branchCode"
        value={form.branchCode}
        onChange={handleChange}
        options={branchOptions}
        placeholder="Chọn chi nhánh"
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
