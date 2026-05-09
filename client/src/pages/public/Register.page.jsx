import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiLock, FiUserPlus, FiLogIn } from 'react-icons/fi';
import * as authService from '../../services/auth.service';

const inputClass = 'ft-input !pl-11';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'player',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const response = await authService.registerAccount(form);
      if (!response.success) {
        toast.error(response.message || 'Unable to register');
        return;
      }

      toast.success('Account created successfully! Please sign in.');
      navigate('/login', { replace: true });
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Unable to register';
      toast.error(message);
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
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Create your account</h1>
          <p className="mt-2 text-sm text-gray-500 font-medium">
            Join Final Third as a coach or player
          </p>
        </div>

        {/* Register card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="reg-name">
                Full name
              </label>
              <div className="relative">
                <FiUser className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  id="reg-name"
                  name="name"
                  placeholder="John Doe"
                  className={inputClass}
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="reg-email">
                Email address
              </label>
              <div className="relative">
                <FiMail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  id="reg-email"
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
              <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="reg-password">
                Password
              </label>
              <div className="relative">
                <FiLock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  id="reg-password"
                  name="password"
                  type="password"
                  placeholder="Minimum 6 characters"
                  className={inputClass}
                  value={form.password}
                  onChange={handleChange}
                  minLength={6}
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="reg-role">
                I am a
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${form.role === 'player'
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-100'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  onClick={() => setForm((prev) => ({ ...prev, role: 'player' }))}
                >
                  ⚽ Player
                </button>
                <button
                  type="button"
                  className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${form.role === 'coach'
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-100'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  onClick={() => setForm((prev) => ({ ...prev, role: 'coach' }))}
                >
                  📋 Coach
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
            >
              <FiUserPlus size={16} />
              {submitting ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-5">
            <Link
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              to="/login"
            >
              <FiLogIn size={15} />
              Already have an account? Sign in
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
