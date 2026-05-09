import useAuth from '../hooks/useAuth.hook';

function roleBadge(role) {
  switch (role) {
    case 'admin':
      return 'bg-purple-50 text-purple-800 border-purple-100';
    case 'coach':
      return 'bg-sky-50 text-sky-800 border-sky-100';
    case 'player':
      return 'bg-emerald-50 text-emerald-800 border-emerald-100';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const initials = user.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Profile</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Your account</h1>
        <p className="mt-2 text-sm text-slate-600">
          View your account details and club assignment.
        </p>
      </header>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          <div className="relative h-32 w-32 overflow-hidden rounded-2xl border border-slate-100 bg-emerald-50">
            {user.profilePicture ? (
              <img
                alt={`${user.name} profile`}
                className="h-full w-full object-cover"
                src={user.profilePicture}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-emerald-700">
                {initials}
              </div>
            )}
          </div>

          <div className="flex-1 space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">{user.name}</h2>
              <p className="mt-2 text-sm text-slate-600">{user.email}</p>
              <span
                className={`mt-4 inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${roleBadge(
                  user.role,
                )}`}
              >
                {user.role}
              </span>
            </div>

            <dl className="grid gap-6 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Club
                </dt>
                <dd className="mt-2 text-sm font-medium text-slate-900">
                  {user.club?.name ?? 'Not assigned to a club yet'}
                </dd>
              </div>

              {user.role === 'player' ? (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Position
                  </dt>
                  <dd className="mt-2 text-sm font-medium text-slate-900">
                    {user.position || 'Not assigned yet'}
                  </dd>
                </div>
              ) : null}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
