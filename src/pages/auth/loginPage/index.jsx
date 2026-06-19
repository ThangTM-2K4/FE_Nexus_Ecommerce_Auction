import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { toast } from 'react-toastify';
import { useAuth } from '../../../context/AuthContext';
import './index.scss';

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [searchParams] = useSearchParams();

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [errors, setErrors] =
    useState({});

  const [formData, setFormData] =
    useState({
      login: "",
      password: "",
    });

  useEffect(() => {
    const errorCode =
      searchParams.get("error");

    if (!errorCode) return;

    switch (errorCode) {
      case "google_login_failed":
        toast.error(
          "Đăng nhập Google thất bại"
        );
        break;

      case "email_claim_conflict":
        toast.error(
          "Email Google đã tồn tại trong hệ thống"
        );
        break;

      default:
        toast.error(
          "Có lỗi xảy ra khi đăng nhập Google"
        );
    }
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value } =
      e.target;

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

    if (!formData.login.trim()) {
      newErrors.login =
        "Vui lòng nhập Email hoặc Số điện thoại";
    }

    if (!formData.password.trim()) {
      newErrors.password =
        "Vui lòng nhập mật khẩu";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleGoogleLogin = () => {
    window.location.href =
      "http://localhost:5101/api/v1/auth/google/login";
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error(
        "Vui lòng nhập đầy đủ thông tin"
      );
      return;
    }

    try {
      setLoading(true);

      const user = await login(formData.login, formData.password);

      toast.success(
        "Đăng nhập thành công"
      );

      setTimeout(() => {
        switch (user.role) {
          case "ADMIN":
            navigate("/admin");
            break;

          case "STAFF":
            navigate("/staff");
            break;

          case "SELLER":
            navigate("/seller-hub");
            break;

          case "BUYER":
            navigate("/");
            break;

          case "USER":
            navigate("/");
            break;

          default:
            navigate("/");
        }
      }, 1000);
    } catch (err) {

      const newErrors = {};

      if (
        err.message?.includes("Email")
      ) {
        newErrors.login =
          "Email không tồn tại";
      }

      if (
        err.message?.includes("Password")
      ) {
        newErrors.password =
          "Mật khẩu không chính xác";
      }

      setErrors(newErrors);

      toast.error(
        err.message || "Đăng nhập thất bại"
      );
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Sàn Đấu Giá Điện Tử</h1>

        <p className="subtitle">
          Hệ thống Đấu giá Thương mại Điện tử
        </p>

        <p className="description">
          Nền tảng đấu giá trực tuyến
          an toàn, minh bạch và hiệu quả
        </p>

        <form onSubmit={handleLogin}>
          <input
            type="text"
            name="login"
            placeholder="Email hoặc Số điện thoại"
            value={formData.login}
            onChange={handleChange}
            className={errors.login ? "input-error" : ""}
          />

          {errors.login && (
            <p className="field-error">
               {errors.login}
            </p>
          )}

          <div className="password-wrapper">
            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              name="password"
              placeholder="Mật khẩu"
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
                setShowPassword(!showPassword)
              }
            >
              {showPassword ? (
                <FaEyeSlash />
              ) : (
                <FaEye />
              )}
            </button>
          </div>

          {errors.password && (
            <p className="field-error">
               {errors.password}
            </p>
          )}

          <div className="forgot-password">
            Quên mật khẩu?
          </div>

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading
              ? "Đang đăng nhập..."
              : "Đăng nhập"}
          </button>

          <div className="divider">
            HOẶC
          </div>

          <button
            type="button"
            className="google-btn"
            onClick={
              handleGoogleLogin
            }
          >
            <FcGoogle size={22} />
            Đăng nhập bằng Google
          </button>

          <div className="register-link">
            Chưa có tài khoản?

            <span
              onClick={() =>
                navigate(
                  "/register"
                )
              }
            >
              Đăng ký ngay
            </span>
          </div>

          <div className="login-footer">
            <p>
              © 2026 Hệ Thống Đấu Giá
              Thương Mại Điện Tử
            </p>

            <p>
              An toàn • Minh bạch •
              Hiệu quả
            </p>

            <p>
              Kết nối người mua và
              người bán trên nền tảng
              đấu giá trực tuyến
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;