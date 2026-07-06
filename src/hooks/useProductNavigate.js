import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const scrollToTop = () => {
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
};

/**
 * Hook dùng chung: điều hướng tới chi tiết SP khi đã login,
 * hoặc sang login kèm redirect state khi chưa login.
 */
export function useProductNavigate() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleProductClick = useCallback(
    (id) => {
      const target = `/product/${id}`;
      scrollToTop();

      if (isAuthenticated) {
        navigate(target);
        return;
      }

      navigate('/login', { state: { redirectTo: target } });
    },
    [isAuthenticated, navigate],
  );

  const handleRequireLogin = useCallback(() => {
    scrollToTop();
    navigate('/login');
  }, [navigate]);

  return {
    isAuthenticated,
    handleProductClick,
    handleRequireLogin,
  };
}
