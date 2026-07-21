import { useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../../context/AuthContext";
import { exchangeCode } from "../../../services/authService";
import { getApiErrorMessage } from "../../../utils/apiResponse";
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
        // Exchange Google code
        const user = await exchangeCode(code);

        // Cập nhật AuthContext
        refreshUser();

        const roleTokens = getRoleTokens(user);

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
      } catch (err) {
        toast.error(getApiErrorMessage(err, "Đăng nhập Google thất bại"));
        navigate("/login?error=google_login_failed", {
          replace: true,
        });
      }
    };

    handleExchange();
  }, [searchParams, navigate, refreshUser]);

  return <div>Đang đăng nhập...</div>;
}

export default AuthCallback;