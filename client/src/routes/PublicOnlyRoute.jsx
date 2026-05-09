import { Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth.hook';

export default function PublicOnlyRoute() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  return <Outlet />;
}
