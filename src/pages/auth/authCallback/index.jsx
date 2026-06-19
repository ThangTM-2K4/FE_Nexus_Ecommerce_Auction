import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const code =
      searchParams.get("code");

    if (!code) {
      navigate("/");
      return;
    }

    exchangeCode(code);
  }, []);

  const exchangeCode = async (
    code
  ) => {
    try {
      const response = await fetch(
        "http://localhost:5101/api/v1/auth/exchange-code",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            code,
          }),
        }
      );

      const data =
        await response.json();

      localStorage.setItem(
        "accessToken",
        data.accessToken
      );

      localStorage.setItem(
        "refreshToken",
        data.refreshToken
      );

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      const role =
        data.user.roles?.[0];

      switch (role) {
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
          navigate("/buyer");
          break;

        default:
          navigate("/");
      }
    } catch (error) {
      navigate(
        "/?error=google_login_failed"
      );
    }
  };

  return (
    <div>
      Đang đăng nhập...
    </div>
  );
}

export default AuthCallback;