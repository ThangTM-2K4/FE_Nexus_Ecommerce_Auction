import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Chuẩn hoá role về mảng token chữ HOA, bỏ tiền tố ROLE_.
// Chấp nhận: user.role (string | {code,name}), user.roles (mảng string | object).
export function getRoleTokens(user) {
  const raw = [];
  if (user?.role) raw.push(user.role);
  if (user?.roleName) raw.push(user.roleName);
  if (user?.roleCode) raw.push(user.roleCode);
  if (Array.isArray(user?.roles)) raw.push(...user.roles);
  if (Array.isArray(user?.roleCodes)) raw.push(...user.roleCodes);

  return raw
    .map((r) =>
      typeof r === 'string'
        ? r
        : r?.code ?? r?.name ?? r?.role ?? r?.roleName ?? r?.authority ?? ''
    )
    .filter(Boolean)
    .map((s) => String(s).toUpperCase().replace(/^ROLE_/, ''));
}

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ redirectTo: location.pathname + location.search }}
      />
    );
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
