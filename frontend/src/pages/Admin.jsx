import { useEffect, useMemo, useState } from 'react'
import {
  MessageSquare,
  CheckCircle2,
  Clock,
  Coins,
  Users,
  Flag,
  ShieldCheck,
  AlertCircle,
  Filter,
  UserCheck,
} from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts'
import { getAdminStats, getAdminUsers } from '../api/admin'
import { getAllReports, updateReportStatus } from '../api/reports'
import StatCard from '../components/StatCard'
import Loader from '../components/Loader'

const PIE_COLORS = ['#0d9488', '#f43f5e'] // Teal (Answered) vs Rose (Unanswered)
const STATUS_OPTIONS = ['pending', 'reviewed', 'resolved']

const STATUS_BADGE_STYLE = {
  pending: 'bg-amber-50 text-amber-800 border-amber-200',
  reviewed: 'bg-blue-50 text-blue-800 border-blue-200',
  resolved: 'bg-emerald-50 text-emerald-800 border-emerald-200',
}

export default function Admin() {
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [reportFilter, setReportFilter] = useState('all')

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const [s, u, r] = await Promise.all([
        getAdminStats(),
        getAdminUsers(),
        getAllReports(),
      ])
      setStats(s?.data || null)
      
      // FILTER OUT ADMIN ACCOUNTS FROM USER DIRECTORY
      const rawUsers = u?.data?.users || []
      const travelerOnlyUsers = rawUsers.filter((usr) => !usr.is_admin)
      setUsers(travelerOnlyUsers)

      setReports(r?.data?.reports || [])
    } catch (err) {
      console.error('Failed to load admin telemetry:', err)
    } finally {
      setLoading(false)
    }
  }

  const changeStatus = async (id, status) => {
    try {
      await updateReportStatus(id, status)
      setReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      )
    } catch (err) {
      console.error('Failed to update report status:', err)
    }
  }

  const filteredReports = useMemo(() => {
    if (reportFilter === 'all') return reports
    return reports.filter((rep) => rep.status === reportFilter)
  }, [reports, reportFilter])

  const answeredData = useMemo(() => {
    if (!stats) return []
    return [
      { name: 'Answered', value: stats.answered_queries || 0 },
      { name: 'Unanswered', value: stats.unanswered_queries || 0 },
    ]
  }, [stats])

  const tokenData = useMemo(() => {
    if (!stats) return []
    return [
      {
        name: 'Tokens',
        Answered: stats.tokens_by_answered_queries || 0,
        Unanswered: stats.tokens_by_unanswered_queries || 0,
      },
    ]
  }, [stats])

  const successRate =
    stats && stats.total_queries > 0
      ? Math.round((stats.answered_queries / stats.total_queries) * 100)
      : 0

  if (loading || !stats) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-[#faf8f5] flex items-center justify-center py-16">
        <Loader label="Initializing Safarnama telemetry control center..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] text-slate-800 py-8 selection:bg-amber-100 selection:text-amber-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        
        {/* --- PAGE HEADER --- */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-200/80 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-amber-800 uppercase bg-amber-100/70 border border-amber-300/60 px-3 py-1 rounded-full mb-2">
              <ShieldCheck size={13} className="text-amber-600" /> Control Panel &amp; Telemetry
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif italic text-slate-950 tracking-tight">
              Engineering Dashboard
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-xl leading-relaxed">
              Monitor LLM pipeline performance, token usage, traveler activity, and local civic ticketing.
            </p>
          </div>
        </div>

        {/* --- STAT CARDS GRID --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Queries"
            value={stats.total_queries || 0}
            sub={`${stats.answered_queries || 0} answered · ${
              stats.unanswered_queries || 0
            } unanswered`}
            icon={MessageSquare}
          />
          <StatCard
            label="Success Rate"
            value={`${successRate}%`}
            sub="Answered vs Total pipeline"
            icon={CheckCircle2}
          />
          <StatCard
            label="Avg Latency"
            value={`${stats.avg_execution_time_sec || 0}s`}
            sub="End-to-end processing time"
            icon={Clock}
          />
          <StatCard
            label="Avg Tokens / Query"
            value={stats.avg_tokens_per_query || 0}
            sub={`${stats.total_tokens_used || 0} total tokens used`}
            icon={Coins}
          />
        </div>

        {/* --- CHARTS GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Answered vs Unanswered Pie Chart */}
          <div className="bg-white border border-amber-200/80 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-amber-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 tracking-tight">
                Query Success Breakdown
              </h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Pipeline Accuracy
              </span>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={answeredData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                  >
                    {answeredData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={PIE_COLORS[i % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '0.75rem',
                      border: '1px solid #fde68a',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                      fontSize: '12px',
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Token Usage Bar Chart */}
          <div className="bg-white border border-amber-200/80 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-amber-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 tracking-tight">
                Token Consumption (by Status)
              </h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                LLM Bandwidth
              </span>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tokenData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#FAF8F5" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '0.75rem',
                      border: '1px solid #fde68a',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                      fontSize: '12px',
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                  <Bar
                    dataKey="Answered"
                    fill="#0d9488"
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="Unanswered"
                    fill="#f43f5e"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* --- CIVIC REPORTS MANAGEMENT --- */}
        <div className="bg-white border border-amber-200/80 rounded-3xl p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-200/80">
                <Flag size={18} />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Civic Issue Reports
                </h3>
                <p className="text-xs text-slate-500">
                  Review user complaints and manage municipal resolution workflow
                </p>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 self-start sm:self-auto">
              {['all', 'pending', 'reviewed', 'resolved'].map((st) => (
                <button
                  key={st}
                  onClick={() => setReportFilter(st)}
                  className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-xl border transition ${
                    reportFilter === st
                      ? 'bg-slate-950 text-white border-slate-950 shadow-xs'
                      : 'bg-[#faf8f5] text-slate-600 border-amber-200/70 hover:bg-amber-100/50'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {!filteredReports || filteredReports.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2 border border-dashed border-amber-200 rounded-2xl bg-[#faf8f5]/40">
              <AlertCircle size={28} className="mx-auto text-amber-400" />
              <p className="text-xs font-medium text-slate-600">No civic reports found matching selected status.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 font-bold uppercase tracking-wider border-b border-amber-100">
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Description</th>
                    <th className="py-3 px-3">Location</th>
                    <th className="py-3 px-3 text-right">Status Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100/60">
                  {filteredReports.map((r) => (
                    <tr key={r.id} className="hover:bg-[#faf8f5]/60 transition">
                      <td className="py-3.5 px-3 font-bold text-slate-900 capitalize">
                        {r.category}
                      </td>
                      <td className="py-3.5 px-3 text-slate-600 max-w-xs leading-relaxed">
                        {r.description || '—'}
                      </td>
                      <td className="py-3.5 px-3 text-slate-500 max-w-xs truncate">
                        {r.location_hint || '—'}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <select
                          value={r.status}
                          onChange={(e) => changeStatus(r.id, e.target.value)}
                          className={`border rounded-xl text-xs px-3 py-1.5 font-bold capitalize focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition cursor-pointer ${
                            STATUS_BADGE_STYLE[r.status] ||
                            'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* --- REGISTERED TRAVELERS (ADMINS EXCLUDED) --- */}
        <div className="bg-white border border-amber-200/80 rounded-3xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-amber-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
                <Users size={18} />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Registered Travelers
                </h3>
                <p className="text-xs text-slate-500">
                  Active user directory (excluding system administrator accounts)
                </p>
              </div>
            </div>
            {users && users.length > 0 && (
              <span className="bg-amber-100/70 text-amber-900 text-[10px] font-extrabold px-3 py-1 rounded-full border border-amber-300/60 shadow-2xs">
                {users.length} Travelers
              </span>
            )}
          </div>

          {!users || users.length === 0 ? (
            <div className="py-10 text-center text-slate-400 space-y-2 border border-dashed border-amber-200 rounded-2xl bg-[#faf8f5]/40">
              <UserCheck size={28} className="mx-auto text-amber-400" />
              <p className="text-xs font-medium text-slate-600">No traveler registrations found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 font-bold uppercase tracking-wider border-b border-amber-100">
                    <th className="py-3 px-3">Username</th>
                    <th className="py-3 px-3">Email Address</th>
                    <th className="py-3 px-3 text-right">Role Tier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100/60">
                  {users.map((u) => (
                    <tr key={u.id || u.email} className="hover:bg-[#faf8f5]/60 transition">
                      <td className="py-3.5 px-3 font-bold text-slate-900">
                        {u.username}
                      </td>
                      <td className="py-3.5 px-3 text-slate-600 font-mono">
                        {u.email}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                          Traveler
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}