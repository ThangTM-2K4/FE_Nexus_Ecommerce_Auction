import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { verifyEmail, resendEmailOtp } from "../../../services/authService";
import OtpInput from "../../../components/auth/OtpInput";

import "./index.scss";

const RESEND_SECONDS = 60;

function RegisterVerifyOtpPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleVerify = async (e) => {
    e.preventDefault();

    if (!email) {
        toast.error("Không tìm thấy email cần xác thực.");
        navigate("/register");
        return;
    }

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

   try {
    setError("");

    await verifyEmail({
      email,
      otp,
    });

    toast.success("Xác thực tài khoản thành công");

    navigate("/login");
  } catch (err) {
    toast.error(
      err.response?.data?.message ||
      err.message ||
      "OTP không hợp lệ"
    );
  }
};

  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    try {
      await resendEmailOtp(email);

      toast.success("Đã gửi lại mã OTP");
      setCooldown(RESEND_SECONDS);
    } catch (err) {
      toast.error("Không thể gửi lại OTP");
    }
  };

  return (
    <div className="otp-page">
      <div className="otp-card">

        <span
          className="back-forgot"
          onClick={() => navigate("/register")}
        >
          ← Quay lại
        </span>

        <span className="otp-icon" aria-hidden="true">✉️</span>

        <h1>Xác Thực Email</h1>

        <p>Mã OTP đã được gửi đến:</p>

        <p className="account-info">
          {email}
        </p>

        <form onSubmit={handleVerify}>
          <OtpInput
            value={otp}
            onChange={(value) => {
              setOtp(value);
              setError("");
            }}
            error={Boolean(error)}
          />

          {error && (
            <p className="field-error">
              {error}
            </p>
          )}

          <button type="submit">
            Xác nhận
          </button>
        </form>

        <span
          className={`resend ${cooldown > 0 ? "disabled" : ""}`}
          onClick={handleResendOtp}
        >
          {cooldown > 0 ? `Gửi lại OTP sau ${cooldown}s` : "Gửi lại OTP"}
        </span>

      </div>
    </div>
  );
}

export default RegisterVerifyOtpPage;
