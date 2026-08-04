import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Heart,
  Trash2,
  Search,
  MessageSquare,
  ArrowRight,
  Compass,
  MapPin,
} from 'lucide-react'
import { getFavorites, removeFavorite } from '../api/favorites'
import Loader from '../components/Loader'

// --- CONTEXTUAL IMAGE DICTIONARY ---
const DEFAULT_ATTRACTION_IMG =
  'https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=800&q=80'

const ATTRACTION_IMAGE_MAP = {
  'Vishwanath Gali':
    'https://images.unsplash.com/photo-1561361058-c24cecae35ca?auto=format&fit=crop&w=1600&q=80',
  'Kashi Vishwanath Temple':
    'https://images.unsplash.com/photo-1661771402987-9dc9db2cbb63?auto=format&fit=crop&w=800&q=80',
  'Godowlia Market':
    'https://images.unsplash.com/photo-1608412525537-662195e817c5?auto=format&fit=crop&w=800&q=80',
  'Annapurna Temple':
    'https://images.unsplash.com/photo-1708706995659-58010684bc7c?auto=format&fit=crop&w=800&q=80',
  'Chintamani Ganesh Temple':
    'https://images.unsplash.com/photo-1649876674438-d81ccb39f48a?auto=format&fit=crop&w=800&q=80',
  'Thatheri Bazaar':
    'https://images.unsplash.com/photo-1608412525537-662195e817c5?auto=format&fit=crop&w=800&q=80',
  'Varanasi Silk Weaving Village (Peoplani / Madanpura)':
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
  'Dashashwamedh Ghat':
    'https://images.unsplash.com/photo-1561361058-c24cecae35ca?auto=format&fit=crop&w=800&q=80',
}

// Helper function to resolve image URL safely from API or Image Map
function getFavoriteImage(fav) {
  if (fav.image_url) return fav.image_url
  if (!fav.place_name) return DEFAULT_ATTRACTION_IMG

  const lower = fav.place_name.toLowerCase()
  for (const [key, url] of Object.entries(ATTRACTION_IMAGE_MAP)) {
    if (lower.includes(key.toLowerCase())) return url
  }
  return DEFAULT_ATTRACTION_IMG
}

export default function Favorites() {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchFilter, setSearchFilter] = useState('')

  useEffect(() => {
    loadFavorites()
  }, [])

  const loadFavorites = async () => {
    setLoading(true)
    try {
      const { data } = await getFavorites()
      setFavorites(data?.favorites || [])
    } catch (err) {
      console.error('Failed to load favorites:', err)
      setFavorites([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (favoriteId) => {
    try {
      await removeFavorite(favoriteId)
      setFavorites((prev) => prev.filter((f) => f.id !== favoriteId))
    } catch (err) {
      console.error('Failed to remove favorite:', err)
    }
  }

  const filteredFavorites = favorites.filter((f) =>
    f.place_name?.toLowerCase().includes(searchFilter.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#faf8f5] text-slate-800 py-8 selection:bg-amber-100 selection:text-amber-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        
        {/* --- HEADER --- */}
        <div className="bg-white border border-amber-200/80 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold tracking-wider text-amber-700 uppercase mb-1">
              <Heart size={14} className="fill-amber-500 text-amber-600" /> Curated Collection
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Saved Favorites
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Your bookmarked spiritual spots, ghats, and cultural highlights across Uttar Pradesh.
            </p>
          </div>

          {/* Action Controls (Filter + Explore Button) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {favorites.length > 0 && (
              <div className="relative w-full sm:w-56">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Filter saved places..."
                  className="w-full bg-[#faf8f5] border border-amber-200/80 rounded-2xl pl-9 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition"
                />
              </div>
            )}

            {/* Always-visible Explore More link */}
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-2xl transition shadow-xs whitespace-nowrap"
            >
              <Compass size={14} />
              <span>Explore More Places</span>
            </Link>
          </div>
        </div>

        {/* --- CONTENT AREA --- */}
        {loading ? (
          <div className="py-16">
            <Loader label="Fetching your saved destinations..." />
          </div>
        ) : favorites.length === 0 ? (
          <div className="bg-white border border-amber-200/80 rounded-3xl p-12 text-center max-w-md mx-auto space-y-5 shadow-xs">
            <div className="w-14 h-14 rounded-3xl bg-amber-100/80 border border-amber-300 flex items-center justify-center text-amber-800 mx-auto shadow-xs">
              <Compass size={28} />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-900">No Saved Destinations</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Explore attractions on the homepage and click the heart icon to save places to your itinerary.
              </p>
            </div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-6 py-3 rounded-2xl transition shadow-md"
            >
              <span>Explore Uttar Pradesh</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : filteredFavorites.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <p className="text-xs font-medium">No places matching "{searchFilter}" found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFavorites.map((f) => {
              const imageSrc = getFavoriteImage(f)

              return (
                <div
                  key={f.id}
                  className="group bg-white border border-amber-200/80 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                >
                  {/* FEATURED DESTINATION IMAGE */}
                  <div className="relative h-48 overflow-hidden bg-slate-100">
                    <img
                      src={imageSrc}
                      alt={f.place_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent" />
                    
                    {/* Category Pill */}
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-slate-800 text-[11px] font-semibold tracking-wide rounded-lg px-2.5 py-1 shadow-sm">
                      {f.category || 'Attraction'}
                    </span>

                    {/* Delete / Remove Favorite Button */}
                    <button
                      onClick={() => handleDelete(f.id)}
                      title="Remove from favorites"
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-slate-700 hover:text-red-600 hover:scale-110 active:scale-95 transition-all shadow-md"
                    >
                      <Trash2 size={15} />
                    </button>

                    {/* Location Badge Overlay */}
                    <span className="absolute bottom-3 left-3 flex items-center gap-1 text-white text-[11px] font-medium bg-slate-900/40 backdrop-blur-md px-2 py-0.5 rounded-md">
                      <MapPin size={12} className="text-amber-400" /> Uttar Pradesh
                    </span>
                  </div>

                  {/* CARD BODY */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <h3 className="font-semibold text-lg text-slate-900 group-hover:text-amber-700 transition-colors leading-snug">
                      {f.place_name}
                    </h3>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <Link
                        to="/chat"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800 transition"
                      >
                        <MessageSquare size={13} />
                        <span>Ask AI about this place</span>
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}