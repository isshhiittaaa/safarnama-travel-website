import { useEffect, useState } from 'react'
import {
  Star,
  Search,
  Send,
  Camera,
  Trash2,
  MessageSquare,
  UserCheck,
  MapPin,
  Sparkles,
  X,
  CheckCircle2,
  AlertCircle,
  ThumbsUp,
} from 'lucide-react'
import { submitTip, getTipsForPlace, getMyTips, removeTip } from '../api/tips'
import Loader from '../components/Loader'

// Backend API URL fallback for static files
const BACKEND_URL = 'http://localhost:8000'
const DEFAULT_VARANASI_FALLBACK =
  'https://images.unsplash.com/photo-1561361058-c24cecae35ca?auto=format&fit=crop&w=800&q=80'

export default function Feedback() {
  // Navigation Tabs: 'browse' or 'my-feedback'
  const [activeTab, setActiveTab] = useState('browse')

  // Search State
  const [placeName, setPlaceName] = useState('')
  const [browseTips, setBrowseTips] = useState([])
  const [hasSearched, setHasSearched] = useState(false)
  const [loadingBrowse, setLoadingBrowse] = useState(false)

  // User's Own Feedback State
  const [myTips, setMyTips] = useState([])
  const [loadingMyTips, setLoadingMyTips] = useState(false)

  // Submit Form State
  const [form, setForm] = useState({
    place_name: '',
    rating: 5,
    tip_text: '',
  })
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitFeedback, setSubmitFeedback] = useState({ type: '', msg: '' })

  // Initial load for user's own feedback
  useEffect(() => {
    loadMyTips()
  }, [])

  const loadMyTips = async () => {
    setLoadingMyTips(true)
    try {
      const { data } = await getMyTips()
      setMyTips(data?.tips || [])
    } catch (err) {
      console.error('Failed to load user feedback:', err)
    } finally {
      setLoadingMyTips(false)
    }
  }

  const handleSearch = async () => {
    if (!placeName.trim()) return
    setLoadingBrowse(true)
    setHasSearched(true)
    try {
      const { data } = await getTipsForPlace(placeName.trim())
      setBrowseTips(data?.tips || [])
    } catch (err) {
      console.error('Search failed:', err)
      setBrowseTips([])
    } finally {
      setLoadingBrowse(false)
    }
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoFile(file)
      setPhotoPreview(URL.createObjectURL(file))
    }
  }

  const clearPhoto = () => {
    setPhotoFile(null)
    setPhotoPreview(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.place_name.trim() || !form.tip_text.trim()) return

    setSubmitting(true)
    setSubmitFeedback({ type: '', msg: '' })

    try {
      const formData = new FormData()
      formData.append('place_name', form.place_name.trim())
      formData.append('rating', form.rating)
      formData.append('tip_text', form.tip_text.trim())
      if (photoFile) {
        formData.append('photo', photoFile)
      }

      await submitTip(formData)

      setSubmitFeedback({
        type: 'success',
        msg: 'Thank you! Your feedback has been published for fellow travelers.',
      })
      setForm({ place_name: '', rating: 5, tip_text: '' })
      clearPhoto()

      if (placeName.toLowerCase() === form.place_name.toLowerCase()) {
        handleSearch()
      }
      loadMyTips()
    } catch (err) {
      setSubmitFeedback({
        type: 'error',
        msg: err.response?.data?.detail || 'Could not post feedback. Please try again.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteTip = async (tipId) => {
    try {
      await removeTip(tipId)
      setMyTips((prev) => prev.filter((t) => t.id !== tipId))
      setBrowseTips((prev) => prev.filter((t) => t.id !== tipId))
    } catch (err) {
      console.error('Failed to delete feedback:', err)
    }
  }

  // Smart Photo Path Resolution Helper
  const getPhotoSrc = (tip) => {
    if (!tip) return null
    if (tip.photo_url) return tip.photo_url
    if (tip.photo_path) {
      const filename = tip.photo_path.split(/[/\\]/).pop()
      return `${BACKEND_URL}/static/tips/${filename}`
    }
    return null
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] text-slate-800 py-8 selection:bg-amber-100 selection:text-amber-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        
        {/* --- HEADER HERO --- */}
        <div className="bg-white border border-amber-200/80 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold tracking-wider text-amber-700 uppercase">
              <Sparkles size={14} /> Traveler Insights &amp; Reviews
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Share Your Experience with <span className="text-amber-800 font-serif italic">Safarnama</span>
            </h1>
            <p className="text-xs text-slate-500">
              Help us refine UP tourism guidelines and share authentic feedback on destinations, ghats, and local food spots.
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="inline-flex p-1 bg-[#f5ede1]/80 rounded-2xl border border-amber-200/80 self-start sm:self-auto shrink-0">
            <button
              onClick={() => setActiveTab('browse')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'browse'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Search Reviews
            </button>
            <button
              onClick={() => setActiveTab('my-feedback')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'my-feedback'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>My Reviews</span>
              {myTips.length > 0 && (
                <span className="bg-amber-100 text-amber-900 text-[10px] px-1.5 py-0.5 rounded-full font-extrabold">
                  {myTips.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* --- MAIN GRID LAYOUT --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: BROWSE OR MY FEEDBACK (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {activeTab === 'browse' ? (
              <div className="bg-white border border-amber-200/80 rounded-3xl p-6 shadow-xs space-y-6">
                <div>
                  <h2 className="text-base font-bold text-slate-900 mb-1">
                    Discover Verified Traveler Reviews
                  </h2>
                  <p className="text-xs text-slate-500">
                    Search specific shrines, ghats, or restaurants to read advice from past visitors.
                  </p>
                </div>

                {/* Search Box */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      value={placeName}
                      onChange={(e) => setPlaceName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="e.g. Dashashwamedh Ghat, Deena Chat Bhandar..."
                      className="w-full bg-[#faf8f5] border border-amber-200/80 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition"
                    />
                  </div>
                  <button
                    onClick={handleSearch}
                    disabled={loadingBrowse || !placeName.trim()}
                    className="bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-bold rounded-2xl px-5 py-2.5 text-xs flex items-center gap-1.5 transition shadow-2xs"
                  >
                    <Search size={14} /> Search
                  </button>
                </div>

                {/* Content Stream */}
                {loadingBrowse ? (
                  <div className="py-12">
                    <Loader label="Searching verified traveler feedback..." />
                  </div>
                ) : !hasSearched ? (
                  <div className="py-12 text-center text-slate-400 space-y-2">
                    <Search size={32} className="mx-auto text-amber-600/40" />
                    <p className="text-xs font-medium">Type a destination above to display traveler feedback.</p>
                  </div>
                ) : browseTips.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 space-y-2 border border-dashed border-amber-200 rounded-2xl">
                    <MessageSquare size={32} className="mx-auto text-amber-600/40" />
                    <p className="text-xs font-medium">No reviews logged for "{placeName}" yet. Be the first!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {browseTips.map((t) => {
                      const photoSrc = getPhotoSrc(t)
                      return (
                        <div
                          key={t.id}
                          className="bg-[#faf8f5]/80 border border-amber-200/80 rounded-2xl p-4 space-y-3 hover:bg-[#faf8f5] transition shadow-2xs"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold uppercase">
                                {t.username ? t.username[0] : 'U'}
                              </div>
                              <span className="text-xs font-bold text-slate-800">{t.username || 'Anonymous Explorer'}</span>
                            </div>

                            <div className="flex items-center gap-1 bg-amber-100/80 border border-amber-300 text-amber-900 px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold">
                              <Star size={11} className="fill-amber-500 text-amber-500" />
                              <span>{t.rating}/5</span>
                            </div>
                          </div>

                          <p className="text-xs text-slate-600 leading-relaxed">{t.tip_text}</p>

                          {photoSrc && (
                            <div className="h-48 rounded-xl overflow-hidden border border-amber-200/80 bg-slate-100">
                              <img
                                src={photoSrc}
                                alt={`${t.place_name || 'Feedback'} photo`}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  e.currentTarget.onerror = null
                                  e.currentTarget.src = DEFAULT_VARANASI_FALLBACK
                                }}
                              />
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ) : (
              /* MY REVIEWS TAB */
              <div className="bg-white border border-amber-200/80 rounded-3xl p-6 shadow-xs space-y-6">
                <div>
                  <h2 className="text-base font-bold text-slate-900 mb-1">My Submitted Reviews</h2>
                  <p className="text-xs text-slate-500">Manage feedback and stories you've published for the community.</p>
                </div>

                {loadingMyTips ? (
                  <div className="py-12">
                    <Loader label="Fetching your feedback history..." />
                  </div>
                ) : myTips.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 space-y-2 border border-dashed border-amber-200 rounded-2xl">
                    <UserCheck size={32} className="mx-auto text-amber-600/40" />
                    <p className="text-xs font-medium">You haven't shared any feedback yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myTips.map((t) => {
                      const photoSrc = getPhotoSrc(t)
                      return (
                        <div
                          key={t.id}
                          className="bg-[#faf8f5]/80 border border-amber-200/80 rounded-2xl p-4 space-y-3 relative group shadow-2xs"
                        >
                          <div className="flex items-center justify-between pr-8">
                            <span className="text-xs font-bold text-amber-900 bg-amber-100 border border-amber-300 rounded-lg px-2.5 py-0.5">
                              {t.place_name}
                            </span>
                            <div className="flex items-center gap-1 text-xs font-bold text-slate-700">
                              <Star size={12} className="fill-amber-500 text-amber-500" />
                              <span>{t.rating}/5</span>
                            </div>
                          </div>

                          <p className="text-xs text-slate-600 leading-relaxed">{t.tip_text}</p>

                          {photoSrc && (
                            <div className="h-48 rounded-xl overflow-hidden border border-amber-200/80 bg-slate-100">
                              <img
                                src={photoSrc}
                                alt={`${t.place_name || 'Feedback'} photo`}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  e.currentTarget.onerror = null
                                  e.currentTarget.src = DEFAULT_VARANASI_FALLBACK
                                }}
                              />
                            </div>
                          )}

                          <button
                            onClick={() => handleDeleteTip(t.id)}
                            title="Delete feedback"
                            className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT: SUBMIT FEEDBACK FORM (5 Cols) */}
          <div className="lg:col-span-5 bg-white border border-amber-200/80 rounded-3xl p-6 shadow-xs space-y-5 sticky top-24">
            <div>
              <h2 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
                <ThumbsUp size={18} className="text-amber-700" />
                <span>Submit Feedback</span>
              </h2>
              <p className="text-xs text-slate-500">Rate your travel experience and help fellow explorers.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Place Name Input */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Location / Attraction Name
                </label>
                <input
                  required
                  value={form.place_name}
                  onChange={(e) => setForm({ ...form, place_name: e.target.value })}
                  placeholder="e.g. Kashi Vishwanath Temple, Blue Lassi"
                  className="w-full bg-[#faf8f5] border border-amber-200/80 rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition"
                />
              </div>

              {/* Rating Selector */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Overall Rating
                </label>
                <div className="flex items-center gap-1 pt-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      type="button"
                      key={n}
                      onClick={() => setForm({ ...form, rating: n })}
                      className="p-1 text-slate-300 hover:scale-110 transition-transform"
                    >
                      <Star
                        size={22}
                        className={
                          n <= form.rating
                            ? 'fill-amber-500 text-amber-500'
                            : 'text-slate-200'
                        }
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-600 ml-2">
                    {form.rating} / 5
                  </span>
                </div>
              </div>

              {/* Feedback Text Area */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Your Detailed Feedback
                </label>
                <textarea
                  required
                  rows={4}
                  value={form.tip_text}
                  onChange={(e) => setForm({ ...form, tip_text: e.target.value })}
                  placeholder="Share details on crowd management, cleanliness, accessibility, or food quality..."
                  className="w-full bg-[#faf8f5] border border-amber-200/80 rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition resize-none"
                />
              </div>

              {/* Optional Photo Upload */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Attach Photo <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                
                {photoPreview ? (
                  <div className="relative h-28 rounded-2xl overflow-hidden border border-amber-200/80 group">
                    <img src={photoPreview} alt="Upload preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={clearPhoto}
                      className="absolute top-2 right-2 p-1 rounded-full bg-slate-900/70 text-white hover:bg-slate-900 transition"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 border border-dashed border-amber-300 hover:border-amber-500 rounded-2xl py-3 cursor-pointer bg-[#faf8f5] hover:bg-amber-50/50 transition text-slate-500">
                    <Camera size={16} className="text-amber-700" />
                    <span className="text-xs font-semibold">Upload Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Submission Status Message */}
              {submitFeedback.msg && (
                <div
                  className={`flex items-start gap-2 p-3 rounded-2xl text-xs font-semibold border ${
                    submitFeedback.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-red-50 text-red-800 border-red-200'
                  }`}
                >
                  {submitFeedback.type === 'success' ? (
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
                  )}
                  <span>{submitFeedback.msg}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-bold rounded-2xl py-3 text-xs flex items-center justify-center gap-2 transition shadow-md"
              >
                <Send size={14} />
                <span>{submitting ? 'Submitting Feedback...' : 'Post Feedback'}</span>
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  )
}