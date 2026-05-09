import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiLogIn, FiShield, FiUserPlus, FiMail, FiLock } from 'react-icons/fi';
import useAuth from '../../hooks/useAuth.hook';

const inputClass = 'ft-input !pl-11';

export default function LoginPage() {
  const { loginMemberAction } = useAuth();
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
      await loginMemberAction(form);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-slate-50 to-sky-50 px-4 py-10">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-600 shadow-lg shadow-green-200">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2l2.4 5.5L20 8.5l-4 4 1.5 6.5L12 16.5 6.5 19l1.5-6.5-4-4 5.6-1L12 2z"></path></svg>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome to Final Third</h1>
          <p className="mt-2 text-sm text-gray-500 font-medium">
            Sign in to your coach or player account
          </p>
        </div>

        {/* Login card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="login-email">
                Email address
              </label>
              <div className="relative">
                <FiMail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  className={inputClass}
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="login-password">
                Password
              </label>
              <div className="relative">
                <FiLock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
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
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
            >
              <FiLogIn size={16} />
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-5">
            <div className="flex flex-col gap-3 text-sm">
              <Link
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 font-medium text-slate-700 transition hover:bg-slate-50"
                to="/register"
              >
                <FiUserPlus size={15} />
                Create a new account
              </Link>
              <Link
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 font-medium text-slate-700 transition hover:bg-slate-50"
                to="/admin/login"
              >
                <FiShield size={15} />
                Admin login
              </Link>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          In the Final Third, every move matters.
        </p>
      </div>
    </div>
  );
}
