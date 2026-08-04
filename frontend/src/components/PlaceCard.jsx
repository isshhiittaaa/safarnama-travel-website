import { Heart } from 'lucide-react'

export default function PlaceCard({
  name,
  meta,
  description,
  tone = 'default',
  onFavorite,
  favorited,
}) {
  const toneClasses = {
    default: 'bg-white border-slate-200/80',
    marigold: 'bg-amber-50/60 border-amber-200/80',
  }

  return (
    <div
      className={`border rounded-2xl p-5 ${toneClasses[tone]} hover:shadow-md hover:border-amber-300 transition-all duration-200 flex flex-col justify-between`}
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-1.5">
          <h3 className="font-bold text-sm text-slate-900 leading-snug">{name}</h3>
          {onFavorite && (
            <button
              onClick={onFavorite}
              title={favorited ? 'Remove from favorites' : 'Add to favorites'}
              className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 transition-all ${
                favorited
                  ? 'bg-rose-50 border-rose-200 text-rose-600 shadow-2xs'
                  : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-rose-500 hover:bg-rose-50/50 hover:border-rose-200'
              }`}
            >
              <Heart
                size={14}
                className={`transition-transform duration-200 ${favorited ? 'scale-110' : ''}`}
                fill={favorited ? 'currentColor' : 'none'}
              />
            </button>
          )}
        </div>

        {meta && <p className="text-[11px] font-semibold text-amber-700 mb-2">{meta}</p>}

        {description && (
          <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
            {description}
          </p>
        )}
      </div>
    </div>
  )
}