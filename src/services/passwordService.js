import api from '../config/api';

const MIN_PASSWORD_LENGTH = 6;

export const MIN_NEW_PASSWORD_LENGTH = MIN_PASSWORD_LENGTH;

export const changePassword = async ({ currentPassword, newPassword }) => {
  await api.post('/users/me/password', {
    currentPassword,
    newPassword,
  });
};

export const getChangePasswordErrorMessage = (error) => {
  const data = error?.response?.data;
  if (typeof data === 'string' && data.trim()) return data;
  if (data?.message) return data.message;
  if (data?.error) return data.error;
  if (Array.isArray(data?.errors) && data.errors[0]?.message) {
    return data.errors[0].message;
  }
  return 'Đổi mật khẩu thất bại, vui lòng thử lại';
};

export const validateChangePasswordForm = ({ currentPassword, newPassword, confirmPassword }) => {
  const errors = {};

  if (!currentPassword?.trim()) {
    errors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
  }

  if (!newPassword?.trim()) {
    errors.newPassword = 'Vui lòng nhập mật khẩu mới';
  } else if (newPassword.length < MIN_PASSWORD_LENGTH) {
    errors.newPassword = `Mật khẩu mới phải từ ${MIN_PASSWORD_LENGTH} ký tự`;
  }

  if (!confirmPassword?.trim()) {
    errors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới';
  } else if (newPassword !== confirmPassword) {
    errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
  }

  return errors;
};

export const isChangePasswordFormValid = (form) =>
  Object.keys(validateChangePasswordForm(form)).length === 0;
