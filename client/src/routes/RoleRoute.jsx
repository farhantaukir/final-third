import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth.hook';
import { dashboardPath } from '../routing.paths';

export default function RoleRoute({ allowedRoles = [], children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={dashboardPath(user.role)} replace />;
  }

  return children;
}
