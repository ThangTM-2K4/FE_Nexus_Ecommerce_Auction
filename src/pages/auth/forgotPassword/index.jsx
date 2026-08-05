import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  forgotPassword,
  getForgotPasswordErrorMessage,
} from "../../../services/passwordService";

import "./index.scss";

function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [account, setAccount] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!account.trim()) {
      newErrors.account = "Vui lòng nhập Email hoặc Số điện thoại";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Vui lòng nhập Email hoặc Số điện thoại");
      return;
    }

    try {
      setLoading(true);
      await forgotPassword(account);
      toast.success("Mã OTP đã được gửi");
      navigate("/verify-otp", {
        state: { account: account.trim() },
      });
    } catch (err) {
      toast.error(getForgotPasswordErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-page">
      <div className="forgot-card">
        <span className="back-login" onClick={() => navigate("/login")}>
          ← Quay lại đăng nhập
        </span>

        <span className="forgot-icon" aria-hidden="true">
          🔒
        </span>

        <h1>Quên Mật Khẩu</h1>

        <p>Nhập Email hoặc Số điện thoại đã đăng ký để nhận mã OTP</p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nhập email hoặc số điện thoại"
            value={account}
            onChange={(e) => {
              setAccount(e.target.value);
              setErrors({ account: "" });
            }}
            className={errors.account ? "input-error" : ""}
            disabled={loading}
          />

          {errors.account && <p className="field-error">{errors.account}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Đang gửi..." : "Gửi mã OTP"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
