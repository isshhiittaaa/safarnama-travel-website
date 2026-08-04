export default function StatCard({ label, value, sub, icon: Icon }) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </p>
        {Icon && (
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-200/60 flex items-center justify-center text-amber-600">
            <Icon size={16} />
          </div>
        )}
      </div>
      <p className="text-2xl font-extrabold text-slate-900 tracking-tight">{value}</p>
      {sub && <p className="text-[11px] font-medium text-slate-500 mt-1">{sub}</p>}
    </div>
  )
}