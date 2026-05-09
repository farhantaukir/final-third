import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.component';

export default function AppShell() {
  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      <Sidebar />
      <main className="flex-1 overflow-auto px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-6xl space-y-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
