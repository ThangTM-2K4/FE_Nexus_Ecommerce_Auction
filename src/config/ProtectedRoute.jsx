import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Chuẩn hoá role về mảng token chữ HOA, bỏ tiền tố ROLE_.
// Chấp nhận: user.role (string | {code,name}), user.roles (mảng string | object).
export function getRoleTokens(user) {
  const raw = [];
  if (user?.role) raw.push(user.role);
  if (Array.isArray(user?.roles)) raw.push(...user.roles);

  return raw
    .map((r) =>
      typeof r === 'string' ? r : r?.code ?? r?.name ?? r?.role ?? r?.authority ?? ''
    )
    .filter(Boolean)
    .map((s) => String(s).toUpperCase().replace(/^ROLE_/, ''));
}

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles?.length) {
    const tokens = getRoleTokens(user);
    const allowed = allowedRoles.map((r) => String(r).toUpperCase().replace(/^ROLE_/, ''));
    const ok = tokens.some((t) => allowed.includes(t));
    if (!ok) {
      // Chẩn đoán: in ra role thật của backend để biết cần khớp gì
      console.warn('[ProtectedRoute] Bị chặn.', {
        allowedRoles: allowed,
        roleTokens: tokens,
        'user.role': user?.role,
        'user.roles': user?.roles,
      });
      return <Navigate to="/" replace />;
    }
  }

  return children;
}
