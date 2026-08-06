import React, { useState } from "react";
import { FaEye, FaEyeSlash, FaUser, FaLock, FaEnvelope, FaPhone } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import Lottie from "lottie-react";
import { toast } from "react-toastify";

import { register, getGoogleLoginUrl } from "../../../services/authService";
import { sanitizeInternalRedirect } from "../../../utils/httpErrorRedirect";
import {
  PASSWORD_RULES,
  getPasswordStrength,
  getPassedRules,
  isPasswordValid,
} from "../../../utils/passwordStrength";
import { isValidVietnamesePhone } from "../../../utils/phoneValidation";
import registerAnimation from "../../../../public/lottie/register.json";
import "./index.scss";

function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const redirectParam = searchParams.get("redirect");
  const redirectTo = sanitizeInternalRedirect(redirectParam) || location.state?.redirectTo || null;

  const handleBackClick = () => {
    if (redirectTo) {
      navigate(redirectTo);
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const backLabel = redirectTo
    ? redirectTo.startsWith("/auction")
      ? "Quay về trang đấu giá"
      : "Quay về trang trước"
    : "Quay về trang trước";

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [agreedTerms, setAgreedTerms] = useState(false);

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
      newErrors.fullName = "Vui lòng nhập họ và tên";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Vui lòng nhập email";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Vui lòng nhập số điện thoại";
    } else if (!isValidVietnamesePhone(formData.phone)) {
      newErrors.phone =
        "Số điện thoại không hợp lệ (10 số bắt đầu bằng 0 hoặc 11 số bắt đầu bằng 84)";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    } else if (!isPasswordValid(formData.password)) {
      newErrors.password =
        "Mật khẩu chưa đủ mạnh. Vui lòng đáp ứng tất cả các yêu cầu bên dưới.";
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu không khớp";
    }

    if (!agreedTerms) {
      newErrors.agreedTerms =
        "Vui lòng đọc và đồng ý với Điều khoản & Điều kiện sử dụng";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin");
      return;
    }

    try {
      setLoading(true);

      await register({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });

      toast.success(
        "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản."
      );

      setTimeout(() => {
        navigate("/register-verify-otp", {
          state: {
            email: formData.email,
          },
        });
      }, 1500);
    } catch (err) {
      toast.error(err.message || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = () => {
    window.location.href = getGoogleLoginUrl();
  };

  return (
    <div className="register-page">
      <div className="register-page__bg-shape register-page__bg-shape--one" aria-hidden="true" />
      <div className="register-page__bg-shape register-page__bg-shape--two" aria-hidden="true" />

      <div className="register-shell">
        <div className="register-card">
          <aside className="register-card__visual" aria-hidden="true">
            <div className="register-card__brand">
              <img
                className="register-card__logo"
                src="/images/logo/logo.png"
                alt="BidDoubleTk"
              />
              <div>
                <strong>Project Nexus</strong>
                <span>Thương mại · Đấu giá</span>
              </div>
            </div>

            <div className="register-card__particles">
              <span className="register-particle register-particle--plus">+</span>
              <span className="register-particle register-particle--x">×</span>
              <span className="register-particle register-particle--dot" />
              <span className="register-particle register-particle--tri" />
            </div>

            <div className="register-card__blob" />

            <div className="register-card__lottie">
              <Lottie
                animationData={registerAnimation}
                loop
                autoplay
                className="register-lottie"
                rendererSettings={{ preserveAspectRatio: "xMidYMid meet" }}
              />
            </div>
          </aside>

          <div className="register-card__form-panel">
            <button
              type="button"
              className="back-home-btn"
              onClick={handleBackClick}
            >
              ← {backLabel}
            </button>

            <div className="register-avatar">
              <FaUser aria-hidden="true" />
            </div>

            <h1>
              Tạo tài khoản
              <br />
              miễn phí
            </h1>
            <p className="subtitle">Hệ thống Đấu giá Thương mại Điện tử</p>
            <p className="description">
              Tham gia đấu giá, mua bán và quản lý giao dịch trên nền tảng đấu giá trực tuyến.
            </p>

            <form onSubmit={handleRegister}>
              <div className="form-group">
                <div className="input-with-icon">
                  <input
                    type="text"
                    id="register-fullName"
                    name="fullName"
                    placeholder="Họ và tên"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={errors.fullName ? "input-error" : ""}
                  />
                  <span className="input-icon" aria-hidden="true">
                    <FaUser />
                  </span>
                </div>
                <div className="field-error">{errors.fullName || "\u00A0"}</div>
              </div>

              <div className="form-group">
                <div className="input-with-icon">
                  <input
                    type="email"
                    id="register-email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    className={errors.email ? "input-error" : ""}
                  />
                  <span className="input-icon" aria-hidden="true">
                    <FaEnvelope />
                  </span>
                </div>
                <div className="field-error">{errors.email || "\u00A0"}</div>
              </div>

              <div className="form-group">
                <div className="input-with-icon">
                  <input
                    type="tel"
                    id="register-phone"
                    name="phone"
                    placeholder="Số điện thoại"
                    value={formData.phone}
                    onChange={handleChange}
                    className={errors.phone ? "input-error" : ""}
                  />
                  <span className="input-icon" aria-hidden="true">
                    <FaPhone />
                  </span>
                </div>
                <div className="field-error">{errors.phone || "\u00A0"}</div>
              </div>

              <div className="password-field">
                <div className="form-group">
                  <div className="password-wrapper input-with-icon">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="register-password"
                      name="password"
                      placeholder="Mật khẩu"
                      value={formData.password}
                      onChange={handleChange}
                      className={errors.password ? "input-error" : ""}
                    />
                    <span className="input-icon input-icon--left" aria-hidden="true">
                      <FaLock />
                    </span>
                    <button
                      type="button"
                      className="eye-btn"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  <div className="field-error">{errors.password || "\u00A0"}</div>
                </div>

                {formData.password && (
                  <div className="password-strength">
                    <div className="password-strength__head">
                      <span>Độ mạnh mật khẩu</span>
                      <span
                        className="password-strength__label"
                        style={{ color: getPasswordStrength(formData.password).color }}
                      >
                        {getPasswordStrength(formData.password).label}
                      </span>
                    </div>

                    <div className="password-strength__bar">
                      <div
                        className="password-strength__bar-fill"
                        style={{
                          width: `${getPasswordStrength(formData.password).percent}%`,
                          background: getPasswordStrength(formData.password).color,
                        }}
                      />
                    </div>

                    <ul className="password-strength__rules">
                      {PASSWORD_RULES.map((rule) => {
                        const passed = getPassedRules(formData.password).includes(rule.key);
                        return (
                          <li key={rule.key} className={passed ? "passed" : ""}>
                            <span className="password-strength__check">
                              {passed ? "✓" : "○"}
                            </span>
                            {rule.label}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>

              <div className="password-field">
                <div className="form-group">
                  <div className="password-wrapper input-with-icon">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="register-confirmPassword"
                      name="confirmPassword"
                      placeholder="Xác nhận mật khẩu"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={errors.confirmPassword ? "input-error" : ""}
                    />
                    <span className="input-icon input-icon--left" aria-hidden="true">
                      <FaLock />
                    </span>
                    <button
                      type="button"
                      className="eye-btn"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  <div className="field-error">{errors.confirmPassword || "\u00A0"}</div>
                </div>
              </div>

              <div className="terms-agree">
                <label className="terms-agree__row">
                  <input
                    type="checkbox"
                    checked={agreedTerms}
                    onChange={(e) => {
                      setAgreedTerms(e.target.checked);
                      setErrors((prev) => ({ ...prev, agreedTerms: "" }));
                    }}
                  />
                  <span>
                    Tôi đã đọc và đồng ý với{" "}
                    <Link to="/terms" state={{ from: "/register" }}>
                      Điều khoản &amp; Điều kiện sử dụng
                    </Link>
                  </span>
                </label>
                {errors.agreedTerms && (
                  <p className="field-error">{errors.agreedTerms}</p>
                )}
              </div>

              <button
                type="submit"
                className="register-btn"
                disabled={loading || !agreedTerms}
              >
                {loading ? "Đang đăng ký..." : "Đăng ký"}
              </button>

              <div className="divider">HOẶC</div>

              <button
                type="button"
                className="google-btn"
                onClick={handleGoogleRegister}
              >
                <FcGoogle size={22} />
                Đăng nhập bằng Google
              </button>

              <div className="register-link">
                Đã có tài khoản?
                <span onClick={() => navigate("/login")}>Đăng nhập</span>
              </div>

              <div className="login-footer">
                <p>© 2026 Hệ Thống Đấu Giá Thương Mại Điện Tử</p>
                <p>An toàn • Minh bạch • Hiệu quả</p>
                <p>
                  Đây là sản phẩm học tập không phục vụ cho mục đích thương mại đời sống
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
