import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Compass,
  PartyPopper,
  Clock,
  Ticket,
  ArrowRight,
  MapPin,
  ShieldCheck,
  Globe2,
  Zap,
  Heart,
  Landmark,
  Sparkles,
} from 'lucide-react'
import { listAttractions, listFestivals } from '../api/explore'
import { addFavorite, removeFavorite, getFavorites } from '../api/favorites'
import { useAuth } from '../context/AuthContext'

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

const DEFAULT_FESTIVAL_IMG =
  'https://images.unsplash.com/photo-1599831069477-b2acdc0bcb91?auto=format&fit=crop&w=800&q=80'

const FESTIVAL_IMAGE_MAP = {
  'Masane Ki Holi (Bhasma Holi)':
    'https://images.unsplash.com/photo-1583089892943-e02e5b017b6a?auto=format&fit=crop&w=800&q=80',
  'Panchkroshi Yatra':
    'https://images.unsplash.com/photo-1649876674438-d81ccb39f48a?auto=format&fit=crop&w=800&q=80',
  'Subah-e-Banaras Morning Cultural Festival':
    'https://images.unsplash.com/photo-1596097825168-c9b773f404ff?auto=format&fit=crop&w=800&q=80',
  'Maha Shivratri':
    'https://images.unsplash.com/photo-1661771402987-9dc9db2cbb63?auto=format&fit=crop&w=800&q=80',
  'Sankat Mochan Music Festival':
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
}

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1561361058-c24cecae35ca?auto=format&fit=crop&w=1600&q=80'

const HIGHLIGHTS = [
  { icon: ShieldCheck, label: 'Official UP Tourism Data' },
  { icon: Globe2, label: 'Multilingual AI Support' },
  { icon: Zap, label: 'Real-time Local Insight' },
]

const UP_HERITAGE_CIRCUITS = [
  'Spiritual Varanasi',
  'Sarnath Buddhist Trail',
  'Heritage Ghats & Shrines',
  'Handicraft & Silk Hubs',
]

function getAttractionImage(name) {
  if (!name) return DEFAULT_ATTRACTION_IMG
  const lower = name.toLowerCase()
  for (const [key, url] of Object.entries(ATTRACTION_IMAGE_MAP)) {
    if (lower.includes(key.toLowerCase())) return url
  }
  return DEFAULT_ATTRACTION_IMG
}

function getFestivalImage(name) {
  if (!name) return DEFAULT_FESTIVAL_IMG
  const lower = name.toLowerCase()
  for (const [key, url] of Object.entries(FESTIVAL_IMAGE_MAP)) {
    if (lower.includes(key.toLowerCase())) return url
  }
  return DEFAULT_FESTIVAL_IMG
}

function CardSkeleton() {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm animate-pulse">
      <div className="h-48 bg-slate-100" />
      <div className="p-6 space-y-3">
        <div className="h-4 bg-slate-100 rounded-md w-3/4" />
        <div className="h-3 bg-slate-100 rounded-md w-1/2" />
        <div className="h-3 bg-slate-100 rounded-md w-2/3" />
      </div>
    </div>
  )
}

export default function Home() {
  const { user } = useAuth()
  const [attractions, setAttractions] = useState([])
  const [festivals, setFestivals] = useState([])
  const [loading, setLoading] = useState(true)
  const [savedFavorites, setSavedFavorites] = useState({})
  const location = useLocation()

  // Auto-scroll handler for URL hash (#explore)
  useEffect(() => {
    if (location.hash === '#explore') {
      const element = document.getElementById('explore')
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }, [location, loading])

  useEffect(() => {
    Promise.all([
      listAttractions(9),
      listFestivals(6),
      user ? getFavorites() : Promise.resolve({ data: { favorites: [] } }),
    ])
      .then(([a, f, favRes]) => {
        setAttractions(a?.data?.attractions?.filter((x) => x.place_name) || [])
        setFestivals(f?.data?.festivals?.filter((x) => x.festival_name) || [])

        const favsMap = {}
        favRes?.data?.favorites?.forEach((fav) => {
          favsMap[fav.place_name] = fav.id
        })
        setSavedFavorites(favsMap)
      })
      .catch((err) => console.error('Error fetching data:', err))
      .finally(() => setLoading(false))
  }, [user])

  const handleToggleFavorite = async (a) => {
    if (!user) {
      alert('Please sign in to save places to your favorites.')
      return
    }

    const isSaved = Boolean(savedFavorites[a.place_name])

    try {
      if (isSaved) {
        const favId = savedFavorites[a.place_name]
        await removeFavorite(favId)
        setSavedFavorites((prev) => {
          const updated = { ...prev }
          delete updated[a.place_name]
          return updated
        })
      } else {
        const { data } = await addFavorite({
          place_name: a.place_name,
          category: a.category || 'Attraction',
        })
        setSavedFavorites((prev) => ({
          ...prev,
          [a.place_name]: data?.favorite?.id || true,
        }))
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 selection:bg-amber-100 selection:text-amber-900">
      
      {/* --- HERO SECTION WITH UP TOURISM HIGHLIGHTS --- */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-500/10 via-slate-50 to-slate-50 pt-12 pb-20 md:pt-20 md:pb-28">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-200/30 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-orange-200/20 blur-3xl rounded-full pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6 grid lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6">
            
            {/* OFFICIAL UP TOURISM BADGE */}
            <div className="inline-flex items-center gap-2 bg-orange-100/80 border border-orange-300/80 text-orange-900 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-2xs">
              <Landmark size={14} className="text-orange-700" />
              <span>उत्तर प्रदेश पर्यटन | Uttar Pradesh Tourism Heritage</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.15]">
              Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">Varanasi</span>  Heart of UP Tourism.
            </h1>

            <p className="text-lg text-slate-600 leading-relaxed max-w-xl">
              Experience the spiritual capital of Uttar Pradesh. Explore verified ancient temples, sacred ghats, and rich cultural traditions powered by local intelligence.
            </p>

            {/* UP Heritage Circuit Badges */}
            <div className="flex flex-wrap gap-2 pt-1">
              {UP_HERITAGE_CIRCUITS.map((circuit) => (
                <span key={circuit} className="text-[11px] font-semibold text-slate-700 bg-white border border-slate-200/90 rounded-lg px-2.5 py-1 shadow-2xs">
                  ✨ {circuit}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to={user ? '/chat' : '/register'}
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl px-6 py-3.5 text-sm shadow-md hover:shadow-lg transition-all duration-200 group"
              >
                <span>Start Planning</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>

              <a
                href="#explore"
                className="inline-flex items-center gap-2 bg-white hover:bg-slate-100/80 text-slate-700 border border-slate-200/80 font-medium rounded-xl px-6 py-3.5 text-sm shadow-sm transition-all duration-200"
              >
                <span>Explore UP Destinations</span>
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-slate-200/60">
              {HIGHLIGHTS.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-xs font-medium text-slate-500">
                  <Icon size={15} className="text-amber-600" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT HERO SPOTLIGHT */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl p-2 bg-white shadow-xl shadow-slate-200/60 border border-slate-100">
              <div className="relative h-[380px] rounded-xl overflow-hidden">
                <img
                  src={HERO_IMAGE}
                  alt="Varanasi Ghats"
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-lg shadow-md border border-white/20 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600">UP Tourism Spotlight</p>
                    <span className="text-[9px] font-extrabold bg-orange-600 text-white px-1.5 py-0.5 rounded">UP Heritage</span>
                  </div>
                  <p className="text-sm font-bold text-slate-900">Varanasi Ghats &amp; Sacred Ganga Aarti</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* --- ATTRACTIONS SECTION --- */}
      <section id="explore" className="max-w-6xl mx-auto px-6 py-16 scroll-mt-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-amber-600 uppercase mb-1">
              <Compass size={14} />
              <span>Explore Destinations</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Top Uttar Pradesh Destinations</h2>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {attractions.map((a, i) => {
              const imageSrc = getAttractionImage(a.place_name)
              const isSaved = Boolean(savedFavorites[a.place_name])

              return (
                <div
                  key={a.place_name || i}
                  className="group bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
                >
                  <div className="relative h-48 overflow-hidden bg-slate-100">
                    <img
                      src={imageSrc}
                      alt={a.place_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent" />
                    
                    {a.category && (
                      <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-slate-800 text-[11px] font-semibold tracking-wide rounded-lg px-2.5 py-1 shadow-sm">
                        {a.category}
                      </span>
                    )}

                    {/* FAVORITE HEART SYMBOL BUTTON */}
                    <button
                      onClick={() => handleToggleFavorite(a)}
                      title={isSaved ? 'Remove from favorites' : 'Save to favorites'}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-slate-700 hover:scale-110 active:scale-95 transition-all shadow-md group/btn"
                    >
                      <Heart
                        size={16}
                        className={
                          isSaved
                            ? 'fill-red-500 text-red-500'
                            : 'text-slate-600 group-hover/btn:text-red-500 transition-colors'
                        }
                      />
                    </button>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <h3 className="font-semibold text-lg text-slate-900 group-hover:text-amber-600 transition-colors leading-snug">
                      {a.place_name}
                    </h3>

                    <div className="space-y-2 text-xs font-medium text-slate-500 border-t border-slate-100 pt-3">
                      {a.opening_time && (
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-slate-400" />
                          <span>{a.opening_time} – {a.closing_time}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Ticket size={14} className="text-slate-400" />
                        <span>{a.entry_fee || 'Free entry'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* --- FESTIVALS SECTION --- */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="flex items-end justify-between mb-10 border-t border-slate-200/60 pt-16">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-orange-600 uppercase mb-1">
              <PartyPopper size={14} />
              <span>UP Cultural Celebrations</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">UP Festivals &amp; Cultural Events</h2>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {festivals.map((f, i) => {
              const imageSrc = getFestivalImage(f.festival_name)
              return (
                <div
                  key={f.festival_name || i}
                  className="group bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="relative h-44 overflow-hidden bg-slate-100">
                    <img
                      src={imageSrc}
                      alt={f.festival_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                    <span className="absolute bottom-3 left-3 flex items-center gap-1 text-white text-[11px] font-medium bg-slate-900/40 backdrop-blur-md px-2.5 py-1 rounded-md">
                      <MapPin size={12} className="text-amber-400" /> Uttar Pradesh
                    </span>
                  </div>

                  <div className="p-5">
                    <h3 className="font-semibold text-lg text-slate-900 group-hover:text-amber-600 transition-colors mb-2">
                      {f.festival_name}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                      {f.content}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

    </div>
  )
}