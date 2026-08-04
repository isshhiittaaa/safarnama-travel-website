import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  LogIn,
  Shield,
  User,
  Sparkles,
  Copy,
  Check,
  AlertCircle,
  Wand2,
} from 'lucide-react'
import { login } from '../api/auth'
import { useAuth } from '../context/AuthContext'

const DEMO_CREDENTIALS = [
  {
    role: 'Admin Account',
    email: 'admin@demo.com',
    password: 'Demo@Pass2026!',
    badge: 'Full Access',
    color: 'bg-amber-100 text-amber-900 border-amber-300',
    icon: Shield,
  },
  {
    role: 'Traveler Account 1',
    email: 'john@example.com',
    password: 'John12345',
    badge: 'User Tier',
    color: 'bg-slate-100/60 text-slate-800 border-slate-200/80',
    icon: User,
  },
  {
    role: 'Traveler Account 2',
    email: 'traveler1@example.com',
    password: 'test1234',
    badge: 'User Tier',
    color: 'bg-slate-100/60 text-slate-800 border-slate-200/80',
    icon: User,
  },
]

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [copiedIndex, setCopiedIndex] = useState(null)
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const { loginUser } = useAuth()

  const handleQuickFill = (acc, index) => {
    setEmail(acc.email)
    setPassword(acc.password)
    setError('')
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 1500)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await login({ email: email.trim(), password })

      // Store Token & User Payload in Auth Context
      loginUser(res.data.access_token, {
        username: res.data.username,
        is_admin: res.data.is_admin,
      })

      // Role-Based Navigation
      if (res.data.is_admin) {
        navigate('/admin')
      } else {
        navigate('/')
      }
    } catch (err) {
      setError(
        err.response?.data?.detail || 'Login failed. Please check credentials.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#faf8f5] flex items-center justify-center py-10 px-4 sm:px-6 selection:bg-amber-100 selection:text-amber-900">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 bg-white border border-amber-200/70 rounded-3xl shadow-xs overflow-hidden">
        
        {/* --- LEFT FORM CONTAINER (7 COLS) --- */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-8">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-200 flex items-center justify-center text-amber-600 shadow-2xs">
                <Wand2 size={20} />
              </div>
              <span className="font-bold text-slate-900 tracking-tight text-sm">
                Safarnama Travel Studio
              </span>
            </div>

            <div className="space-y-1.5 mb-10 max-w-lg">
              <h1 className="text-3xl font-serif italic text-slate-950 tracking-tight">
                Welcome Back
              </h1>
              <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                Sign in to resume your AI-powered spiritual journey through Varanasi.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#faf8f5] border border-amber-200/80 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/10 transition shadow-inner"
                />
              </div>

              {error && (
                <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-semibold">
                  <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-950 hover:bg-slate-800 disabled:opacity-40 text-white font-bold rounded-2xl py-3 text-xs flex items-center justify-center gap-2.5 transition shadow-md shadow-slate-950/10"
              >
                <LogIn size={15} />
                <span>{loading ? 'Authenticating Trail...' : 'Start My Itinerary'}</span>
              </button>
            </form>
          </div>

          <p className="text-xs text-slate-500 mt-10 pt-4 border-t border-amber-100/70 text-center">
            New to the digital trail?{' '}
            <Link
              to="/register"
              className="text-amber-700 font-bold hover:underline"
            >
              Join the Exploration
            </Link>
          </p>
        </div>

        {/* --- RIGHT DEMO CREDENTIALS SIDEBAR (5 COLS) --- */}
        <div className="lg:col-span-5 bg-[#faf8f5]/60 border-t lg:border-t-0 lg:border-l border-amber-200/80 p-6 sm:p-8 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase tracking-wider">
                <Sparkles size={15} className="text-amber-500" /> Quick Access
              </div>
              <span className="text-[10px] font-extrabold text-slate-500 bg-white border border-amber-200 px-3 py-1 rounded-full shadow-2xs">
                Demo Accounts
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed max-w-sm">
              Select any demo profile below to auto-fill input fields and test role-based system access.
            </p>

            <div className="space-y-3 pt-3">
              {DEMO_CREDENTIALS.map((acc, idx) => {
                const IconComp = acc.icon
                const isSelected = email === acc.email
                return (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => handleQuickFill(acc, idx)}
                    className={`w-full p-4 rounded-3xl border transition-all duration-200 flex items-center justify-between group ${
                      isSelected
                        ? 'bg-white border-amber-300 shadow-xs scale-[1.02]'
                        : 'bg-white/80 border-amber-200/50 hover:border-amber-300'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0 pr-2">
                      <div className={`p-2.5 rounded-xl border shrink-0 ${acc.color}`}>
                        <IconComp size={16} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-slate-950 truncate">
                            {acc.role}
                          </p>
                        </div>
                        <p className="text-[11px] text-slate-600 truncate font-mono mt-0.5">
                          {acc.email}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 ml-1">
                      {copiedIndex === idx ? (
                        <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 inline-block">
                          <Check size={14} />
                        </span>
                      ) : (
                        <span className="p-1.5 rounded-lg text-amber-500 hover:text-amber-700 bg-amber-500/5 transition">
                          <Copy size={14} />
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* <div className="mt-8 pt-4 border-t border-amber-200/60 text-[11px] text-slate-500 leading-relaxed space-y-2">
            <p>💡 <strong className="text-slate-700 font-semibold">Note:</strong> Admin credentials provide access to system telemetry and analytics dashboards at <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-900 font-mono">/admin</code>.</p>
            <p>🔧 Built with pride using HCLTech Progress™.</p>
          </div> */}
        </div>

      </div>
    </div>
  )
}