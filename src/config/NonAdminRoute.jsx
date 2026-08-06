import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRoleTokens } from './ProtectedRoute';

export default function NonAdminRoute({ children }) {
  // Cho phép tất cả người dùng (kể cả Admin) xem trang chủ và các trang mua sắm công khai
  return children;
}
