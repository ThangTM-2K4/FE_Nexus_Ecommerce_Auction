import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import "./index.scss";
import { registerAPI } from "../../../config/api";

function RegisterPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validateForm = () => {
  const newErrors = {};

  if (!formData.fullName.trim()) {
    newErrors.fullName =
      "Vui lòng nhập họ và tên";
  }

  if (!formData.email.trim()) {
    newErrors.email =
      "Vui lòng nhập email";
  }

  if (!formData.phone.trim()) {
    newErrors.phone =
      "Vui lòng nhập số điện thoại";
  }

  if (!formData.password.trim()) {
    newErrors.password =
      "Vui lòng nhập mật khẩu";
  }

  if (
    formData.password &&
    formData.password.length < 6
  ) {
    newErrors.password =
      "Mật khẩu tối thiểu 6 ký tự";
  }

  if (!formData.confirmPassword.trim()) {
    newErrors.confirmPassword =
      "Vui lòng xác nhận mật khẩu";
  }

  if (
    formData.password !==
    formData.confirmPassword
  ) {
    newErrors.confirmPassword =
      "Mật khẩu không khớp";
  }

  setErrors(newErrors);

  return Object.keys(newErrors).length === 0;
};
  const handleRegister = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error(
        "Vui lòng kiểm tra lại thông tin"
      );
      return;
    }

    try {
      setLoading(true);

      await registerAPI({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: "BUYER",
      });

      toast.success(
        "Đăng ký tài khoản thành công 🎉"
      );

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      toast.error(
        err.message || "Đăng ký thất bại"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = () => {
    window.location.href =
      "http://localhost:5101/api/v1/auth/google/login";
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <h1>Tạo Tài Khoản</h1>

        <p className="subtitle">
          Hệ thống Đấu giá Thương mại Điện tử
        </p>

        <p className="description">
          Tham gia đấu giá, mua bán và quản lý
          giao dịch trên nền tảng đấu giá trực
          tuyến.
        </p>

        <form onSubmit={handleRegister}>
          <label className="field-label" htmlFor="fullName">
            Họ và tên <span className="required">*</span>
          </label>
          <input
            id="fullName"
            type="text"
            name="fullName"
            placeholder="Nhập họ và tên"
            value={formData.fullName}
            onChange={handleChange}
            className={
              errors.fullName
                ? "input-error"
                : ""
            }
          />

          {errors.fullName && (
            <p className="field-error">
              {errors.fullName}
            </p>
          )}

          <label className="field-label" htmlFor="email">
            Email <span className="required">*</span>
          </label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="Nhập email"
            value={formData.email}
            onChange={handleChange}
            className={
              errors.email
                ? "input-error"
                : ""
            }
          />

          {errors.email && (
            <p className="field-error">
              ❌ {errors.email}
            </p>
          )}
          <label className="field-label" htmlFor="phone">
            Số điện thoại <span className="required">*</span>
          </label>
          <input
            id="phone"
            type="tel"
            name="phone"
            placeholder="Nhập số điện thoại"
            value={formData.phone}
            onChange={handleChange}
            className={
              errors.phone
                ? "input-error"
                : ""
            }
          />

          <label className="field-label" htmlFor="password">
            Mật khẩu <span className="required">*</span>
          </label>
          <div className="password-wrapper">
            <input
              id="password"
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              name="password"
              placeholder="Tối thiểu 6 ký tự"
              value={formData.password}
              onChange={handleChange}
              className={
                errors.password
                  ? "input-error"
                  : ""
              }
            />

            <button
              type="button"
              className="eye-btn"
              onClick={() =>
                setShowPassword(
                  !showPassword
                )
              }
            >
              {showPassword ? (
                <FaEyeSlash />
              ) : (
                <FaEye />
              )}
            </button>
          </div>

          <label className="field-label" htmlFor="confirmPassword">
            Xác nhận mật khẩu <span className="required">*</span>
          </label>
          <div className="password-wrapper">
            <input
              id="confirmPassword"
              type={
                showConfirmPassword
                  ? "text"
                  : "password"
              }
              name="confirmPassword"
              placeholder="Nhập lại mật khẩu"
              value={
                formData.confirmPassword
              }
              onChange={handleChange}
              className={
                errors.confirmPassword
                  ? "input-error"
                  : ""
              }
            />

            <button
              type="button"
              className="eye-btn"
              onClick={() =>
                setShowConfirmPassword(
                  !showConfirmPassword
                )
              }
            >
              {showConfirmPassword ? (
                <FaEyeSlash />
              ) : (
                <FaEye />
              )}
            </button>
          </div>

          <button
            type="submit"
            className="register-btn"
            disabled={loading}
          >
            {loading
              ? "Đang đăng ký..."
              : "Đăng ký"}
          </button>

          <div className="divider">
            HOẶC
          </div>

          <button
            type="button"
            className="google-btn"
            onClick={handleGoogleRegister}
          >
            <FcGoogle size={22} />
            Đăng ký bằng Google
          </button>

          <div className="register-link">
            Đã có tài khoản?

            <span
              onClick={() =>
                navigate("/login")
              }
            >
              Đăng nhập
            </span>
          </div>

          <div className="login-footer">
            <p>
              © 2026 Hệ Thống Đấu Giá Thương Mại Điện Tử
            </p>

            <p>
              An toàn • Minh bạch • Hiệu quả
            </p>

            <p>
              Kết nối người mua và người bán trên nền tảng đấu giá trực tuyến
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;