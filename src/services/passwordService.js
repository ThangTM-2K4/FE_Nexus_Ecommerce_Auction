import api from '../config/api';
import { getApiErrorMessage } from '../utils/apiResponse';

const MIN_PASSWORD_LENGTH = 6;

export const MIN_NEW_PASSWORD_LENGTH = MIN_PASSWORD_LENGTH;

export const changePassword = async ({ currentPassword, newPassword }) => {
  await api.post('/users/me/password', {
    currentPassword,
    newPassword,
  });
};

/** Gửi OTP quên mật khẩu — POST /users/forgot-password */
export const forgotPassword = async (emailOrPhone) => {
  await api.post('/users/forgot-password', {
    emailOrPhone: String(emailOrPhone || '').trim(),
  }, { skipErrorRedirect: true });
};

/** Đặt lại mật khẩu bằng OTP — POST /users/reset-password */
export const resetPassword = async ({ emailOrPhone, otpCode, newPassword }) => {
  await api.post('/users/reset-password', {
    emailOrPhone: String(emailOrPhone || '').trim(),
    otpCode: String(otpCode || '').trim(),
    newPassword,
  }, { skipErrorRedirect: true });
};

export const getChangePasswordErrorMessage = (error) =>
  getApiErrorMessage(error, 'Đổi mật khẩu thất bại, vui lòng thử lại');

export const getForgotPasswordErrorMessage = (error) =>
  getApiErrorMessage(error, 'Không gửi được mã OTP, vui lòng thử lại');

export const getResetPasswordErrorMessage = (error) =>
  getApiErrorMessage(error, 'Đặt lại mật khẩu thất bại, vui lòng thử lại');

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
