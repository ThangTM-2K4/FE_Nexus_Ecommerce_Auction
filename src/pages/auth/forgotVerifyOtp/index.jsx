import React, { useState } from "react";
import {useNavigate,useLocation,} from "react-router-dom";

import { toast } from "react-toastify";

import "./index.scss";

function VerifyOtpPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const account =
    location.state?.account || "";

  const [otp, setOtp] = useState("");
  const [error, setError] =
    useState("");

  const handleVerify = (e) => {
    e.preventDefault();

    if (!otp.trim()) {
      setError("Vui lòng nhập mã OTP");
      toast.error("Vui lòng nhập mã OTP");
      return;
    }

    if (otp.length !== 6) {
      setError("OTP phải gồm 6 chữ số");
      toast.error(
        "OTP phải gồm 6 chữ số"
      );
      return;
    }

    setError("");

    toast.success(
      "Xác thực OTP thành công"
    );

    navigate("/reset-password", {
      state: {
        account,
      },
    });
  };

  const handleResendOtp = () => {
    toast.success(
      "Đã gửi lại mã OTP"
    );
  };

  return (
    <div className="otp-page">
      <div className="otp-card">

        <span
          className="back-forgot"
          onClick={() =>
            navigate("/forgot-password")
          }
        >
          ← Quay lại
        </span>

        <h1>Xác Thực OTP</h1>

        <p>
          Mã OTP đã được gửi đến:
        </p>

        <p className="account-info">
          {account}
        </p>

        <form onSubmit={handleVerify}>
          <input
            type="text"
            maxLength={6}
            placeholder="Nhập OTP"
            value={otp}
            className={
              error ? "input-error" : ""
            }
            onChange={(e) => {
              const value =
                e.target.value.replace(
                  /\D/g,
                  ""
                );

              setOtp(value);
              setError("");
            }}
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
          className="resend"
          onClick={handleResendOtp}
        >
          Gửi lại OTP
        </span>
      </div>
    </div>
  );
}

export default VerifyOtpPage;