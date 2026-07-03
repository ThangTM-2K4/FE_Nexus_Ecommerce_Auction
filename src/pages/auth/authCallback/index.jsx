import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from '../../../context/AuthContext';
import { exchangeCode } from '../../../services/authService';

function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  useEffect(() => {
    const code = searchParams.get("code");

    if (!code) {
      navigate("/login?error=google_login_failed", { replace: true });
      return;
    }

    const handleExchange = async () => {
      try {
        const user = await exchangeCode(code);
        refreshUser();

        const role = user?.roles?.[0] || user?.role;

        switch (role) {
          case "ADMIN":
            navigate("/admin", { replace: true });
            break;

          case "STAFF":
            navigate("/staff/overview", { replace: true });
            break;

          case "SELLER":
            navigate("/seller-hub", { replace: true });
            break;

          case "BUYER":
            navigate("/", { replace: true });
            break;

          default:
            navigate("/", { replace: true });
        }
      } catch {
        toast.error("Đăng nhập Google thất bại");
        navigate("/login?error=google_login_failed", { replace: true });
      }
    };

    handleExchange();
  }, [searchParams, navigate, refreshUser]);

  return (
    <div>
      Đang đăng nhập...
    </div>
  );
}

export default AuthCallback;
