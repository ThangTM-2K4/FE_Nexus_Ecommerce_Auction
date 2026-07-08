import { useState } from 'react';
import { toast } from 'react-toastify';
import * as profileService from '../../../services/profileService';
import { getSellerBankAccounts } from '../../../services/bankAccountService';

const emptyForm = { bankName: '', accountNumber: '', accountHolder: '' };

export default function BankAccountSection({ userId, profile, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const hasAccount = Boolean(profile.bankAccount);

  const startAdd = () => {
    setForm(emptyForm);
    setEditing(true);
  };

  const startEdit = () => {
    setForm({ ...profile.bankAccount });
    setEditing(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!form.bankName || !form.accountNumber || !form.accountHolder) {
      toast.error('Vui lòng điền đầy đủ thông tin ngân hàng');
      return;
    }
    setSaving(true);
    try {
      const updated = await profileService.saveBankAccount(userId, form);
      await getSellerBankAccounts(userId);
      onUpdate(updated);
      setEditing(false);
      toast.success('Lưu tài khoản ngân hàng thành công');
    } catch {
      toast.error('Lưu thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    if (!window.confirm('Bạn có chắc muốn xóa tài khoản ngân hàng?')) return;
    setSaving(true);
    try {
      const updated = await profileService.removeBankAccount(userId);
      onUpdate(updated);
      setEditing(false);
      toast.success('Đã xóa tài khoản ngân hàng');
    } catch {
      toast.error('Xóa thất bại');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="profile-section" id="bank-account">
      <div className="profile-section-header">
        <h2>Tài khoản ngân hàng</h2>
        {!editing && (
          <div className="profile-section-actions">
            {hasAccount ? (
              <>
                <button type="button" className="profile-btn profile-btn--outline" onClick={startEdit}>
                  Chỉnh sửa
                </button>
                <button type="button" className="profile-btn profile-btn--danger" onClick={handleRemove} disabled={saving}>
                  Xóa
                </button>
              </>
            ) : (
              <button type="button" className="profile-btn profile-btn--primary" onClick={startAdd}>
                Thêm tài khoản
              </button>
            )}
          </div>
        )}
      </div>

      {editing ? (
        <div className="profile-bank-form">
          <div className="profile-field">
            <label>Tên ngân hàng</label>
            <input name="bankName" value={form.bankName} onChange={handleChange} placeholder="VD: Vietcombank" />
          </div>
          <div className="profile-field">
            <label>Số tài khoản</label>
            <input name="accountNumber" value={form.accountNumber} onChange={handleChange} placeholder="0123456789" />
          </div>
          <div className="profile-field">
            <label>Chủ tài khoản</label>
            <input name="accountHolder" value={form.accountHolder} onChange={handleChange} placeholder="Họ tên in trên thẻ" />
          </div>
          <div className="profile-section-actions">
            <button type="button" className="profile-btn profile-btn--ghost" onClick={() => setEditing(false)}>
              Hủy
            </button>
            <button type="button" className="profile-btn profile-btn--primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </div>
      ) : hasAccount ? (
        <div className="profile-bank-display">
          <div><strong>Ngân hàng:</strong> {profile.bankAccount.bankName}</div>
          <div><strong>Số TK:</strong> {profile.bankAccount.accountNumber}</div>
          <div><strong>Chủ TK:</strong> {profile.bankAccount.accountHolder}</div>
        </div>
      ) : (
        <p className="profile-empty-hint">Chưa có tài khoản ngân hàng. Thêm tài khoản để nhận thanh toán.</p>
      )}
    </section>
  );
}
