import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import OtpInput from "../../../components/auth/OtpInput";
import {
  forgotPassword,
  getForgotPasswordErrorMessage,
} from "../../../services/passwordService";

import "./index.scss";

const RESEND_SECONDS = 60;

function VerifyOtpPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const account = location.state?.account || "";

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(RESEND_SECONDS);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!account) {
      navigate("/forgot-password", { replace: true });
    }
  }, [account, navigate]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleVerify = (e) => {
    e.preventDefault();

    if (!otp.trim()) {
      setError("Vui lòng nhập mã OTP");
      toast.error("Vui lòng nhập mã OTP");
      return;
    }

    if (otp.length !== 6) {
      setError("OTP phải gồm 6 chữ số");
      toast.error("OTP phải gồm 6 chữ số");
      return;
    }

    setError("");
    // OTP được xác thực kèm mật khẩu mới ở bước reset (POST /users/reset-password)
    navigate("/reset-password", {
      state: {
        account,
        otpCode: otp,
      },
    });
  };

  const handleResendOtp = async () => {
    if (cooldown > 0 || resending || !account) return;
    try {
      setResending(true);
      await forgotPassword(account);
      toast.success("Đã gửi lại mã OTP");
      setCooldown(RESEND_SECONDS);
    } catch (err) {
      toast.error(getForgotPasswordErrorMessage(err));
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="otp-page">
      <div className="otp-card">
        <span
          className="back-forgot"
          onClick={() => navigate("/forgot-password")}
        >
          ← Quay lại
        </span>

        <span className="otp-icon" aria-hidden="true">
          🔑
        </span>

        <h1>Xác Thực OTP</h1>

        <p>Mã OTP đã được gửi đến:</p>

        <p className="account-info">{account}</p>

        <form onSubmit={handleVerify}>
          <OtpInput
            value={otp}
            onChange={(value) => {
              setOtp(value);
              setError("");
            }}
            error={Boolean(error)}
          />

          {error && <p className="field-error">{error}</p>}

          <button type="submit">Xác nhận</button>
        </form>

        <span
          className={`resend ${cooldown > 0 || resending ? "disabled" : ""}`}
          onClick={handleResendOtp}
        >
          {cooldown > 0
            ? `Gửi lại OTP sau ${cooldown}s`
            : resending
              ? "Đang gửi..."
              : "Gửi lại OTP"}
        </span>
      </div>
    </div>
  );
}

export default VerifyOtpPage;
