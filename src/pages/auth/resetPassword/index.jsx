import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";
import {
  resetPassword,
  getResetPasswordErrorMessage,
  MIN_NEW_PASSWORD_LENGTH,
} from "../../../services/passwordService";

import "./index.scss";

function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const account = location.state?.account || "";
  const otpCode = location.state?.otpCode || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!account || !otpCode) {
      navigate("/forgot-password", { replace: true });
    }
  }, [account, otpCode, navigate]);

  const validateForm = () => {
    const newErrors = {};

    if (!password.trim()) {
      newErrors.password = "Vui lòng nhập mật khẩu mới";
    } else if (password.length < MIN_NEW_PASSWORD_LENGTH) {
      newErrors.password = `Mật khẩu phải từ ${MIN_NEW_PASSWORD_LENGTH} ký tự`;
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleReset = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin");
      return;
    }

    try {
      setLoading(true);
      await resetPassword({
        emailOrPhone: account,
        otpCode,
        newPassword: password,
      });
      toast.success("Đổi mật khẩu thành công");
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1200);
    } catch (err) {
      toast.error(getResetPasswordErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-page">
      <div className="reset-card">
        <h1>Đặt Lại Mật Khẩu</h1>

        <form onSubmit={handleReset}>
          <div className="confirm-password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Mật khẩu mới"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors({ ...errors, password: "" });
              }}
              className={errors.password ? "input-error" : ""}
              disabled={loading}
            />
            <span
              className="eye-icon"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {errors.password && (
            <p className="field-error">{errors.password}</p>
          )}

          <div className="confirm-password-wrapper">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Xác nhận mật khẩu"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setErrors({ ...errors, confirmPassword: "" });
              }}
              className={errors.confirmPassword ? "input-error" : ""}
              disabled={loading}
            />

            <span
              className="eye-icon"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {errors.confirmPassword && (
            <p className="field-error">{errors.confirmPassword}</p>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
