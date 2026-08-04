export default function Loader({ label = 'Loading' }) {
  return (
    <div className="flex items-center justify-center gap-2.5 py-6 text-slate-500 text-xs font-semibold">
      <span className="flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce [animation-delay:-0.3s]" />
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce [animation-delay:-0.15s]" />
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" />
      </span>
      <span>{label}...</span>
    </div>
  )
}