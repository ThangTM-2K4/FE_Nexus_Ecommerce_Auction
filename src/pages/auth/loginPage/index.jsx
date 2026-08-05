import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { toast } from "react-toastify";
import { useAuth } from "../../../context/AuthContext";
import {
  getGoogleLoginUrl,
  ACCOUNT_BLOCKED_DETAIL,
} from "../../../services/authService";
import { getRoleTokens } from "../../../config/ProtectedRoute";
import {
  LOGIN_SESSION_EXPIRED_KEY,
  sanitizeInternalRedirect,
} from "../../../utils/httpErrorRedirect";
import { toggleWatchlist } from "../../../components/auction/auctionCard";
import "./index.scss";


function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [searchParams] = useSearchParams();

  const redirectParam = searchParams.get("redirect");
  const redirectTo =
    sanitizeInternalRedirect(redirectParam) || location.state?.redirectTo || null;

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({});

  // Lỗi chung của cả form (vd sai thông tin đăng nhập) — hiện rõ ngay dưới các ô nhập.
  const [formError, setFormError] = useState("");

  const [formData, setFormData] = useState({
    login: "",
    password: "",
  });

  useEffect(() => {
    try {
      const expiredMsg = sessionStorage.getItem(LOGIN_SESSION_EXPIRED_KEY);
      if (expiredMsg) {
        toast.error(expiredMsg);
        sessionStorage.removeItem(LOGIN_SESSION_EXPIRED_KEY);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const errorCode = searchParams.get("error");

    if (!errorCode) return;

    switch (errorCode) {
      case "google_login_failed":
        toast.error("Đăng nhập Google thất bại");
        break;

      case "email_claim_conflict":
        toast.error("Email Google đã tồn tại trong hệ thống");
        break;

      default:
        toast.error("Có lỗi xảy ra khi đăng nhập Google");
    }
  }, [searchParams]);

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

    setFormError("");
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.login.trim()) {
      newErrors.login = "Vui lòng nhập Email hoặc Số điện thoại";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  if (import.meta.env.VITE_ENV) {
    console.log("API URL:", import.meta.env.VITE_API_BASE_URL);
    console.log("Google URL:", import.meta.env.VITE_GOOGLE_LOGIN_URL);
  }

  const handleGoogleLogin = () => {
    window.location.href = getGoogleLoginUrl();
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const user = await login(formData.login, formData.password);

      toast.success("Đăng nhập thành công!");

      setTimeout(() => {
        const pendingAction = location.state?.pendingAction;
        if (pendingAction) {
          if (pendingAction.type === "TOGGLE_WATCHLIST" && pendingAction.auction) {
            toggleWatchlist(pendingAction.auction);
            toast.success(
              `🎉 Đã lưu "${pendingAction.auction.title || "Sản phẩm"}" vào mục Đang Theo Dõi của bạn!`
            );
          }
        }

        const roleTokens = getRoleTokens(user);
        const isAdmin =
          roleTokens.includes("ADMIN") || roleTokens.includes("SUPER_ADMIN");
        const isStaff =
          roleTokens.includes("STAFF") || roleTokens.includes("SUPPORT_STAFF");
        const isSeller =
          roleTokens.includes("SELLER") ||
          user?.sellerStatus === "APPROVED" ||
          user?.isSeller === true ||
          user?.role === "SELLER";

        if (isAdmin) {
          navigate("/admin", { replace: true });
        } else if (isStaff) {
          navigate("/staff/overview", { replace: true });
        } else if (isSeller) {
          navigate("/seller-hub/overview", { replace: true });
        } else if (redirectTo && !isProtectedRouteRedirect) {
          navigate(redirectTo, { replace: true, state: location.state });
        } else {
          navigate("/", { replace: true });
        }
      }, 600);
    } catch (err) {
      const detail =
        err.response?.data?.detail || err.response?.data?.message || "";

      if (err.response?.status === 401) {
        if (detail === ACCOUNT_BLOCKED_DETAIL || /not allowed/i.test(detail)) {
          const blockedMsg = "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.";
          setErrors({ login: blockedMsg });
          toast.error(blockedMsg);
          return;
        }

        // Chỉ tô đỏ ô mật khẩu kèm lỗi cụ thể
        const credMsg = "Mật khẩu không chính xác hoặc tài khoản chưa đúng";
        setErrors({ password: "Mật khẩu không chính xác" });
        toast.error(credMsg);
        return;
      }

      const genericMsg = err.message || "Đăng nhập thất bại. Vui lòng thử lại.";
      setErrors({ password: genericMsg });
      toast.error(genericMsg);
    } finally {
      setLoading(false);
    }
  };

  const isProtectedRouteRedirect =
    redirectTo &&
    (redirectTo.startsWith("/admin") ||
      redirectTo.startsWith("/staff") ||
      redirectTo.startsWith("/seller"));

  const handleBackClick = () => {
    if (redirectTo && !isProtectedRouteRedirect) {
      navigate(redirectTo, { replace: true });
    } else {
      navigate("/", { replace: true });
    }
  };

  const backLabel =
    redirectTo && !isProtectedRouteRedirect
      ? redirectTo.startsWith("/auction")
        ? "Quay về trang đấu giá"
        : "Quay về trang trước"
      : "Quay về trang chủ";


  return (
    <div className="login-page">
      <div className="login-card">
        <button
          type="button"
          className="back-home-btn"
          onClick={handleBackClick}
        >
          ← {backLabel}
        </button>


        <h1>Sàn Đấu Giá Điện Tử</h1>

        <p className="subtitle">Hệ thống Đấu giá Thương mại Điện tử</p>

        <p className="description">
          Nền tảng đấu giá trực tuyến an toàn, minh bạch và hiệu quả
        </p>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <input
              type="text"
              name="login"
              placeholder="Email hoặc Số điện thoại"
              value={formData.login}
              onChange={handleChange}
              className={errors.login ? "input-error" : ""}
            />

            <div className="field-error">{errors.login || "\u00A0"}</div>
          </div>

          <div className="form-group">
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Mật khẩu"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? "input-error" : ""}
              />

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

          <button
            type="button"
            className="forgot-password"
            onClick={() => navigate("/forgot-password")}
          >
            Quên mật khẩu?
          </button>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? (
              <span className="spinner-text">⏳ Đang đăng nhập...</span>
            ) : (
              "Đăng nhập"
            )}
          </button>

          <div className="divider">HOẶC</div>

          <button
            type="button"
            className="google-btn"
            onClick={handleGoogleLogin}
          >
            <FcGoogle size={22} />
            Đăng nhập bằng Google
          </button>

          <div className="register-link">
            Chưa có tài khoản?
            <span onClick={() => navigate("/register")}>Đăng ký ngay</span>
          </div>

          <div className="login-footer">
            <p>© 2026 Hệ Thống Đấu Giá Thương Mại Điện Tử</p>
            <p>An toàn • Minh bạch • Hiệu quả</p>
            <p>
              Đây là sản phẩm học tập không phục vụ cho mục đích thương mại đời
              sống
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;