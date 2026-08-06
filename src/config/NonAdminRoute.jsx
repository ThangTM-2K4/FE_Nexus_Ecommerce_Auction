import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRoleTokens } from './ProtectedRoute';

export default function NonAdminRoute({ children }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (isAuthenticated && user) {
    const roleTokens = getRoleTokens(user);
    const isAdmin =
      roleTokens.includes('ADMIN') ||
      roleTokens.includes('SUPER_ADMIN') ||
      user?.role === 'ADMIN' ||
      user?.roleCode === 'ADMIN';

    // Cho phép Admin xem trang sảnh & chi tiết phiên đấu giá công khai
    const isPublicPreview =
      location.pathname.startsWith('/auction') ||
      location.pathname.startsWith('/product/');

    if (isAdmin && !isPublicPreview) {
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  return children;
}
