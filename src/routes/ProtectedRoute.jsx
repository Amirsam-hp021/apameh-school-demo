import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { HOME_BY_ROLE, useAuth } from '../context/AuthContext';

/**
 * Guards a group of routes.
 * - Not signed in: redirect to /login.
 * - Signed in with another role: redirect to that role's home.
 */
export default function ProtectedRoute({ roles }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (roles && !roles.includes(user.role)) return <Navigate to={HOME_BY_ROLE[user.role]} replace />;
  return <Outlet />;
}
