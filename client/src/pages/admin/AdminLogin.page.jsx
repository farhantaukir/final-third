import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiLogIn, FiArrowLeft, FiMail, FiLock, FiShield } from 'react-icons/fi';
import useAuth from '../../hooks/useAuth.hook';

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pl-11 text-sm text-slate-900 shadow-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100';

export default function AdminLoginPage() {
  const { loginAdminAction } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await loginAdminAction(form);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-purple-50 px-4 py-10">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800 shadow-lg shadow-slate-300">
            <FiShield className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Portal</h1>
          <p className="mt-2 text-sm text-slate-500">
            Restricted access for system administrators
          </p>
        </div>

        {/* Login card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="admin-email">
                Email address
              </label>
              <div className="relative">
                <FiMail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  id="admin-email"
                  name="email"
                  type="email"
                  placeholder="admin@finalthird.com"
                  className={inputClass}
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="admin-password">
                Password
              </label>
              <div className="relative">
                <FiLock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  id="admin-password"
                  name="password"
                  type="password"
                  placeholder="Enter admin password"
                  className={inputClass}
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-800 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-900 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
            >
              <FiLogIn size={16} />
              {submitting ? 'Signing in…' : 'Sign in as administrator'}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-5">
            <Link
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              to="/login"
            >
              <FiArrowLeft size={15} />
              Back to coach & player login
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          In the Final Third, every move matters.
        </p>
      </div>
    </div>
  );
}
