import { useState } from 'react'
import {
  Link as RouterLink,
  useNavigate as useNavigateRouter,
  useLocation as useLocationRouter,
} from 'react-router-dom'
import {
  LogOut,
  ShieldCheck,
  Menu,
  X,
  User,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

// Import Full Horizontal Safarnama Logo
import safarnamaFullLogo from '../assets/logo...jpeg'

const NAV_LINKS = [
  { to: '/', label: 'Explore' },
  { to: '/chat', label: 'Ask AI' },
  { to: '/favorites', label: 'Favorites' },
  { to: '/community', label: 'Community' },
  { to: '/feedback', label: 'Feedback' },
  { to: '/report', label: 'Report' },
]

export default function Navbar() {
  const { user, logoutUser } = useAuth()
  const navigate = useNavigateRouter()
  const location = useLocationRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logoutUser()
    setMobileMenuOpen(false)
    navigate('/login')
  }

  // Filter links:
  // 1. If user is ADMIN -> Hide all center links completely.
  // 2. If user is NOT LOGGED IN -> Hide center links completely.
  // 3. If user is LOGGED IN TRAVELER -> Show all links.
  const visibleNavLinks = (!user || user?.is_admin)
    ? []
    : NAV_LINKS

  return (
    <header className="sticky top-0 z-40 bg-[#faf8f5]/95 backdrop-blur-md border-b border-amber-200/60 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* --- BRAND LOGO --- */}
        <RouterLink
          to={user?.is_admin ? '/admin' : '/'}
          className="flex items-center group shrink-0 focus:outline-none"
        >
          <div className="h-9 sm:h-10 md:h-11 w-auto flex items-center group-hover:scale-105 transition-transform duration-200">
            <img
              src={safarnamaFullLogo}
              alt="Safarnama - Travel Culture Discover"
              className="h-full w-auto object-contain max-h-12 mix-blend-multiply"
            />
          </div>
        </RouterLink>

        {/* --- DESKTOP NAVIGATION LINKS (ONLY RENDERS FOR LOGGED-IN TRAVELERS) --- */}
        {visibleNavLinks.length > 0 && (
          <nav className="hidden lg:flex items-center gap-1 bg-[#f5ede1]/80 p-1 rounded-2xl border border-amber-200/80 shadow-inner">
            {visibleNavLinks.map((link) => {
              const active = location.pathname === link.to
              return (
                <RouterLink
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    active
                      ? 'bg-white text-slate-900 shadow-xs border border-amber-300/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  {link.label}
                </RouterLink>
              )
            })}
          </nav>
        )}

        {/* --- DESKTOP USER CONTROLS & RIGHT HCLTECH BRANDING --- */}
        <div className="hidden sm:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              {/* User Avatar & Info */}
              <div className="flex items-center gap-2.5 bg-white border border-amber-200/80 px-3 py-1 rounded-2xl shadow-2xs">
                <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold uppercase">
                  {user.username ? user.username[0] : <User size={13} />}
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-xs font-bold text-slate-900">
                    {user.username}
                  </span>
                  <span className="text-[9px] text-amber-700 font-bold uppercase">
                    {user.is_admin ? 'Administrator' : 'Explorer'}
                  </span>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all"
                title="Log out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <RouterLink
                to="/login"
                className="text-xs font-bold text-slate-700 hover:text-slate-900 px-3.5 py-2 rounded-xl hover:bg-amber-100/60 transition"
              >
                Sign In
              </RouterLink>
              <RouterLink
                to="/register"
                className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm hover:shadow transition"
              >
                Get Started
              </RouterLink>
            </div>
          )}

          {/* Right-Aligned HCLTech Logo Badge */}
          <div className="h-5 w-[1px] bg-amber-200" />
          <div className="flex items-center gap-2.5 bg-white border border-slate-200/90 rounded-full pl-3.5 pr-4 py-1.5 shadow-2xs hover:shadow-xs transition-shadow">
            <span className="font-black text-xs sm:text-sm tracking-tight">
              <span className="text-[#5822b4]">HCL</span>
              <span className="text-[#0070f3]">Tech</span>
            </span>
            <span className="text-slate-300 font-light text-sm leading-none">|</span>
            <span className="text-[11px] sm:text-xs font-semibold text-slate-600 leading-none">
              Supercharging Progress™
            </span>
          </div>
        </div>

        {/* --- MOBILE HAMBURGER TOGGLE --- */}
        <div className="flex items-center gap-3 lg:hidden">
          <div className="flex items-center gap-1 bg-white border border-slate-200/90 px-2.5 py-1 rounded-full shadow-2xs">
            <span className="font-black text-xs tracking-tight">
              <span className="text-[#5822b4]">HCL</span>
              <span className="text-[#0070f3]">Tech</span>
            </span>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl border border-amber-200 text-slate-700 hover:bg-amber-100/50 transition"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

      </div>

      {/* --- MOBILE MENU PANEL --- */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-amber-200/80 bg-[#faf8f5] px-4 pt-3 pb-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-amber-100">
            <span className="text-xs text-amber-800 font-bold">Safarnama Travel Studio</span>
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1 rounded-full shadow-2xs">
              <span className="font-black text-xs tracking-tight">
                <span className="text-[#5822b4]">HCL</span>
                <span className="text-[#0070f3]">Tech</span>
              </span>
            </div>
          </div>

          {visibleNavLinks.length > 0 && (
            <nav className="flex flex-col space-y-1">
              {visibleNavLinks.map((link) => {
                const active = location.pathname === link.to
                return (
                  <RouterLink
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                      active
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'text-slate-700 hover:bg-white hover:text-slate-900'
                    }`}
                  >
                    {link.label}
                  </RouterLink>
                )
              })}
            </nav>
          )}

          <div className="pt-3 border-t border-amber-200/60 flex items-center justify-between">
            {user ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold uppercase">
                    {user.username ? user.username[0] : <User size={14} />}
                  </div>
                  <div className="flex flex-col leading-tight">
                    <span className="text-xs font-bold text-slate-900">
                      {user.username}
                    </span>
                    <span className="text-[10px] text-amber-700 font-semibold">
                      {user.is_admin ? 'Administrator' : 'Explorer'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl transition"
                >
                  <LogOut size={14} /> Logout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 w-full pt-1">
                <RouterLink
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center text-xs font-bold text-slate-700 bg-white py-2.5 rounded-xl border border-amber-200"
                >
                  Sign In
                </RouterLink>
                <RouterLink
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center text-xs font-bold text-white bg-slate-900 py-2.5 rounded-xl shadow-xs"
                >
                  Get Started
                </RouterLink>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}