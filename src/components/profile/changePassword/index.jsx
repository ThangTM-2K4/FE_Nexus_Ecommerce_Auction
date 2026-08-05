import { useState } from 'react';
import { toast } from 'react-toastify';
import PasswordInput from '../../common/passwordInput';
import Button from '../../common/button';
import * as passwordService from '../../../services/passwordService';
import { useAuth } from '../../../context/AuthContext';
import './index.scss';

const emptyForm = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

export default function ChangePassword() {
  const { user } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  const isGoogle = Boolean(
    user?.isGoogle ||
    user?.provider === 'google' ||
    user?.authProvider === 'Google' ||
    user?.isGoogleAccount ||
    user?.loginMethod === 'google' ||
    user?.hasPassword === false
  );

  if (isGoogle) {
    return (
      <section className="change-password">
        <h1 className="change-password__title">Đổi Mật Khẩu</h1>
        <hr className="change-password__divider" />
        <div style={{ padding: '32px 16px', textAlign: 'center', color: '#6b7280' }}>
          <p style={{ fontSize: '15px', fontWeight: 500 }}>
            💡 Tài khoản của bạn đăng nhập bằng Google. Không cần đổi mật khẩu tại đây.
          </p>
        </div>
      </section>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const isValid = passwordService.isChangePasswordFormValid(form);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = passwordService.validateChangePasswordForm(form);
    if (Object.keys(errors).length > 0) {
      toast.error(Object.values(errors)[0]);
      return;
    }

    setLoading(true);
    try {
      await passwordService.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success('Đổi mật khẩu thành công');
      setForm(emptyForm);
    } catch (err) {
      toast.error(passwordService.getChangePasswordErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="change-password">
      <h1 className="change-password__title">Đổi Mật Khẩu</h1>
      <hr className="change-password__divider" />

      <form className="change-password__form" onSubmit={handleSubmit}>
        <PasswordInput
          label="Mật khẩu hiện tại"
          name="currentPassword"
          value={form.currentPassword}
          onChange={handleChange}
          placeholder="Nhập mật khẩu hiện tại"
        />
        <PasswordInput
          label="Mật khẩu mới"
          name="newPassword"
          value={form.newPassword}
          onChange={handleChange}
          placeholder="Nhập mật khẩu mới"
        />
        <PasswordInput
          label="Xác nhận mật khẩu mới"
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={handleChange}
          placeholder="Nhập lại mật khẩu mới"
        />

        <div className="change-password__actions">
          <Button type="submit" variant="accent" disabled={!isValid || loading}>
            {loading ? 'Đang xử lý...' : 'Xác Nhận'}
          </Button>
        </div>
      </form>
    </section>
  );
}
