import { Link } from 'react-router-dom';
import { FiCalendar, FiClock, FiActivity, FiUsers, FiMessageSquare } from 'react-icons/fi';

export default function CoachDashboardPage() {
  const tiles = [
    {
      to: '/coach/matches/upcoming',
      icon: FiCalendar,
      title: 'Upcoming Matches',
      body: 'View scheduled fixtures and set your starting lineup and substitutes.',
    },
    {
      to: '/coach/matches/history',
      icon: FiClock,
      title: 'Match History',
      body: 'Review completed matches with final scores and lineups used.',
    },
    {
      to: '/coach/analytics',
      icon: FiActivity,
      title: 'Squad Analytics',
      body: 'Win/draw/loss record and a per-player performance leaderboard.',
    },
    {
      to: '/coach/squad',
      icon: FiUsers,
      title: 'Squad Roster',
      body: 'View player profiles and send individual performance feedback.',
    },
    {
      to: '/coach/communication',
      icon: FiMessageSquare,
      title: 'Announcements',
      body: 'Post team-wide announcements for training updates, travel plans, and more.',
    },
  ];

  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-green-800 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-green-700 to-green-900 p-10 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-xs font-bold uppercase tracking-widest text-green-300 mb-2">Dashboard</p>
          <h1 className="text-4xl font-extrabold tracking-tight">Coach Dashboard</h1>
          <p className="mt-4 max-w-2xl text-lg font-medium text-green-100">
            Manage your squad — set lineups, track performance, and communicate with your players.
          </p>
        </div>
        <div className="absolute -right-20 -top-20 opacity-20">
          <svg viewBox="0 0 24 24" className="w-96 h-96 text-white" fill="none" stroke="currentColor" strokeWidth="1"><circle cx="12" cy="12" r="10"></circle><path d="M12 2l2.4 5.5L20 8.5l-4 4 1.5 6.5L12 16.5 6.5 19l1.5-6.5-4-4 5.6-1L12 2z"></path></svg>
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        {tiles.map((tile) => {
          const Icon = tile.icon;
          return (
            <Link
              key={tile.to}
              className="group ft-surface p-6 transition-all duration-200 hover:-translate-y-1 hover:border-green-500 hover:shadow-xl"
              to={tile.to}
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-green-600 transition-colors group-hover:bg-green-600 group-hover:text-white">
                <Icon size={24} />
              </div>
              <p className="text-xl font-bold text-gray-900 group-hover:text-green-700">{tile.title}</p>
              <p className="mt-2 text-sm text-gray-600">{tile.body}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
