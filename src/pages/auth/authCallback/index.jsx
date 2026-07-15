import { useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../../context/AuthContext";
import { exchangeCode } from "../../../services/authService";
import { getRoleTokens } from "../../../config/ProtectedRoute";
function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const hasExchanged = useRef(false);
  useEffect(() => {
    const code = searchParams.get("code");

    if (!code) {
      navigate("/login?error=google_login_failed", { replace: true });
      return;
    }

    const handleExchange = async () => {
      if (hasExchanged.current) return;
      hasExchanged.current = true;
      try {
        // 1. exchangeCode return full object User
        const user = await exchangeCode(code);

        refreshUser(); // Cập nhật context

        // 2. Pass the user directly to getRoleTokens
        const roleTokens = getRoleTokens(user);

        // 3. Chuyển hướng
        if (
          roleTokens.includes("ADMIN") ||
          roleTokens.includes("SUPER_ADMIN")
        ) {
          navigate("/admin", { replace: true });
        } else if (
          roleTokens.includes("STAFF") ||
          roleTokens.includes("SUPPORT_STAFF")
        ) {
          navigate("/staff/overview", { replace: true });
        } else if (
          roleTokens.includes("SELLER") ||
          user?.sellerStatus === "APPROVED"
        ) {
          navigate("/seller-hub", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      } catch (error) {
        console.error("Lỗi ẩn trong Callback:", error);
        toast.error("Đăng nhập Google thất bại");
        navigate("/login?error=google_login_failed", { replace: true });
      }
    };

    handleExchange();
  }, [searchParams, navigate, refreshUser]);

  return <div>Đang đăng nhập...</div>;
}

export default AuthCallback;
