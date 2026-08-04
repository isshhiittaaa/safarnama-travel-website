import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  UserPlus,
  AlertCircle,
  Compass,
  ShieldCheck,
  MessageSquare,
  MapPin,
} from 'lucide-react'
import { register } from '../api/auth'
import { useAuth } from '../context/AuthContext'

// Import Safarnama Lotus Emblem Logo
import logo2 from '../assets/logo2...jpeg'

const EXPLORER_BENEFITS = [
  {
    icon: Compass,
    title: 'AI-Powered Itineraries',
    description: 'Custom travel plans tailored to your budget, group, and time.',
  },
  {
    icon: ShieldCheck,
    title: 'Municipal Help & Reports',
    description: 'Direct civic issue reporting portal connected to local helplines.',
  },
  {
    icon: MessageSquare,
    title: 'Community Insights',
    description: 'Verified reviews and budget hacks shared by fellow explorers.',
  },
]

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const { loginUser } = useAuth()

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await register({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
      })

      loginUser(res.data.access_token, {
        username: res.data.username,
        is_admin: res.data.is_admin,
      })

      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#faf8f5] flex items-center justify-center py-10 px-4 sm:px-6 selection:bg-amber-100 selection:text-amber-900">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 bg-white border border-amber-200/80 rounded-3xl shadow-xs overflow-hidden">
        
        {/* --- LEFT FEATURE SIDEBAR (5 COLS) --- */}
        <div className="lg:col-span-5 bg-[#faf8f5]/80 border-b lg:border-b-0 lg:border-r border-amber-200/80 p-6 sm:p-10 flex flex-col justify-between space-y-8">
          <div className="space-y-6">
            <div className="flex items-center gap-2.5">
              {/* SAFARNAMA LOTUS ICON EMBLEM (logo2) */}
              <div className="w-10 h-10 rounded-2xl overflow-hidden bg-white border border-amber-200/80 p-1 flex items-center justify-center shadow-2xs">
                <img
                  src={logo2}
                  alt="Safarnama Logo"
                  className="w-full h-full object-contain mix-blend-multiply"
                />
              </div>
              <span className="font-bold text-slate-900 tracking-tight text-sm">
                Safarnama Travel Studio
              </span>
            </div>

            {/* Feature Highlights */}
            <div className="space-y-4 pt-2">
              {EXPLORER_BENEFITS.map((item, idx) => {
                const IconComp = item.icon
                return (
                  <div key={idx} className="flex items-start gap-3.5 bg-white/90 border border-amber-200/60 p-3.5 rounded-2xl shadow-2xs">
                    <div className="p-2 bg-amber-100/80 border border-amber-300 text-amber-900 rounded-xl shrink-0 mt-0.5">
                      <IconComp size={16} />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                      <p className="text-[11px] text-slate-500 leading-snug">{item.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-amber-200/60 flex items-center gap-2 text-[11px] text-slate-500">
            <MapPin size={13} className="text-amber-600 shrink-0" />
            <span>Currently serving Uttar Pradesh &amp; expanding nationwide.</span>
          </div>
        </div>

        {/* --- RIGHT REGISTRATION FORM (7 COLS) --- */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            <div className="space-y-1.5">
              <h1 className="text-2xl font-bold text-slate-950 tracking-tight">
                Create an Account
              </h1>
              <p className="text-xs text-slate-500 leading-relaxed">
                Enter your details to create your explorer profile and unlock full feature access.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Choose an Explorer Username
                </label>
                <input
                  type="text"
                  required
                  value={form.username}
                  onChange={update('username')}
                  placeholder="e.g. heritage_explorer"
                  className="w-full bg-[#faf8f5] border border-amber-200/80 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/10 transition shadow-inner"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={update('email')}
                  placeholder="name@example.com"
                  className="w-full bg-[#faf8f5] border border-amber-200/80 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/10 transition shadow-inner"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={form.password}
                  onChange={update('password')}
                  placeholder="At least 6 characters"
                  className="w-full bg-[#faf8f5] border border-amber-200/80 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/10 transition shadow-inner"
                />
              </div>

              {error && (
                <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-semibold">
                  <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600" />
                  <span>{error}</span>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-slate-950 hover:bg-slate-800 disabled:opacity-40 text-white font-bold rounded-2xl py-3 text-xs flex items-center justify-center gap-2.5 transition shadow-md shadow-slate-950/10"
                >
                  <UserPlus size={15} />
                  <span>{loading ? 'Registering Profile...' : 'Create Account'}</span>
                </button>
              </div>
            </form>
          </div>

          <p className="text-xs text-slate-600 text-center pt-4 border-t border-amber-100">
            Already have an account?{' '}
            <Link to="/login" className="text-amber-700 font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}