import { NavLink } from 'react-router-dom';
import {
  FiActivity,
  FiCalendar,
  FiEdit3,
  FiHome,
  FiLayers,
  FiLogOut,
  FiMail,
  FiMessageSquare,
  FiPieChart,
  FiUsers,
  FiUser,
  FiClock,
  FiBarChart2,
} from 'react-icons/fi';
import useAuth from '../hooks/useAuth.hook';

const linkClass =
  ({ isActive }) =>
    `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${isActive
      ? 'bg-green-800 text-white border border-green-700 shadow-sm'
      : 'text-green-100 hover:bg-green-800/50 hover:text-white'
    }`;

const adminSections = [
  {
    heading: 'Management',
    links: [
      { to: '/admin/dashboard', label: 'Dashboard', icon: FiHome },
      { to: '/admin/clubs', label: 'Leagues, Clubs and Rosters', icon: FiLayers },
      { to: '/admin/matches', label: 'Matches', icon: FiCalendar },
      { to: '/admin/users', label: 'Players and Coaches', icon: FiUsers },
      { to: '/admin/standings', label: 'League Table', icon: FiBarChart2 },
    ],
  },
];

const coachSections = [
  {
    heading: 'Coaching',
    links: [
      { to: '/coach/dashboard', label: 'Dashboard', icon: FiHome },
      { to: '/coach/matches/upcoming', label: 'Upcoming Matches', icon: FiCalendar },
      { to: '/coach/matches/history', label: 'Match History', icon: FiClock },
      { to: '/coach/analytics', label: 'Squad Analytics', icon: FiActivity },
      { to: '/coach/squad', label: 'Squad Roster', icon: FiUsers },
      { to: '/coach/communication', label: 'Announcements', icon: FiMessageSquare },
    ],
  },
];

const playerSections = [
  {
    heading: 'My Club',
    links: [
      { to: '/player/dashboard', label: 'Dashboard', icon: FiHome },
      { to: '/player/matches/upcoming', label: 'Upcoming Matches', icon: FiCalendar },
      { to: '/player/matches/history', label: 'Match History', icon: FiClock },
      { to: '/player/stats', label: 'My Performance', icon: FiActivity },
      { to: '/player/announcements', label: 'Announcements', icon: FiMail },
      { to: '/player/feedback', label: 'Coach Feedback', icon: FiMessageSquare },
    ],
  },
];

export default function Sidebar() {
  const { user, logoutAction } = useAuth();

  if (!user) {
    return null;
  }

  const sections =
    user.role === 'admin' ? adminSections : user.role === 'coach' ? coachSections : playerSections;

  const roleName = user.role === 'admin' ? 'Administrator' : user.role === 'coach' ? 'Coach' : 'Player';

  return (
    <aside className="flex min-h-screen w-72 shrink-0 flex-col bg-green-950 px-5 py-6 shadow-xl">
      <div className="mb-8 px-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-600 shadow-md">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2l2.4 5.5L20 8.5l-4 4 1.5 6.5L12 16.5 6.5 19l1.5-6.5-4-4 5.6-1L12 2z"></path></svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Final Third</p>
            <p className="text-xs text-green-300">{roleName}</p>
          </div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-6 overflow-y-auto text-sm">
        {sections.map((section) => (
          <div key={section.heading}>
            <p className="mb-3 px-2 text-[11px] font-bold uppercase tracking-wider text-green-400">
              {section.heading}
            </p>
            <div className="space-y-1">
              {section.links.map(({ to, label, icon: Icon }) => (
                <NavLink key={to} className={linkClass} end={to.endsWith('/dashboard')} to={to}>
                  <Icon aria-hidden size={18} /> {label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
        <div>
          <p className="mb-3 px-2 text-[11px] font-bold uppercase tracking-wider text-green-400">
            Account
          </p>
          <div className="space-y-1">
            <NavLink className={linkClass} to="/profile">
              <FiUser aria-hidden size={18} /> My Profile
            </NavLink>
            <NavLink className={linkClass} to="/profile/edit">
              <FiEdit3 aria-hidden size={18} /> Edit Profile
            </NavLink>
          </div>
        </div>
      </nav>

      <div className="mt-6 space-y-3">
        <div className="rounded-xl border border-green-800 bg-green-900/50 px-3 py-3">
          <div className="flex items-center gap-3">
            {user.profilePicture ? (
              <img
                alt={user.name}
                className="h-10 w-10 rounded-full object-cover ring-2 ring-green-700"
                src={user.profilePicture}
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-800 text-sm font-bold text-green-100 ring-2 ring-green-700">
                {String(user.name || 'U').charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{user.name}</p>
              <p className="truncate text-xs text-green-300">{user.email}</p>
            </div>
          </div>
        </div>
        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600/10 border border-red-500/20 px-3 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-600 hover:text-white"
          onClick={logoutAction}
        >
          <FiLogOut aria-hidden size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
