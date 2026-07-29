import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../../context/AuthContext';
import * as bankAccountService from '../../../services/bankAccountService';
import Button from '../../common/button';
import Modal from '../../common/modal';
import BankAccountForm from './bankAccountForm';
import { useBanks } from '../../../services/bankService';
import { getBankGradient } from '../../../data/bankBrand';
import { getApiErrorMessage } from '../../../utils/apiResponse';
import './index.scss';

const SOURCE_LABEL = {
  seller_registration: 'Từ đơn đăng ký người bán',
  profile: 'Từ hồ sơ cá nhân',
};

export default function BankAccountPage() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [busyId, setBusyId] = useState(null);
  // Nạp sẵn danh sách ngân hàng để tra được logo/tên cho các tài khoản đã lưu
  useBanks();

  const load = async () => {
    if (!user?.id) return;
    setLoading(true);
    const data = await bankAccountService.getBankAccounts(user.id);
    setAccounts(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [user?.id]);

  const openCreate = () => {
    setEditTarget(null);
    setModalOpen(true);
  };

  const openEdit = (acc) => {
    setEditTarget(acc);
    setModalOpen(true);
  };

  const handleSubmit = async (formData) => {
    try {
      if (editTarget) {
        const updated = await bankAccountService.updateBankAccount(user.id, editTarget.id, formData);
        setAccounts(updated);
        toast.success('Cập nhật tài khoản ngân hàng thành công');
      } else {
        const updated = await bankAccountService.addBankAccount(user.id, formData);
        setAccounts(updated);
        toast.success('Thêm tài khoản ngân hàng thành công');
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(
        getApiErrorMessage(
          err,
          editTarget ? 'Cập nhật tài khoản ngân hàng thất bại' : 'Thêm tài khoản ngân hàng thất bại'
        )
      );
    }
  };

  const handleSetDefault = async (id) => {
    setBusyId(id);
    try {
      const updated = await bankAccountService.setDefaultBankAccount(user.id, id);
      setAccounts(updated);
      toast.success('Đã đặt làm mặc định');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Đặt tài khoản mặc định thất bại'));
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa tài khoản ngân hàng này?')) return;
    setBusyId(id);
    try {
      const updated = await bankAccountService.deleteBankAccount(user.id, id);
      setAccounts(updated);
      toast.success('Đã xóa tài khoản ngân hàng');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Xóa tài khoản ngân hàng thất bại'));
    } finally {
      setBusyId(null);
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
        <Button variant="outline" className="common-btn--sm" onClick={openCreate}>
          + Thêm Ngân Hàng Liên Kết
        </Button>
      </header>

      <p className="bank-page__hint">
        Tài khoản tại đây dùng chung với <Link to="/seller-hub/wallet">Ví người bán</Link> — tài khoản
        mặc định là nơi nhận tiền khi bạn rút.
      </p>

      <hr className="bank-page__divider" />

      {loading && <p className="bank-page__loading">Đang tải...</p>}

      {!loading && accounts.length === 0 && (
        <p className="bank-page__empty">Bạn chưa có tài khoản ngân hàng.</p>
      )}

      {!loading && accounts.length > 0 && (
        <ul className="bank-page__list">
          {accounts.map((acc) => (
            <li
              key={acc.id}
              className="bank-page__item"
              style={{ '--bank-brand': getBankGradient(acc.bankCode) }}
            >
              <span className="bank-page__logo">
                {acc.bankLogo ? (
                  <img src={acc.bankLogo} alt="" loading="lazy" />
                ) : (
                  <span>{(acc.bank || acc.bankName || '?').charAt(0)}</span>
                )}
              </span>
              <div className="bank-page__item-body">
                <div className="bank-page__item-title">
                  <strong>{acc.bank || acc.bankName}</strong>
                  {acc.isDefault && <span className="bank-page__default">Mặc định</span>}
                </div>
                <p>
                  STK: {acc.accountNumber} — {acc.accountHolder}
                </p>
                {SOURCE_LABEL[acc.source] && (
                  <small className="bank-page__source">{SOURCE_LABEL[acc.source]}</small>
                )}
              </div>
              <div className="bank-page__item-actions">
                <button type="button" onClick={() => openEdit(acc)}>
                  Sửa
                </button>
                <button type="button" onClick={() => handleDelete(acc.id)} disabled={busyId === acc.id}>
                  Xóa
                </button>
                {!acc.isDefault && (
                  <button
                    type="button"
                    className="bank-page__set-default"
                    onClick={() => handleSetDefault(acc.id)}
                    disabled={busyId === acc.id}
                  >
                    Thiết lập mặc định
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTarget ? 'Sửa Tài Khoản Ngân Hàng' : 'Thêm Tài Khoản Ngân Hàng'}
        footer={modalFooter}
      >
        <BankAccountForm initial={editTarget} onSubmit={handleSubmit} />
      </Modal>
    </div>
  );
}
