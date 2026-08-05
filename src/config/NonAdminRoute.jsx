import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRoleTokens } from './ProtectedRoute';

export default function NonAdminRoute({ children }) {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated && user) {
    const roleTokens = getRoleTokens(user);
    const isAdmin =
      roleTokens.includes('ADMIN') ||
      roleTokens.includes('SUPER_ADMIN') ||
      user?.role === 'ADMIN' ||
      user?.roleCode === 'ADMIN';

    if (isAdmin) {
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  return children;
}
