import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";

import "./index.scss";

function ResetPasswordPage() {
  const navigate = useNavigate();

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [errors, setErrors] =
    useState({});

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!password.trim()) {
      newErrors.password =
        "Vui lòng nhập mật khẩu mới";
    } else if (
      password.length < 6
    ) {
      newErrors.password =
        "Mật khẩu phải từ 6 ký tự";
    }

    if (
      !confirmPassword.trim()
    ) {
      newErrors.confirmPassword =
        "Vui lòng xác nhận mật khẩu";
    } else if (
      password !== confirmPassword
    ) {
      newErrors.confirmPassword =
        "Mật khẩu xác nhận không khớp";
    }

    setErrors(newErrors);

    return (
      Object.keys(newErrors).length === 0
    );
  };

  const handleReset = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error(
        "Vui lòng kiểm tra lại thông tin"
      );
      return;
    }

    toast.success(
      "Đổi mật khẩu thành công"
    );

    setTimeout(() => {
      navigate("/");
    }, 1500);
  };

  return (
    <div className="reset-page">
      <div className="reset-card">
        <h1>Đặt Lại Mật Khẩu</h1>

        <form onSubmit={handleReset}>
          <input
            type="password"
            placeholder="Mật khẩu mới"
            value={password}
            onChange={(e) => {
              setPassword(
                e.target.value
              );

              setErrors({
                ...errors,
                password: "",
              });
            }}
            className={
              errors.password
                ? "input-error"
                : ""
            }
          />

          {errors.password && (
            <p className="field-error">
               {errors.password}
            </p>
          )}

          <div className="confirm-password-wrapper">
            
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Xác nhận mật khẩu"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);

              setErrors({
                ...errors,
                confirmPassword: "",
              });
            }}
            className={
              errors.confirmPassword ? "input-error" : ""
            }
          />

          <span
            className="eye-icon"
            onClick={() =>
              setShowConfirmPassword(!showConfirmPassword)
            }
          >
            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

          {errors.confirmPassword && (
            <p className="field-error">
                {" "}
              {
                errors.confirmPassword
              }
            </p>
          )}

          <button type="submit">
            Đổi mật khẩu
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPasswordPage;