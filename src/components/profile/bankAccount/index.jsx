import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../../context/AuthContext';
import * as bankAccountService from '../../../services/bankAccountService';
import Button from '../../common/button';
import Modal from '../../common/modal';
import BankAccountForm from './bankAccountForm';
import './index.scss';

export default function BankAccountPage() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const load = async () => {
    if (!user?.id) return;
    setLoading(true);
    const data = await bankAccountService.getBankAccounts(user.id);
    setAccounts(data);
    setLoading(false);
    // #region agent log
    fetch('http://127.0.0.1:7573/ingest/6a36bee6-8fdb-46c9-a0c0-b55c9704312f', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '239b2f' },
      body: JSON.stringify({
        sessionId: '239b2f',
        runId: 'post-fix',
        hypothesisId: 'F',
        location: 'bankAccount/index.jsx:load',
        message: 'Bank accounts loaded',
        data: { count: data?.length ?? 0 },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
  };

  useEffect(() => {
    load();
  }, [user?.id]);

  const handleSubmit = async (formData) => {
    try {
      const updated = await bankAccountService.addBankAccount(user.id, formData);
      setAccounts(updated);
      setModalOpen(false);
      toast.success('Thêm tài khoản ngân hàng thành công');
    } catch {
      toast.error('Thêm thất bại');
    }
  };

  const modalFooter = (
    <>
      <button type="button" className="bank-page__back-link" onClick={() => setModalOpen(false)}>
        TRỞ LẠI
      </button>
      <Button
        variant="accent"
        onClick={() => document.querySelector('.bank-account-form__submit')?.click()}
      >
        Hoàn Thành
      </Button>
    </>
  );

  return (
    <div className="bank-page">
      <header className="bank-page__header">
        <h1>Tài Khoản Ngân Hàng Của Tôi</h1>
        <Button variant="outline" className="common-btn--sm" onClick={() => setModalOpen(true)}>
          + Thêm Ngân Hàng Liên Kết
        </Button>
      </header>

      <hr className="bank-page__divider" />

      {loading && <p className="bank-page__loading">Đang tải...</p>}

      {!loading && accounts.length === 0 && (
        <p className="bank-page__empty">Bạn chưa có tài khoản ngân hàng.</p>
      )}

      {!loading && accounts.length > 0 && (
        <ul className="bank-page__list">
          {accounts.map((acc) => (
            <li key={acc.id} className="bank-page__item">
              <div>
                <strong>{acc.bankName}</strong>
                {acc.isDefault && <span className="bank-page__default">Mặc định</span>}
              </div>
              <p>{acc.branchName}</p>
              <p>STK: {acc.accountNumber} — {acc.accountHolder}</p>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Thêm Tài Khoản Ngân Hàng"
        showBack
        onBack={() => setModalOpen(false)}
        footer={modalFooter}
      >
        <BankAccountForm onSubmit={handleSubmit} />
      </Modal>
    </div>
  );
}
