import { useState } from 'react'
import {
  Palette,
  Landmark,
  Music,
  UtensilsCrossed,
  Camera,
  Trees,
  HeartHandshake,
  Users,
  UserPlus,
  UserCheck,
  Sparkles,
  MessageSquare,
  Share2,
  ThumbsUp,
  Search,
} from 'lucide-react'

// --- COMMUNITY CATEGORIES DATA ---
const COMMUNITIES_DATA = [
  {
    id: 'art-craft',
    title: 'Art & Craft Communities',
    category: 'Handicrafts',
    icon: Palette,
    accentColor: 'text-rose-600 bg-rose-50 border-rose-200',
    description:
      'Connect with Banarasi silk weavers, Gulabi Meenakari artisans, and traditional terracotta sculptors of UP.',
    members: 1240,
    activeDiscussions: 18,
    isJoined: false,
    tags: ['Banarasi Silk', 'Meenakari', 'Chikan', 'Terracotta'],
  },
  {
    id: 'cultural',
    title: 'Cultural Communities',
    category: 'Heritage & Lore',
    icon: Landmark,
    accentColor: 'text-amber-700 bg-amber-50 border-amber-200',
    description:
      'Delve into ancient Kashi lore, Vedic traditions, Ramayana heritage circuits, and local folklore discussions.',
    members: 2890,
    activeDiscussions: 34,
    isJoined: true,
    tags: ['Kashi Lore', 'Ganga Ghats', 'Vedanta', 'Ramayana Trail'],
  },
  {
    id: 'music-perf',
    title: 'Music & Performance Communities',
    category: 'Performing Arts',
    icon: Music,
    accentColor: 'text-purple-600 bg-purple-50 border-purple-200',
    description:
      'Explore Banaras Gharana classical music, Kathak dance circles, and local Shehnai performance groups.',
    members: 1560,
    activeDiscussions: 22,
    isJoined: false,
    tags: ['Banaras Gharana', 'Shehnai', 'Kathak', 'Morning Ragas'],
  },
  {
    id: 'food',
    title: 'Food Communities',
    category: 'Culinary Trails',
    icon: UtensilsCrossed,
    accentColor: 'text-orange-600 bg-orange-50 border-orange-200',
    description:
      'Discover authentic Tamatar Chaat, Malaiyyo seasonal delicacies, Kachori-Jalebi spots, and Sattvic food guides.',
    members: 3420,
    activeDiscussions: 45,
    isJoined: true,
    tags: ['Malaiyyo', 'Banarasi Chaat', 'Street Food', 'Sattvic Thali'],
  },
  {
    id: 'photo-heritage',
    title: 'Photography & Heritage Communities',
    category: 'Visual Arts',
    icon: Camera,
    accentColor: 'text-teal-600 bg-teal-50 border-teal-200',
    description:
      'Share golden hour shots of Ganga Aarti, alleyway photowalks, and architectural heritage highlights.',
    members: 2150,
    activeDiscussions: 29,
    isJoined: false,
    tags: ['Photowalks', 'Ghat Sunset', 'Architecture', 'Portraiture'],
  },
  {
    id: 'nature-wellness',
    title: 'Nature & Wellness Communities',
    category: 'Lifestyle & Yoga',
    icon: Trees,
    accentColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    description:
      'Join sunrise Ganga riverbank yoga circles, eco-tourism walks near Sarnath, and herbal wellness exchanges.',
    members: 1180,
    activeDiscussions: 14,
    isJoined: false,
    tags: ['Yoga at Ghats', 'Sarnath Eco Park', 'Ayurveda', 'Meditation'],
  },
  {
    id: 'volunteer',
    title: 'Volunteer Communities',
    category: 'Social Impact',
    icon: HeartHandshake,
    accentColor: 'text-sky-600 bg-sky-50 border-sky-200',
    description:
      'Participate in Clean Ganga riverbed drives, heritage site preservation volunteering, and eco-travel awareness.',
    members: 980,
    activeDiscussions: 11,
    isJoined: false,
    tags: ['Clean Ganga Drive', 'Ghat Cleanliness', 'Cultural Guide Vol.'],
  },
]

// --- SAMPLE COMMUNITY POSTS DATA ---
const COMMUNITY_POSTS = [
  {
    id: 1,
    author: 'Aarav Sharma',
    avatar: 'A',
    community: 'Food Communities',
    time: '2 hours ago',
    title: 'Where to find the best authentic Malaiyyo in Chowk area right now?',
    content:
      'Hey foodies! Visiting Kashi this week and would love to know which local vendor serves the most airy and saffron-rich Malaiyyo near Godowlia or Chowk.',
    likes: 24,
    replies: 8,
  },
  {
    id: 2,
    author: 'Priya Verma',
    avatar: 'P',
    community: 'Photography & Heritage Communities',
    time: '5 hours ago',
    title: 'Golden Hour photowalk at Chet Singh Ghat tomorrow morning',
    content:
      'Planning a photography session at 5:30 AM starting from Assi Ghat down to Chet Singh Fort. Anyone from the group interested in joining?',
    likes: 41,
    replies: 12,
  },
]

export default function Community() {
  const [communities, setCommunities] = useState(COMMUNITIES_DATA)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all') // 'all' or 'joined'

  // Toggle Join/Leave state for a community
  const handleToggleJoin = (id) => {
    setCommunities((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const nextJoined = !c.isJoined
          return {
            ...c,
            isJoined: nextJoined,
            members: nextJoined ? c.members + 1 : c.members - 1,
          }
        }
        return c
      })
    )
  }

  // Filtered communities based on search and tab selection
  const filteredCommunities = communities.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesTab = activeTab === 'all' || (activeTab === 'joined' && c.isJoined)
    return matchesSearch && matchesTab
  })

  return (
    <div className="min-h-screen bg-[#faf8f5] text-slate-800 py-10 selection:bg-amber-100 selection:text-amber-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
        
        {/* --- PAGE HEADER HERO --- */}
        <div className="bg-white border border-amber-200/80 rounded-3xl p-6 sm:p-10 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-200/20 blur-3xl rounded-full pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 bg-[#fef5ea] border border-[#fbd3a2] text-[#8c3b10] px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide">
              <Sparkles size={14} className="text-[#c85a17]" />
              <span>Safarnama Cultural Network</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
              Connect with UP’s Vibrant <span className="text-amber-700 font-serif italic">Cultural Communities</span>
            </h1>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Join local travel circles, exchange heritage knowledge, coordinate photowalks, and discover Uttar Pradesh alongside passionate travelers and locals.
            </p>

            {/* Filter Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
              {/* Tab Switcher */}
              <div className="flex items-center gap-2 bg-[#f5ede1]/80 p-1 rounded-2xl border border-amber-200/80 w-full sm:w-auto">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex-1 sm:flex-none ${
                    activeTab === 'all'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All Hubs ({communities.length})
                </button>
                <button
                  onClick={() => setActiveTab('joined')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex-1 sm:flex-none ${
                    activeTab === 'joined'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  My Hubs ({communities.filter((c) => c.isJoined).length})
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-72">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search communities or tags..."
                  className="w-full pl-10 pr-4 py-2 bg-[#faf8f5] border border-amber-200/80 rounded-2xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>
          </div>
        </div>

        {/* --- MAIN GRID LAYOUT: COMMUNITIES + FEED --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT 8 COLS: COMMUNITIES LIST */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Users size={18} className="text-amber-700" />
                <span>Explore Communities</span>
              </h2>
              <span className="text-xs font-semibold text-slate-500">
                Showing {filteredCommunities.length} category circles
              </span>
            </div>

            {filteredCommunities.length === 0 ? (
              <div className="bg-white border border-amber-200/80 rounded-3xl p-10 text-center space-y-3">
                <Users size={32} className="mx-auto text-amber-600/50" />
                <h3 className="font-bold text-slate-900 text-sm">No communities found</h3>
                <p className="text-xs text-slate-500">
                  Try adjusting your search terms or view all hubs.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {filteredCommunities.map((c) => {
                  const IconComponent = c.icon
                  return (
                    <div
                      key={c.id}
                      className="bg-white border border-amber-200/80 rounded-3xl p-5 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-4 group"
                    >
                      <div className="space-y-3">
                        {/* Header: Icon + Category Badge */}
                        <div className="flex items-start justify-between gap-3">
                          <div className={`p-3 rounded-2xl border shadow-2xs ${c.accentColor}`}>
                            <IconComponent size={20} />
                          </div>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider bg-[#faf8f5] border border-amber-200 px-2.5 py-1 rounded-full text-amber-800">
                            {c.category}
                          </span>
                        </div>

                        {/* Title & Description */}
                        <div>
                          <h3 className="font-bold text-base text-slate-900 group-hover:text-amber-700 transition-colors">
                            {c.title}
                          </h3>
                          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-3">
                            {c.description}
                          </p>
                        </div>

                        {/* Tag Pills */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {c.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] font-semibold text-slate-600 bg-[#faf8f5] border border-slate-200/80 px-2 py-0.5 rounded-md"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Footer Info & Join Button */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                          <span>👥 {c.members.toLocaleString()}</span>
                          <span>💬 {c.activeDiscussions} active</span>
                        </div>

                        <button
                          onClick={() => handleToggleJoin(c.id)}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs ${
                            c.isJoined
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200'
                              : 'bg-slate-900 hover:bg-slate-800 text-white'
                          }`}
                        >
                          {c.isJoined ? (
                            <>
                              <UserCheck size={14} /> Joined
                            </>
                          ) : (
                            <>
                              <UserPlus size={14} /> Join Hub
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* RIGHT 4 COLS: COMMUNITY ACTIVITY FEED */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare size={18} className="text-amber-700" />
                <span>Recent Discussions</span>
              </h2>
            </div>

            <div className="bg-white border border-amber-200/80 rounded-3xl p-5 shadow-2xs space-y-5">
              {COMMUNITY_POSTS.map((post) => (
                <div key={post.id} className="space-y-3 pb-4 border-b border-slate-100 last:border-b-0 last:pb-0">
                  {/* Author Header */}
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                      {post.avatar}
                    </div>
                    <div className="flex flex-col leading-tight">
                      <span className="text-xs font-bold text-slate-900">{post.author}</span>
                      <span className="text-[10px] text-slate-400">{post.community} • {post.time}</span>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 hover:text-amber-700 cursor-pointer">
                      {post.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-3 leading-relaxed">
                      {post.content}
                    </p>
                  </div>

                  {/* Interactivity Footer */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium pt-1">
                    <div className="flex items-center gap-3">
                      <button className="flex items-center gap-1 hover:text-amber-700">
                        <ThumbsUp size={12} /> {post.likes}
                      </button>
                      <button className="flex items-center gap-1 hover:text-amber-700">
                        <MessageSquare size={12} /> {post.replies} replies
                      </button>
                    </div>
                    <button className="hover:text-slate-600">
                      <Share2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Volunteer / Impact Highlight Banner */}
            <div className="bg-gradient-to-br from-[#fef5ea] via-[#faf8f5] to-[#f5ede1] border border-[#fbd3a2] rounded-3xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                <HeartHandshake size={16} className="text-amber-700" />
                <span>Safarnama Impact Drive</span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Clean Ganga Riverbed Initiative</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Join our volunteer community for the upcoming weekend heritage cleanup drive at Namo Ghat.
              </p>
              <button className="w-full bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs py-2 rounded-xl transition shadow-2xs">
                Sign Up as Volunteer
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}