import { useEffect, useRef, useState } from 'react'
import {
  Send,
  Plus,
  Trash2,
  Languages,
  Sparkles,
  Bot,
  History,
  X,
  Compass,
  Mic,
  Square,
  Volume2,
  Users,
  Wallet,
  Accessibility,
  CalendarDays,
  Sparkle,
  SlidersHorizontal,
  Wand2,
  MapPin,
  Map as MapIcon,
  ChevronRight,
  Route,
} from 'lucide-react'
import {
  sendQuery,
  newChat,
  listChatHistory,
  getChatHistoryDetail,
  deleteChatHistory,
} from '../api/chat'
import { sendVoiceQuery, getVoiceAudioUrl } from '../api/voice'
import Loader from '../components/Loader'

const SUPPORTED_LANGUAGES = [
  { code: 'hi-IN', label: 'Hindi (हिंदी)', name: 'Hindi' },
  { code: 'en-IN', label: 'English (India)', name: 'English' },
  { code: 'bn-IN', label: 'Bengali (বাংলা)', name: 'Bengali' },
  { code: 'ta-IN', label: 'Tamil (தமிழ்)', name: 'Tamil' },
  { code: 'te-IN', label: 'Telugu (తెలుగు)', name: 'Telugu' },
  { code: 'mr-IN', label: 'Marathi (मराठी)', name: 'Marathi' },
  { code: 'gu-IN', label: 'Gujarati (ગુજરાતી)', name: 'Gujarati' },
  { code: 'kn-IN', label: 'Kannada (कन्नड)', name: 'Kannada' },
  { code: 'ml-IN', label: 'Malayalam (മലയാളം)', name: 'Malayalam' },
]

export default function Chat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sessionId, setSessionId] = useState(null)
  const [sending, setSending] = useState(false)
  const [sessions, setSessions] = useState([])

  // History Sidebar Drawer State
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false)

  // Grounded Local Map Image State
  const [activeMapFilename, setActiveMapFilename] = useState('overview-p1-img1.png')

  // Trip Preferences State
  const [tripType, setTripType] = useState('Solo')
  const [budget, setBudget] = useState('Moderate')
  const [duration, setDuration] = useState('1 Day')
  const [accessibility, setAccessibility] = useState('Standard')

  // Voice & Language Assistance States
  const [selectedLang, setSelectedLang] = useState('hi-IN')
  const [isRecording, setIsRecording] = useState(false)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const scrollRef = useRef(null)

  useEffect(() => {
    loadSessions()
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages, sending])

  const loadSessions = async () => {
    try {
      const { data } = await listChatHistory()
      setSessions(data?.sessions || [])
    } catch {
      /* silent catch */
    }
  }

  // Helper to extract language object
  const getLanguageObj = (code) =>
    SUPPORTED_LANGUAGES.find((l) => l.code === code) || SUPPORTED_LANGUAGES[0]

  const send = async (customText = null) => {
    const rawQuery = customText || input
    const targetLangObj = getLanguageObj(selectedLang)

    // Dynamic default query depending on selected language
    let baseQueryText = rawQuery.trim()
    if (!baseQueryText) {
      if (selectedLang === 'hi-IN') {
        baseQueryText = `वाराणसी की पूरी ${duration} की चरण-दर-चरण यात्रा योजना बनाएं, जो ${tripType} यात्रा, ${budget} बजट और ${accessibility} प्राथमिकताओं के लिए अनुकूलित हो।`
      } else {
        baseQueryText = `Generate a complete ${duration} step-by-step Varanasi itinerary customized for a ${tripType} trip with a ${budget} budget and ${accessibility} preferences.`
      }
    }

    if (sending) return

    // Explicit native instructions based on selected language
    let nativeInstruction = `Please respond completely in ${targetLangObj.name} language.`
    if (selectedLang === 'hi-IN') {
      nativeInstruction = `कृपया पूरी तरह से हिंदी (Hindi) भाषा में ही जवाब दें। किसी अन्य भाषा का प्रयोग न करें।`
    } else if (selectedLang === 'bn-IN') {
      nativeInstruction = `অনুগ্ৰহ করে সম্পূর্ণ প্রতিক্রিয়া বাংলায় দিন।`
    } else if (selectedLang === 'ta-IN') {
      nativeInstruction = `தயவுசெய்து முழு பதிலையும் தமிழில் தெரிவிக்கவும்.`
    } else if (selectedLang === 'te-IN') {
      nativeInstruction = `దయచేసి సంపూర్ణ సమాధానాన్ని తెలుగులో ఇవ్వండి.`
    } else if (selectedLang === 'mr-IN') {
      nativeInstruction = `कृपया संपूर्ण उत्तर मराठी भाषेत द्या.`
    } else if (selectedLang === 'gu-IN') {
      nativeInstruction = `કૃપા કરીને સંપૂર્ણ જવાબ ગુજરાતીમાં આપો.`
    }

    // Format query explicitly requesting output in target language
    const enrichedQuery = `[Trip Parameters -> Language: ${targetLangObj.name} (${selectedLang}), Type: ${tripType}, Budget: ${budget}, Duration: ${duration}, Preference: ${accessibility}] ${nativeInstruction} Query: ${baseQueryText}`

    setInput('')
    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        text: baseQueryText,
        meta: { tripType, budget, duration, accessibility, lang: targetLangObj.name },
      },
    ])
    setSending(true)

    try {
      const { data } = await sendQuery(enrichedQuery, sessionId, selectedLang)
      setSessionId(data.session_id)

      if (data.map_images && data.map_images.length > 0) {
        const firstMap = data.map_images[0].split(/[/\\]/).pop()
        setActiveMapFilename(firstMap)
      } else if (data.map_image) {
        const singleMap = data.map_image.split(/[/\\]/).pop()
        setActiveMapFilename(singleMap)
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: data.response || data.response_text || data.text,
          categories: data.preferred_categories,
          language: data.detected_language || targetLangObj.name,
          mapImages: data.map_images || (data.map_image ? [data.map_image] : []),
        },
      ])
      loadSessions()
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: err.response?.data?.detail || (selectedLang === 'hi-IN' ? 'यात्रा योजना बनाने में असमर्थ। कृपया पुनः प्रयास करें।' : 'Failed to synthesize itinerary.'),
        },
      ])
    } finally {
      setSending(false)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data)
      }

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        stream.getTracks().forEach((track) => track.stop())
        await processVoiceQuery(audioBlob)
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
    } catch {
      alert('Microphone access denied.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const processVoiceQuery = async (audioBlob) => {
    setSending(true)
    const voiceLoadingText = selectedLang === 'hi-IN' 
      ? '🎙️ आपकी आवाज़ को प्रोसेस किया जा रहा है...' 
      : '🎙️ Processing voice request...'

    setMessages((prev) => [
      ...prev,
      { role: 'user', text: voiceLoadingText, isVoice: true },
    ])

    try {
      const { data } = await sendVoiceQuery({
        audioBlob,
        sessionId,
        languageCode: selectedLang,
      })

      setSessionId(data.session_id)

      if (data.map_images && data.map_images.length > 0) {
        const firstMap = data.map_images[0].split(/[/\\]/).pop()
        setActiveMapFilename(firstMap)
      }

      setMessages((prev) => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: 'user',
          text: data.transcribed_query || (selectedLang === 'hi-IN' ? 'आवाज़ अनुरोध' : 'Voice query'),
        }
        return [
          ...updated,
          {
            role: 'assistant',
            text: data.response_text || data.response,
            audioUrl: data.audio_filename ? getVoiceAudioUrl(data.audio_filename) : null,
            categories: data.preferred_categories,
            language: getLanguageObj(selectedLang).name,
            mapImages: data.map_images || [],
          },
        ]
      })
      loadSessions()
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: err.response?.data?.detail || (selectedLang === 'hi-IN' ? 'आवाज़ प्रोसेसिंग त्रुटि।' : 'Voice processing error.'),
        },
      ])
    } finally {
      setSending(false)
    }
  }

  const startNew = async () => {
    try {
      const { data } = await newChat()
      setSessionId(data.session_id)
      setMessages([])
      setHistoryDrawerOpen(false)
    } catch {
      setSessionId(null)
      setMessages([])
    }
  }

  const openSession = async (id) => {
    try {
      const { data } = await getChatHistoryDetail(id)
      setSessionId(id)
      setMessages(
        (data.messages || []).flatMap((m) => [
          { role: 'user', text: m.query },
          { role: 'assistant', text: m.response },
        ])
      )
      setHistoryDrawerOpen(false)
    } catch (err) {
      console.error(err)
    }
  }

  const removeSession = async (id, e) => {
    e.stopPropagation()
    try {
      await deleteChatHistory(id)
      loadSessions()
      if (id === sessionId) {
        setSessionId(null)
        setMessages([])
      }
    } catch (err) {
      console.error(err)
    }
  }

  const getLocalMapUrl = (filename) => `/api/maps/${filename}`

  const getSelectedLangLabel = () => {
    return getLanguageObj(selectedLang).name
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] text-slate-800 py-6 sm:py-8 selection:bg-amber-100 selection:text-amber-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        
        {/* --- HEADER TOOLBAR --- */}
        <div className="bg-white border border-amber-200/80 rounded-3xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-200 flex items-center justify-center text-amber-600 shadow-xs">
              <Compass size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                Safarnama Travel Studio
                <Sparkles size={16} className="text-amber-500" />
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Intelligent planner &amp; grounded local city maps
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setHistoryDrawerOpen(!historyDrawerOpen)}
              className={`inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl border transition shadow-xs ${
                historyDrawerOpen
                  ? 'bg-amber-100/70 border-amber-300 text-amber-900'
                  : 'bg-white border-amber-200/70 text-amber-800 hover:bg-amber-50'
              }`}
            >
              <History size={15} className="text-amber-600" />
              <span>Saved Plans ({sessions.length})</span>
            </button>

            {/* Language Selector */}
            <div className="relative flex items-center">
              <Languages size={15} className="absolute left-3.5 text-slate-400 pointer-events-none" />
              <select
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value)}
                className="pl-9 pr-4 py-2.5 bg-white hover:bg-amber-50 border border-amber-200/70 rounded-xl text-xs font-bold text-amber-800 focus:outline-none transition shadow-xs"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={startNew}
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-amber-200/60 px-4 py-2.5 rounded-xl transition shadow-xs"
            >
              <Plus size={15} /> New Canvas
            </button>
          </div>
        </div>

        {/* --- MAIN SPLIT STUDIO WORKSPACE --- */}
        <div className="relative bg-white border border-amber-200/80 rounded-3xl shadow-xs overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[550px]">
          
          {/* HISTORY DRAWER OVERLAY */}
          {historyDrawerOpen && (
            <div className="absolute inset-0 z-30 bg-slate-900/20 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
              <div className="w-full max-w-md bg-white border-l border-amber-200 h-full p-6 flex flex-col justify-between shadow-2xl">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-2">
                      <History size={18} className="text-amber-600" />
                      <h3 className="font-bold text-sm text-slate-900">Saved Itinerary Trails</h3>
                    </div>
                    <button
                      onClick={() => setHistoryDrawerOpen(false)}
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="space-y-2 overflow-y-auto max-h-[70vh] pr-1">
                    {sessions.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-8">No saved itineraries yet.</p>
                    ) : (
                      sessions.map((s) => (
                        <div
                          key={s.session_id}
                          onClick={() => openSession(s.session_id)}
                          className={`group flex items-center justify-between p-3.5 rounded-2xl border text-xs font-medium cursor-pointer transition ${
                            s.session_id === sessionId
                              ? 'bg-amber-50 border-amber-300 text-amber-900'
                              : 'bg-white border-amber-200/50 hover:border-amber-300 hover:bg-amber-50/50'
                          }`}
                        >
                          <span className="truncate pr-4">{s.title || `Itinerary #${s.session_id?.slice(0, 8)}`}</span>
                          <div className="flex items-center gap-2">
                            <ChevronRight size={14} className="text-amber-400" />
                            <button
                              onClick={(e) => removeSession(s.session_id, e)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded-lg"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 border-t border-slate-100 pt-3">
                  Click any trail above to restore its full conversation stream.
                </p>
              </div>
            </div>
          )}

          {/* LEFT PANEL: PREFERENCES & CITY MAP */}
          <div className="lg:col-span-5 border-b lg:border-b-0 lg:border-r border-amber-200/80 p-6 sm:p-8 bg-[#faf8f5] flex flex-col justify-start space-y-6 lg:sticky lg:top-toolbar-height h-auto lg:h-[550px] overflow-y-auto scrollbar-thin">
            
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-amber-200/70 pb-3">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={17} className="text-amber-700" />
                  <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                    Configure Trip Parameters
                  </h3>
                </div>
              </div>

              {/* Preferences Selector Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Users size={13} /> Trip Group
                  </label>
                  <select
                    value={tripType}
                    onChange={(e) => setTripType(e.target.value)}
                    className="w-full bg-white border border-amber-200/80 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 shadow-2xs focus:outline-none transition"
                  >
                    <option value="Solo">Solo Traveler</option>
                    <option value="Family">Family / Kids</option>
                    <option value="Couple">Couple / Romantic</option>
                    <option value="Friends">Friends Group</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Wallet size={13} /> Budget Tier
                  </label>
                  <select
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full bg-white border border-amber-200/80 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 shadow-2xs focus:outline-none transition"
                  >
                    <option value="Budget">Budget / Backpacking</option>
                    <option value="Moderate">Moderate Comfort</option>
                    <option value="Luxury">Luxury &amp; Fine Dining</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <CalendarDays size={13} /> Duration
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full bg-white border border-amber-200/80 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 shadow-2xs focus:outline-none transition"
                  >
                    <option value="1 Day">1 Day Express</option>
                    <option value="2-3 Days">2-3 Days Weekend</option>
                    <option value="Extended">4+ Days Deep Explore</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Accessibility size={13} /> Preference
                  </label>
                  <select
                    value={accessibility}
                    onChange={(e) => setAccessibility(e.target.value)}
                    className="w-full bg-white border border-amber-200/80 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 shadow-2xs focus:outline-none transition"
                  >
                    <option value="Standard">Standard Walking</option>
                    <option value="Senior Friendly">Senior / Minimal Stairs</option>
                    <option value="Wheelchair Friendly">Wheelchair Accessible</option>
                    <option value="Pure Veg">Pure Veg / Sattvic Food</option>
                  </select>
                </div>
              </div>

              <button
                onClick={() => send()}
                disabled={sending}
                className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-bold py-3 rounded-2xl text-xs flex items-center justify-center gap-2.5 transition shadow-md shadow-slate-900/10"
              >
                <Wand2 size={16} />
                <span>Synthesize Customized Itinerary ({getSelectedLangLabel()})</span>
              </button>

              {/* STICKY LOCAL CITY MAP DISPLAY PANEL */}
              <div className="pt-5 border-t border-amber-200/70 space-y-3 sticky bottom-0 bg-[#faf8f5] pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapIcon size={16} className="text-rose-700" />
                    <span className="text-xs font-bold text-slate-900">
                      Grounded City Map Reference
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-600 bg-white border border-amber-200 rounded-lg px-2.5 py-0.5 shadow-2xs">
                    {activeMapFilename}
                  </span>
                </div>

                <div className="relative rounded-3xl overflow-hidden border border-amber-200 bg-white h-48 sm:h-56 flex items-center justify-center group shadow-sm">
                  <img
                    src={getLocalMapUrl(activeMapFilename)}
                    alt="Varanasi Local City Map"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.onerror = null
                      e.currentTarget.src =
                        'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80'
                    }}
                  />
                  <div className="absolute inset-0 bg-slate-900/5 pointer-events-none group-hover:bg-transparent transition-colors" />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: VERTICAL ITINERARY STREAM CANVAS */}
          <div className="lg:col-span-7 flex flex-col min-w-0 bg-white h-[550px]">
            
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 scrollbar-thin">
              {messages.length === 0 ? (
                <div className="max-w-md mx-auto py-8 text-center space-y-6">
                  <div className="w-14 h-14 rounded-3xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 mx-auto shadow-sm">
                    <Sparkle size={28} />
                  </div>
                  <div className="space-y-1.5">
                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Varanasi Tour Canvas</h2>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                      Adjust parameters on the left or launch a signature Kashi trail.
                    </p>
                  </div>

                  <div className="space-y-3 text-left pt-2">
                    {[
                      { title: 'Morning Ghat Aarti & Sunrise Ride', prompt: 'Best morning ghat boat ride route and Aarti timings' },
                      { title: 'Kashi Vishwanath Darshan Route', prompt: 'Kashi Vishwanath Temple entrance and VIP darshan guide' },
                      { title: 'Banarasi Street Food Trail', prompt: 'Authentic street food spots near Dashashwamedh Ghat' },
                    ].map((item) => (
                      <button
                        key={item.title}
                        onClick={() => send(item.prompt)}
                        className="w-full flex items-start gap-4 p-4.5 bg-[#faf8f5] hover:bg-amber-50 border border-amber-200/70 hover:border-amber-300 rounded-2xl transition text-left group shadow-2xs"
                      >
                        <div className="p-2.5 rounded-xl bg-white border border-amber-200 group-hover:border-amber-300 text-amber-600 shrink-0 shadow-sm transition">
                          <Route size={16} />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-amber-900 flex items-center justify-between">
                            {item.title}
                            <MapPin size={13} className="text-amber-500" />
                          </h4>
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-1">{item.prompt}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((m, i) =>
                  m.role === 'user' ? (
                    <div key={i} className="flex justify-end">
                      <div className="bg-slate-900 text-white rounded-3xl rounded-tr-xs px-5 py-4 text-xs max-w-lg shadow-md shadow-slate-900/10 space-y-2">
                        <p className="leading-relaxed whitespace-pre-line">{m.text}</p>
                        {m.meta && (
                          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-700/80 text-[10px] text-amber-300 font-extrabold">
                            <span className="bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">🌐 {m.meta.lang}</span>
                            <span className="bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">👥 {m.meta.tripType}</span>
                            <span className="bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">💰 {m.meta.budget}</span>
                            <span className="bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">⏳ {m.meta.duration}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div key={i} className="flex justify-start">
                      <div className="bg-[#faf8f5] border border-amber-200/80 rounded-3xl rounded-tl-xs p-6 max-w-2xl space-y-4 shadow-2xs">
                        <div className="flex items-center justify-between border-b border-amber-200/70 pb-3">
                          <div className="flex items-center gap-2">
                            <Bot size={18} className="text-amber-700" />
                            <span className="font-extrabold text-xs text-slate-900 tracking-tight">Safarnama Synthesized Itinerary</span>
                          </div>
                          {m.language && (
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-md border border-amber-200">
                              {m.language}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-800 whitespace-pre-line leading-relaxed">
                          {m.text}
                        </p>

                        {/* Local map image reference buttons */}
                        {m.mapImages && m.mapImages.length > 0 && (
                          <div className="pt-3.5 border-t border-amber-200/70">
                            <h5 className="text-[11px] font-extrabold text-slate-500 mb-2 flex items-center gap-1.5">
                              <MapPin size={12} className="text-rose-700" /> Refined Map Views
                            </h5>
                            <div className="flex flex-wrap gap-2.5">
                              {m.mapImages.map((img, idx) => {
                                const filename = img.split(/[/\\]/).pop()
                                return (
                                  <button
                                    key={idx}
                                    onClick={() => setActiveMapFilename(filename)}
                                    className="text-[11px] font-bold bg-white border border-amber-200 hover:border-amber-400 hover:bg-amber-50 text-amber-900 px-3 py-1.5 rounded-xl transition shadow-2xs flex items-center gap-1.5"
                                  >
                                    🗺️ Load View {idx + 1}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        )}

                        {m.audioUrl && (
                          <div className="flex items-center gap-2 pt-3 border-t border-amber-200/70">
                            <Volume2 size={16} className="text-amber-600" />
                            <audio controls autoPlay className="h-8 w-full max-w-xs audio-warm">
                              <source src={m.audioUrl} type="audio/mpeg" />
                            </audio>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                )
              )}

              {sending && (
                <div className="flex items-center gap-3">
                  <div className="bg-[#faf8f5] border border-amber-200 rounded-3xl px-6 py-4 shadow-2xs">
                    <Loader label={selectedLang === 'hi-IN' ? `हिंदी में यात्रा योजना तैयार की जा रही है...` : `Synthesizing itinerary in ${getSelectedLangLabel()}...`} />
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Prompt Control Form */}
            <div className="p-4 border-t border-amber-100 bg-white">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  send()
                }}
                className="flex items-center gap-2.5 bg-[#faf8f5] border border-amber-200/80 focus-within:border-amber-500 focus-within:bg-white rounded-2xl p-2 transition shadow-inner"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={selectedLang === 'hi-IN' ? "घाटों, मंदिरों के बारे में हिंदी में पूछें..." : `Type in ${getSelectedLangLabel()} or click mic to ask specifics...`}
                  className="flex-1 bg-transparent px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none"
                />

                {isRecording ? (
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="bg-rose-600 text-white rounded-xl px-4 py-2.5 text-xs font-extrabold flex items-center gap-1.5 animate-pulse shrink-0"
                  >
                    <Square size={13} className="fill-white" /> Stop
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={startRecording}
                    disabled={sending}
                    className="p-2.5 text-slate-500 hover:text-amber-700 rounded-xl hover:bg-amber-100/50 transition shrink-0"
                  >
                    <Mic size={18} />
                  </button>
                )}

                <button
                  type="submit"
                  disabled={sending}
                  className="bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white rounded-xl px-5 py-2.5 text-xs font-extrabold flex items-center gap-2 transition shadow-md shadow-amber-600/10 shrink-0"
                >
                  <span>Send</span>
                  <Send size={13} />
                </button>
              </form>
            </div>

          </div>

        </div>

      </div>
    </div>
  )
}