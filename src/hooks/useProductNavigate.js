import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { resolveProductId } from '../services/catalogService';

const scrollToTop = () => {
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
};

/**
 * Hook dùng chung: điều hướng SP và yêu cầu đăng nhập (kèm redirect nếu cần).
 */
export function useProductNavigate() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleProductClick = useCallback(
    (productOrId, rawProduct = null) => {
      scrollToTop();

      const product = typeof productOrId === 'object' && productOrId !== null
        ? productOrId
        : { id: productOrId };

      const productId = resolveProductId(product);
      if (!productId) {
        console.warn('[useProductNavigate] Không xác định được productId', productOrId);
        return;
      }

      navigate(`/product/${encodeURIComponent(productId)}`, {
        state: {
          productPreview: rawProduct || product,
        },
      });
    },
    [navigate],
  );

  const handleRequireLogin = useCallback(
    (redirectTo) => {
      scrollToTop();
      navigate('/login', { state: redirectTo ? { redirectTo } : undefined });
    },
    [navigate],
  );

  const requireAuth = useCallback(
    (redirectTo = '/checkout') => {
      if (isAuthenticated) return true;
      handleRequireLogin(redirectTo);
      return false;
    },
    [isAuthenticated, handleRequireLogin],
  );

  return {
    isAuthenticated,
    handleProductClick,
    handleRequireLogin,
    requireAuth,
  };
}
