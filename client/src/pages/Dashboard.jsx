import { ArrowLeft, Check, Coins, Rocket, Share2, X, Plus, Globe, ExternalLink, LayoutDashboard } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useInView } from 'motion/react'
import TiltContainer from '../components/TiltContainer'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { serverUrl } from '../App'
import { setUserData } from '../redux/userSlice'

const ease = [0.16, 1, 0.3, 1]

/* ─── Individual website card ─────────────────────────────── */
function WebsiteCard({ w, index, onDeploy, onCopy, copiedId, onEdit }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-32px' })
  const copied = copiedId === w._id

  return (
    <TiltContainer enableGlow={true} className="rounded-2xl h-full">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.45, delay: index * 0.06, ease }}
        className='glass rounded-2xl overflow-hidden flex flex-col group border border-white/[0.08] hover:border-white/[0.15] transition-colors duration-300 h-full'
      >
      {/* ── Preview thumbnail ── */}
      <div
        className='relative h-44 bg-zinc-950 overflow-hidden cursor-pointer'
        onClick={onEdit}
      >
        <iframe
          srcDoc={w.latestCode}
          className='absolute inset-0 w-[140%] h-[140%] scale-[0.72] origin-top-left pointer-events-none'
          title={w.title}
        />
        {/* Gradient overlay */}
        <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none' />

        {/* Live badge */}
        {w.deployed && (
          <div className='absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[11px] font-medium'>
            <span className='w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse' />
            Live
          </div>
        )}

        {/* Hover "Open Editor" reveal */}
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          className='absolute inset-0 flex items-center justify-center bg-black/45 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer'
          onClick={onEdit}
        >
          <span className="px-3.5 py-1.5 rounded-full bg-white text-black text-xs font-semibold shadow-xl border border-white/20">
            Open Editor
          </span>
        </motion.div>
      </div>

      {/* ── Card body ── */}
      <div className='p-5 flex flex-col gap-3 flex-1'>
        <div onClick={onEdit} className="cursor-pointer">
          <h3 className='font-semibold text-sm leading-snug line-clamp-2 group-hover:text-violet-400 transition-colors duration-200'>
            {w.title}
          </h3>
          <p className='text-xs text-zinc-500 mt-1'>
            Updated {new Date(w.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Action buttons */}
        <div className='mt-auto'>
          {!w.deployed ? (
            /* Deploy button */
            <motion.button
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.12 }}
              onClick={() => onDeploy(w._id)}
              className='w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90 transition-opacity cursor-pointer'
            >
              <Rocket size={14} />
              Deploy
            </motion.button>
          ) : (
            /* Deployed → Visit + Share split */
            <div className='flex gap-2'>
              <motion.button
                whileTap={{ scale: 0.96 }}
                transition={{ duration: 0.12 }}
                onClick={() => window.open(w.deployUrl, '_blank')}
                className='flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium glass hover:bg-white/10 transition-all duration-200 cursor-pointer'
              >
                <ExternalLink size={12} />
                Visit
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.96 }}
                transition={{ duration: 0.12 }}
                onClick={() => onCopy(w)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${copied
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'glass hover:bg-white/10'
                  }`}
              >
                {copied ? (
                  <><Check size={12} /> Copied</>
                ) : (
                  <><Share2 size={12} /> Share</>
                )}
              </motion.button>
            </div>
          )}
        </div>
      </div>
      </motion.div>
    </TiltContainer>
  )
}

/* ══════════════════════════════════════════════════════════════
   Dashboard
══════════════════════════════════════════════════════════════ */
function Dashboard() {
  const { userData } = useSelector(state => state.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [websites, setWebsites] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copiedId, setCopiedId] = useState(null)
  const [paymentToast, setPaymentToast] = useState(false)

  /* ── Payment success: show toast + refresh user credits ── */
  useEffect(() => {
    if (searchParams.get('payment') === 'success') {
      setPaymentToast(true)
      setSearchParams({}, { replace: true })

      const refreshUser = async () => {
        try {
          const result = await axios.get(`${serverUrl}/api/user/me`, { withCredentials: true })
          dispatch(setUserData(result.data))
        } catch (err) {
          console.log('Failed to refresh user after payment', err)
        }
      }
      refreshUser()

      const timer = setTimeout(() => setPaymentToast(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [])

  /* ── Deploy ── */
  const handleDeploy = async (id) => {
    try {
      const result = await axios.get(`${serverUrl}/api/website/deploy/${id}`, { withCredentials: true })
      window.open(`${result.data.url}`, '_blank')
      setWebsites(prev =>
        prev.map(w => w._id === id ? { ...w, deployed: true, deployUrl: result.data.url } : w)
      )
    } catch (error) {
      console.log(error)
    }
  }

  /* ── Load websites ── */
  useEffect(() => {
    const fetchWebsites = async () => {
      setLoading(true)
      try {
        const result = await axios.get(`${serverUrl}/api/website/get-all`, { withCredentials: true })
        setWebsites(result.data || [])
        setLoading(false)
      } catch (error) {
        console.log(error)
        setError(error?.response?.data?.message || 'Failed to load websites')
        setLoading(false)
      }
    }
    fetchWebsites()
  }, [])

  /* ── Copy share link ── */
  const handleCopy = async (site) => {
    await navigator.clipboard.writeText(site.deployUrl)
    setCopiedId(site._id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className='min-h-screen bg-[#050505] text-white'>

      {/* ════════════════════════════════════════════════
          PAYMENT SUCCESS TOAST
      ════════════════════════════════════════════════ */}
      <AnimatePresence>
        {paymentToast && (
          <motion.div
            initial={{ opacity: 0, y: -56 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -56 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className='fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm font-medium shadow-2xl backdrop-blur-xl whitespace-nowrap'
          >
            <div className='flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/25 shrink-0'>
              <Check size={12} className='text-emerald-400' />
            </div>
            <span>Payment successful! Your credits have been added.</span>
            <button
              onClick={() => setPaymentToast(false)}
              className='ml-1 text-emerald-400/70 hover:text-emerald-300 transition-colors'
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════════
          TOP NAV
      ════════════════════════════════════════════════ */}
      <div className='sticky top-0 z-40 backdrop-blur-xl bg-black/60 border-b border-white/[0.07]'>
        <div className='max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between'>

          {/* Left: back + title */}
          <div className='flex items-center gap-3'>
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.93 }}
              transition={{ duration: 0.15 }}
              className='p-2 rounded-lg glass hover:bg-white/10 transition-colors'
              onClick={() => navigate('/')}
            >
              <ArrowLeft size={15} />
            </motion.button>
            <div className='flex items-center gap-2 text-base font-semibold tracking-tight'>
              <LayoutDashboard size={15} className='text-zinc-400' />
              Dashboard
            </div>
          </div>

          {/* Right: credits + new website */}
          <div className='flex items-center gap-3'>
            {userData && (
              <motion.button
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.10)' }}
                transition={{ duration: 0.15 }}
                onClick={() => navigate('/pricing')}
                className='hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full glass border-white/10 text-sm cursor-pointer transition-colors'
              >
                <Coins size={13} className='text-yellow-400' />
                <span className='text-zinc-400'>Credits</span>
                <span className='font-bold text-white'>{userData.credits}</span>
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.15 }}
              onClick={() => navigate('/generate')}
              className='flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-black text-sm font-semibold hover:bg-zinc-100 transition-colors'
            >
              <Plus size={14} />
              New Website
            </motion.button>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════
          PAGE BODY
      ════════════════════════════════════════════════ */}
      <div className='max-w-7xl mx-auto px-5 sm:px-8 py-10'>

        {/* Welcome header */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          className='mb-10'
        >
          <p className='text-sm text-zinc-500 mb-1'>Welcome back</p>
          <h1 className='text-3xl font-bold tracking-tight'>{userData?.name}</h1>
        </motion.div>

        {/* ── Loading state ── */}
        {loading && (
          <div className='flex flex-col items-center justify-center py-32 gap-4'>
            <div className='w-8 h-8 rounded-full border-2 border-white/10 border-t-violet-500 animate-spin' />
            <p className='text-sm text-zinc-500'>Loading your websites…</p>
          </div>
        )}

        {/* ── Error state ── */}
        {error && !loading && (
          <div className='mt-24 text-center'>
            <p className='text-red-400 text-sm'>{error}</p>
          </div>
        )}

        {/* ── Empty state ── */}
        {websites?.length === 0 && !loading && !error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
            className='flex flex-col items-center justify-center py-32 text-center'
          >
            <div className='w-16 h-16 rounded-2xl glass border border-white/10 flex items-center justify-center mb-6'>
              <Globe size={24} className='text-zinc-500' />
            </div>
            <h3 className='text-xl font-semibold mb-2 tracking-tight'>No websites yet</h3>
            <p className='text-zinc-500 text-sm mb-8 max-w-xs leading-relaxed'>
              Generate your first AI-powered website in minutes.
            </p>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.15 }}
              onClick={() => navigate('/generate')}
              className='inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-blue-500 font-semibold text-sm hover:opacity-90 transition-opacity'
            >
              <Plus size={15} />
              Generate your first website
            </motion.button>
          </motion.div>
        )}

        {/* ── Website grid ── */}
        {!loading && !error && websites?.length > 0 && (
          <>
            {/* Grid header */}
            <div className='flex items-center justify-between mb-6'>
              <h2 className='text-lg font-semibold tracking-tight'>Your Websites</h2>
              <span className='text-xs text-zinc-500 glass px-3 py-1 rounded-full border border-white/[0.07]'>
                {websites.length} site{websites.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Responsive grid */}
            <motion.div layout className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6'>
              <AnimatePresence mode="popLayout">
                {websites.map((w, i) => (
                  <motion.div
                    key={w._id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                  >
                    <WebsiteCard
                      w={w}
                      index={i}
                      onDeploy={handleDeploy}
                      onCopy={handleCopy}
                      copiedId={copiedId}
                      onEdit={() => navigate(`/editor/${w._id}`)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </div>
    </div>
  )
}

export default Dashboard
