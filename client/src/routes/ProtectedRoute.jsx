import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth.hook';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const isAdminArea =
    location.pathname.startsWith('/admin') && !location.pathname.startsWith('/admin/login');

  const loginTarget = isAdminArea ? '/admin/login' : '/login';

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={loginTarget} replace />;
  }

  return <Outlet />;
}
