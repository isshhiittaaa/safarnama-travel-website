import { useEffect, useState } from 'react'
import {
  Send,
  MapPin,
  CheckCircle2,
  AlertCircle,
  FileText,
  ShieldAlert,
  X,
  Camera,
  PhoneCall,
  Check,
  Sparkles,
} from 'lucide-react'
import { submitReport, getMyReports } from '../api/reports'
import Loader from '../components/Loader'

// --- RELIABLE CDN ISSUE IMAGES ---
const MUNICIPAL_PROBLEMS = [
  {
    id: 'garbage',
    label: 'Garbage Dump & Waste',
    image: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80',
    description: 'Overflowing dustbins, uncollected waste on roads or ghats',
  },
  {
    id: 'road',
    label: 'Road Potholes & Damage',
    image: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80',
    description: 'Broken pavement, dangerous potholes, unpaved lanes',
  },
  {
    id: 'water',
    label: 'Drainage & Water Leak',
    image: 'https://images.pexels.com/photos/220634/pexels-photo-220634.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Open drains, sewage overflow, pipeline burst, standing water',
  },
  {
    id: 'electricity',
    label: 'Streetlights & Wires',
    image: 'https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Non-functioning streetlights, hanging electric wires',
  },
  {
    id: 'sanitation',
    label: 'Public Toilet & Hygiene',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
    description: 'Dirty public conveniences, foul odor near public areas',
  },
  {
    id: 'other',
    label: 'Stray Animals & Other',
    image: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=600&q=80',
    description: 'Stray cattle hazard, encroachment, noise or general civic issues',
  },
]

const STATUS_STYLE = {
  pending: 'bg-amber-100 text-amber-900 border-amber-300',
  reviewed: 'bg-blue-100 text-blue-900 border-blue-300',
  resolved: 'bg-emerald-100 text-emerald-900 border-emerald-300',
}

export default function Report() {
  const [form, setForm] = useState({
    category: 'garbage',
    description: '',
    location_hint: '',
    photo: null,
  })
  const [photoPreview, setPhotoPreview] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitFeedback, setSubmitFeedback] = useState({ type: '', msg: '' })
  const [reports, setReports] = useState(null)
  const [loadingReports, setLoadingReports] = useState(true)

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    setLoadingReports(true)
    try {
      const { data } = await getMyReports()
      setReports(data?.reports || [])
    } catch (err) {
      console.error('Failed to fetch reports:', err)
      setReports([])
    } finally {
      setLoadingReports(false)
    }
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setForm((prev) => ({ ...prev, photo: file }))
      setPhotoPreview(URL.createObjectURL(file))
    }
  }

  const clearPhoto = () => {
    setForm((prev) => ({ ...prev, photo: null }))
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview)
      setPhotoPreview(null)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.photo) {
      setSubmitFeedback({
        type: 'error',
        msg: 'Photo proof is required to submit a report to the Municipal Corporation.',
      })
      return
    }

    setSubmitting(true)
    setSubmitFeedback({ type: '', msg: '' })

    try {
      const formData = new FormData()
      formData.append('category', form.category)
      formData.append('description', form.description.trim())
      formData.append('location_hint', form.location_hint.trim())
      formData.append('photo', form.photo)

      const { data } = await submitReport(formData)

      setSubmitFeedback({
        type: 'success',
        msg: data?.message || 'Report filed successfully with Nagar Nigam Municipal Helpline!',
      })

      setForm({
        category: 'garbage',
        description: '',
        location_hint: '',
        photo: null,
      })
      clearPhoto()
      loadReports()
    } catch (err) {
      console.error('Report submission error:', err)
      setSubmitFeedback({
        type: 'error',
        msg: err.response?.data?.detail || 'Could not submit report. Please try again.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const getReportPhotoSrc = (r) => {
    if (r.photo_url) return r.photo_url
    if (r.photo_path) {
      const filename = r.photo_path.split(/[/\\]/).pop()
      return `/static/reports/${filename}`
    }
    return null
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] text-slate-800 py-8 selection:bg-amber-100 selection:text-amber-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        
        {/* --- HEADER --- */}
        <div className="bg-white border border-amber-200/80 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1 max-w-xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold tracking-wider text-rose-700 uppercase bg-rose-50 border border-rose-200 px-3 py-1 rounded-full">
              <ShieldAlert size={14} /> Nagar Nigam Civic Grievance Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Report to Municipal Corporation
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              Help Varanasi Municipal Corporation (Nagar Nigam) maintain city cleanliness, road safety, and civic infrastructure by reporting issues with live photo proof.
            </p>
          </div>

          {/* MUNICIPAL HELPLINE BOX */}
          <div className="bg-[#fef5ea] border border-[#fbd3a2] rounded-2xl p-4 shrink-0 space-y-2">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
              <PhoneCall size={16} className="text-rose-600 animate-bounce" />
              <span>Nagar Nigam Municipal Helpline</span>
            </div>
            <div className="space-y-1 text-xs text-slate-700 font-medium">
              <p className="flex items-center justify-between gap-4">
                <span>Civic Toll-Free:</span>
                <span className="font-extrabold font-mono text-amber-900">155304 / 1800-180-5567</span>
              </p>
              <p className="flex items-center justify-between gap-4">
                <span>WhatsApp Helpline:</span>
                <span className="font-extrabold font-mono text-emerald-800">+91 91510 03000</span>
              </p>
            </div>
          </div>
        </div>

        {/* --- MAIN CONTENT GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: FORM (7 COLS) */}
          <div className="lg:col-span-7 bg-white border border-amber-200/80 rounded-3xl p-6 shadow-xs space-y-6">
            <div className="flex items-center gap-2.5 border-b border-amber-200/60 pb-4">
              <div className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
                <ShieldAlert size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">File Civic Complaint Ticket</h2>
                <p className="text-xs text-slate-500">Select issue type and capture real evidence</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* SELECT ISSUE TYPE VISUAL TILES */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                  <span>1. Select Municipal Issue Category <span className="text-rose-500">*</span></span>
                  <span className="text-amber-800 text-[10px] font-extrabold capitalize">Selected: {form.category}</span>
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {MUNICIPAL_PROBLEMS.map((prob) => {
                    const isSelected = form.category === prob.id
                    return (
                      <div
                        key={prob.id}
                        onClick={() => setForm({ ...form, category: prob.id })}
                        className={`relative rounded-2xl overflow-hidden border-2 cursor-pointer transition-all duration-200 group flex flex-col justify-between ${
                          isSelected
                            ? 'border-amber-600 bg-amber-50/50 shadow-sm scale-[1.02]'
                            : 'border-amber-200/60 bg-[#faf8f5] hover:border-amber-300'
                        }`}
                      >
                        <div className="h-20 w-full overflow-hidden bg-slate-200 relative">
                          <img
                            src={prob.image}
                            alt={prob.label}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.currentTarget.src =
                                'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80'
                            }}
                          />
                          {isSelected && (
                            <div className="absolute top-2 right-2 bg-amber-600 text-white rounded-full p-1 shadow-md">
                              <Check size={12} />
                            </div>
                          )}
                        </div>
                        <div className="p-2.5 space-y-0.5">
                          <h4 className="text-xs font-bold text-slate-900 leading-tight">{prob.label}</h4>
                          <p className="text-[10px] text-slate-500 line-clamp-2 leading-tight">{prob.description}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* LOCATION LANDMARK */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  2. Location / Landmark <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={form.location_hint}
                    onChange={(e) => setForm({ ...form, location_hint: e.target.value })}
                    placeholder="e.g. Near Dashashwamedh Ghat entrance, Lane 4"
                    className="w-full bg-[#faf8f5] border border-amber-200/80 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition"
                  />
                </div>
              </div>

              {/* DESCRIPTION INPUT */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  3. Description / Particulars <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe severity, hazards, or length of problem..."
                  className="w-full bg-[#faf8f5] border border-amber-200/80 rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition resize-none"
                />
              </div>

              {/* PHOTO PROOF CAPTURE SECTION */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  4. Photo Evidence <span className="text-rose-500">*</span>
                </label>

                {photoPreview ? (
                  <div className="relative h-48 rounded-2xl overflow-hidden border border-amber-200/80 bg-slate-100 group">
                    <img
                      src={photoPreview}
                      alt="Report evidence preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={clearPhoto}
                        className="bg-rose-600 text-white p-2 rounded-full shadow-lg hover:bg-rose-700 transition"
                        title="Remove photo"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Direct Camera Capture (Mobile Device Native Camera Trigger) */}
                    <label className="flex items-center justify-center gap-2 border-2 border-dashed border-amber-300 hover:border-amber-500 rounded-2xl py-6 cursor-pointer bg-[#faf8f5] hover:bg-amber-50/50 transition text-amber-900">
                      <div className="p-2.5 bg-amber-100 rounded-full text-amber-800">
                        <Camera size={20} />
                      </div>
                      <div className="text-left">
                        <span className="text-xs font-bold block">Capture Live Photo</span>
                        <span className="text-[10px] text-slate-400 block">Open native camera</span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                    </label>

                    {/* Standard File Upload Button */}
                    <label className="flex items-center justify-center gap-2 border-2 border-dashed border-amber-300 hover:border-amber-500 rounded-2xl py-6 cursor-pointer bg-[#faf8f5] hover:bg-amber-50/50 transition text-slate-700">
                      <div className="p-2.5 bg-slate-200 rounded-full text-slate-700">
                        <Sparkles size={20} />
                      </div>
                      <div className="text-left">
                        <span className="text-xs font-bold block">Upload File</span>
                        <span className="text-[10px] text-slate-400 block">JPG, PNG, WEBP</span>
                      </div>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* FEEDBACK BANNER */}
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

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-bold rounded-2xl py-3.5 text-xs flex items-center justify-center gap-2 transition shadow-md"
              >
                <Send size={14} />
                <span>{submitting ? 'Filing Complaint...' : 'File Ticket to Nagar Nigam'}</span>
              </button>
            </form>
          </div>

          {/* RIGHT: TRACKER (5 COLS) */}
          <div className="lg:col-span-5 bg-white border border-amber-200/80 rounded-3xl p-6 shadow-xs space-y-5 sticky top-24">
            <div className="flex items-center justify-between border-b border-amber-200/60 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Your Filed Complaint Tickets</h2>
                <p className="text-xs text-slate-500">Track resolution status by Municipal Corporation</p>
              </div>
              {reports && reports.length > 0 && (
                <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-200">
                  {reports.length} Total
                </span>
              )}
            </div>

            {loadingReports ? (
              <div className="py-12">
                <Loader label="Fetching municipal ticket status..." />
              </div>
            ) : !reports || reports.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2 border border-dashed border-amber-200 rounded-2xl">
                <FileText size={32} className="mx-auto text-amber-600/40" />
                <p className="text-xs font-medium">No complaints filed yet.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
                {reports.map((r) => {
                  const src = getReportPhotoSrc(r)
                  return (
                    <div
                      key={r.id}
                      className="bg-[#faf8f5]/80 border border-amber-200/80 rounded-2xl p-4 space-y-3 hover:bg-[#faf8f5] transition shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 capitalize bg-white border border-amber-200 rounded-lg px-2.5 py-1">
                          {r.category}
                        </span>
                        <span
                          className={`text-[10px] font-bold tracking-wide uppercase px-2.5 py-0.5 rounded-lg border ${
                            STATUS_STYLE[r.status] || 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {r.status}
                        </span>
                      </div>

                      {r.description && (
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {r.description}
                        </p>
                      )}

                      {r.location_hint && (
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                          <MapPin size={12} className="text-amber-700 shrink-0" />
                          <span className="truncate">{r.location_hint}</span>
                        </div>
                      )}

                      {/* Display Evidence Photo */}
                      {src && (
                        <div className="h-36 w-full rounded-xl overflow-hidden border border-amber-200/80 bg-slate-100 mt-2">
                          <img
                            src={src}
                            alt={`${r.category} evidence`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.currentTarget.parentElement.style.display = 'none'
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

        </div>

      </div>
    </div>
  )
}