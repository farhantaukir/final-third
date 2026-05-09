export default function StatCard({ label, value, hint }) {
  return (
    <div className="ft-surface overflow-hidden relative p-6 border-l-4 border-l-green-600 bg-white">
      <div className="relative z-10">
        <p className="text-xs font-bold uppercase tracking-wider text-green-700">{label}</p>
        <p className="mt-2 text-4xl font-extrabold text-gray-900">{value}</p>
        {hint ? <p className="mt-2 text-xs font-medium text-gray-500">{hint}</p> : null}
      </div>
      <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-green-50 to-transparent pointer-events-none"></div>
    </div>
  );
}
