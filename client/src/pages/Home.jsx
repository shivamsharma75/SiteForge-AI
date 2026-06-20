import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useScroll, useTransform } from 'motion/react'
import TiltContainer from '../components/TiltContainer'
import LoginModal from '../components/LoginModal'
import { useDispatch, useSelector } from 'react-redux'
import { Coins, Sparkles, LayoutGrid, Rocket, ArrowRight, ChevronRight, Zap, Wand2, Layers, Sliders, Code2, Inbox } from 'lucide-react'
import { serverUrl } from '../App'
import axios from 'axios'
import { setUserData } from '../redux/userSlice'
import { useNavigate } from 'react-router-dom'

/* ─── Shared easing curve (smooth deceleration, no bounce) ─── */
const ease = [0.16, 1, 0.3, 1]

/* ─── Scroll-triggered fade+slide wrapper ─────────────────── */
function FadeUp({ children, delay = 0, className = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-56px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ─── Feature cards data ───────────────────────────────────── */
const features = [
  {
    icon: Wand2,
    accent: 'text-violet-400',
    bg: 'bg-violet-500/10',
    title: 'AI Frontend Design',
    desc: 'Generates production-grade frontend layouts in clean HTML, CSS, and JS from a single prompt. Purpose-built for UI design.',
  },
  {
    icon: LayoutGrid,
    accent: 'text-blue-400',
    bg: 'bg-blue-500/10',
    title: 'Fully Responsive',
    desc: 'Every generated layout adapts flawlessly across mobile, tablet, and desktop viewports, requiring no manual media query editing.',
  },
  {
    icon: Code2,
    accent: 'text-purple-400',
    bg: 'bg-purple-500/10',
    title: 'Monaco Code Editor',
    desc: 'Tweak, edit, and rewrite the generated code on the fly in a full IDE editor, with instant live-reloading previews.',
  },
  {
    icon: Rocket,
    accent: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    title: 'One-Click Deploy',
    desc: 'Deploy your static frontend instantly to a live, shareable URL. Perfect for rapid prototyping and stakeholder review.',
  },
  {
    icon: Layers,
    accent: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    title: 'Local State Persistence',
    desc: 'Interactive elements (like shopping carts, checklists, or search filters) automatically persist data using localStorage.',
  },
  {
    icon: Inbox,
    accent: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    title: 'Built-in Leads Database',
    desc: 'Forms on your generated sites are automatically functional. Inbound leads are stored in MongoDB and visible in your dashboard.',
  },
]

/* ─── How-it-works steps ───────────────────────────────────── */
const steps = [
  { num: '01', title: 'Describe', body: 'Type your idea in plain English — landing page, portfolio, SaaS site, anything.' },
  { num: '02', title: 'Generate', body: 'AI builds a fully responsive, animated website in seconds.' },
  { num: '03', title: 'Deploy', body: 'Publish to a live URL instantly. Edit and regenerate as many times as you need.' },
]



/* ══════════════════════════════════════════════════════════════
   Home Page
══════════════════════════════════════════════════════════════ */
function Home() {
  const [openLogin, setOpenLogin] = useState(false)
  const [openProfile, setOpenProfile] = useState(false)
  const [websites, setWebsites] = useState(null)

  const { userData } = useSelector(state => state.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { scrollY } = useScroll()
  const yBlob1 = useTransform(scrollY, [0, 500], [0, 80])
  const yBlob2 = useTransform(scrollY, [0, 500], [0, -50])

  /* ── Logout ── */
  const handleLogOut = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true })
      dispatch(setUserData(null))
      setOpenProfile(false)
    } catch (error) {
      console.log(error)
    }
  }

  /* ── Fetch websites if logged in ── */
  useEffect(() => {
    if (!userData) return
    const fetchWebsites = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/website/get-all`, { withCredentials: true })
        setWebsites(result.data || [])
      } catch (error) {
        console.log(error)
      }
    }
    fetchWebsites()
  }, [userData])

  return (
    <div className='relative min-h-screen bg-[#040404] text-white overflow-x-hidden'>

      {/* ════════════════════════════════════════════════
          NAV
      ════════════════════════════════════════════════ */}
      <motion.nav
        initial={{ y: -44, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease }}
        className='fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/50 border-b border-white/[0.07]'
      >
        <div className='max-w-7xl mx-auto px-5 sm:px-8 py-4 flex justify-between items-center'>

          {/* Logo */}
          <div
            className='flex items-center gap-2 text-base font-semibold tracking-tight cursor-pointer select-none'
            onClick={() => navigate('/')}
          >
            <div className='w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shrink-0'>
              <Zap size={14} className='text-white' />
            </div>
            SiteForge AI
          </div>

          {/* Right cluster */}
          <div className='flex items-center gap-3 sm:gap-4'>

            {/* Pricing link */}
            <motion.button
              whileHover={{ color: '#fff' }}
              transition={{ duration: 0.15 }}
              className='hidden md:block text-sm text-zinc-400 hover:text-white transition-colors duration-200'
              onClick={() => navigate('/pricing')}
            >
              Pricing
            </motion.button>

            {/* Credits badge — only when logged in */}
            {userData && (
              <motion.button
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.10)' }}
                transition={{ duration: 0.15 }}
                onClick={() => navigate('/pricing')}
                className='hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm cursor-pointer transition-colors'
              >
                <Coins size={13} className='text-yellow-400' />
                <span className='text-zinc-400'>Credits</span>
                <span className='font-semibold text-white'>{userData.credits}</span>
              </motion.button>
            )}

            {/* Get Started button / Avatar */}
            {!userData ? (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.15, ease }}
                className='px-4 py-2 rounded-lg bg-white text-black text-sm font-semibold hover:bg-zinc-100 transition-colors duration-200'
                onClick={() => setOpenLogin(true)}
              >
                Get Started
              </motion.button>
            ) : (
              <div className='relative'>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setOpenProfile(!openProfile)}
                >
                  <img
                    src={userData?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=7c3aed&color=fff`}
                    alt={userData.name}
                    referrerPolicy='no-referrer'
                    className='w-9 h-9 rounded-full border border-white/20 object-cover hover:border-violet-400/50 transition-all duration-200'
                  />
                </motion.button>

                {/* Profile dropdown */}
                <AnimatePresence>
                  {openProfile && (
                    <>
                      {/* Click-outside backdrop */}
                      <div
                        className='fixed inset-0 z-40'
                        onClick={() => setOpenProfile(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ duration: 0.16, ease }}
                        className='absolute right-0 mt-3 w-60 z-50 rounded-2xl glass border border-white/10 shadow-2xl shadow-black/60 overflow-hidden'
                      >
                        {/* User info */}
                        <div className='px-4 py-3 border-b border-white/[0.07]'>
                          <p className='text-sm font-semibold truncate'>{userData.name}</p>
                          <p className='text-xs text-zinc-500 truncate mt-0.5'>{userData.email}</p>
                        </div>

                        <div className='p-1'>
                          {/* Credits — mobile only */}
                          <button
                            className='md:hidden w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-zinc-300 hover:bg-white/5 transition-colors'
                            onClick={() => navigate('/pricing')}
                          >
                            <Coins size={13} className='text-yellow-400' />
                            <span>{userData.credits} Credits</span>
                          </button>

                          <button
                            className='w-full flex items-center px-3 py-2.5 rounded-lg text-sm text-zinc-300 hover:bg-white/5 transition-colors'
                            onClick={() => { navigate('/dashboard'); setOpenProfile(false) }}
                          >
                            Dashboard
                          </button>

                          <button
                            className='w-full flex items-center px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/5 transition-colors'
                            onClick={handleLogOut}
                          >
                            Logout
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </motion.nav>

      {/* ════════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════════ */}
      <section className='relative dot-grid pt-40 sm:pt-48 pb-24 sm:pb-32 px-5 sm:px-8 text-center overflow-hidden'>
        {/* Ambient glow blobs */}
        <motion.div style={{ y: yBlob1 }} className='absolute -top-36 left-1/2 -translate-x-1/2 w-[640px] h-[480px] bg-violet-600/14 rounded-full blur-[120px] pointer-events-none' />
        <motion.div style={{ y: yBlob2 }} className='absolute top-16 -right-48 w-[380px] h-[380px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none' />

        {/* Pill badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease }}
          className='inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-violet-500/25 text-sm text-violet-300 mb-8'
        >
          <Sparkles size={13} className='text-violet-400' />
          AI-Powered Frontend Design Generator
        </motion.div>

        {/* Headline — staggered lines */}
        <motion.h1
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.18, ease }}
          className='text-5xl sm:text-6xl md:text-7xl font-bold tracking-[-0.03em] leading-[1.06] max-w-4xl mx-auto'
        >
          Build Stunning Websites
          <br />
          <span className='gradient-text'>with AI</span>
        </motion.h1>

        {/* Sub-headline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease }}
          className='mt-6 max-w-xl mx-auto text-zinc-400 text-lg sm:text-xl leading-relaxed'
        >
          Describe your idea and let AI generate a modern,
          responsive, production-ready frontend website design in seconds.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.42, ease }}
          className='flex items-center justify-center gap-3 mt-10 flex-wrap'
        >
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.15, ease }}
            className='flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white text-black text-sm font-semibold hover:bg-zinc-100 transition-colors duration-200 shadow-lg shadow-white/10'
            onClick={() => userData ? navigate('/dashboard') : setOpenLogin(true)}
          >
            {userData ? 'Go to Dashboard' : 'Get Started Free'}
            <ArrowRight size={15} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03, backgroundColor: 'rgba(255,255,255,0.07)' }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.15, ease }}
            className='flex items-center gap-2 px-7 py-3.5 rounded-xl glass text-sm font-medium text-zinc-300 hover:text-white transition-all duration-200'
            onClick={() => navigate('/pricing')}
          >
            See Pricing
          </motion.button>
        </motion.div>


      </section>

      {/* ════════════════════════════════════════════════
          FEATURE CARDS  (logged-out only)
      ════════════════════════════════════════════════ */}
      {!userData && (
        <section className='max-w-7xl mx-auto px-5 sm:px-8 pb-24 sm:pb-32'>
          <FadeUp className='text-center mb-12'>
            <p className='text-xs text-violet-400 font-semibold tracking-widest uppercase mb-3'>Why SiteForge</p>
            <h2 className='text-3xl sm:text-4xl font-bold tracking-tight'>Everything you need to ship</h2>
          </FadeUp>

          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6'>
            {features.map((f, i) => (
              <FadeUp key={i} delay={i * 0.07} className="h-full">
                <TiltContainer enableGlow={true} className="h-full rounded-2xl">
                  <div className='glass rounded-2xl p-7 sm:p-8 h-full border border-white/[0.08] hover:border-white/[0.15] transition-all duration-300'>
                    <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${f.bg} mb-5`}>
                      <f.icon size={20} className={f.accent} />
                    </div>
                    <h3 className='text-lg font-semibold mb-2 tracking-tight'>{f.title}</h3>
                    <p className='text-sm text-zinc-400 leading-relaxed'>{f.desc}</p>
                  </div>
                </TiltContainer>
              </FadeUp>
            ))}
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════
          RECENT WEBSITES  (logged-in, has sites)
      ════════════════════════════════════════════════ */}
      {userData && websites?.length > 0 && (
        <section className='max-w-7xl mx-auto px-5 sm:px-8 pb-24 sm:pb-32'>
          <FadeUp className='flex items-center justify-between mb-8'>
            <h2 className='text-2xl font-bold tracking-tight'>Your Websites</h2>
            <button
              className='flex items-center gap-1 text-sm text-zinc-400 hover:text-white transition-colors'
              onClick={() => navigate('/dashboard')}
            >
              View all <ChevronRight size={14} />
            </button>
          </FadeUp>

          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6'>
            {websites.slice(0, 3).map((w, i) => (
              <FadeUp key={w._id} delay={i * 0.06} className="h-full">
                <TiltContainer enableGlow={true} className="h-full rounded-2xl">
                  <div
                    onClick={() => navigate(`/editor/${w._id}`)}
                    className='glass rounded-2xl overflow-hidden cursor-pointer group h-full border border-white/[0.08] hover:border-white/[0.15] transition-all duration-300'
                  >
                    <div className='relative h-44 bg-zinc-950'>
                      <iframe
                        srcDoc={w.latestCode}
                        className='absolute inset-0 w-[140%] h-[140%] scale-[0.72] origin-top-left pointer-events-none'
                        title={w.title}
                      />
                      <div className='absolute inset-0 bg-gradient-to-t from-black/50 to-transparent' />
                    </div>
                    <div className='p-5'>
                      <h3 className='font-semibold text-sm line-clamp-1 group-hover:text-white transition-colors'>{w.title}</h3>
                      <p className='text-xs text-zinc-500 mt-1'>
                        Updated {new Date(w.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </TiltContainer>
              </FadeUp>
            ))}
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════
          HOW IT WORKS  (logged-out only)
      ════════════════════════════════════════════════ */}
      {!userData && (
        <section className='max-w-7xl mx-auto px-5 sm:px-8 pb-24 sm:pb-32'>
          <FadeUp className='text-center mb-16'>
            <p className='text-xs text-violet-400 font-semibold tracking-widest uppercase mb-3'>How it works</p>
            <h2 className='text-3xl sm:text-4xl font-bold tracking-tight'>Three steps to live</h2>
          </FadeUp>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6 relative'>
            {/* Dashed connector — desktop only */}
            <div className='hidden md:block absolute top-7 left-[calc(33%+1.5rem)] right-[calc(33%+1.5rem)] h-px border-t border-dashed border-white/[0.12] pointer-events-none' />

            {steps.map((s, i) => (
              <FadeUp key={i} delay={i * 0.09} className='text-center relative z-10'>
                {/* Step number badge */}
                <div className='inline-flex items-center justify-center w-14 h-14 rounded-full glass border-white/10 mb-6'>
                  <span className='text-sm font-bold gradient-text'>{s.num}</span>
                </div>
                <h3 className='text-xl font-bold mb-2 tracking-tight'>{s.title}</h3>
                <p className='text-sm text-zinc-400 leading-relaxed max-w-[210px] mx-auto'>{s.body}</p>
              </FadeUp>
            ))}
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════
          BOTTOM CTA BANNER  (logged-out only)
      ════════════════════════════════════════════════ */}
      {!userData && (
        <section className='max-w-7xl mx-auto px-5 sm:px-8 pb-24 sm:pb-32'>
          <FadeUp>
            <TiltContainer maxRotation={4} enableGlow={true} glowColor="rgba(124,58,237,0.12)" className="rounded-3xl">
              <div className='relative rounded-3xl overflow-hidden glass p-12 sm:p-16 text-center border border-white/[0.08] hover:border-white/[0.15] transition-all duration-300 h-full'>
                {/* Inner glow */}
                <div className='absolute inset-0 bg-gradient-to-br from-violet-600/12 via-transparent to-blue-600/8 pointer-events-none' />
                <div className='absolute -top-20 -right-20 w-60 h-60 bg-violet-500/20 rounded-full blur-[80px] pointer-events-none' />

                <div className='relative z-10'>
                  <h2 className='text-3xl sm:text-4xl font-bold tracking-tight mb-4'>
                    Start building for free
                  </h2>
                  <p className='text-zinc-400 mb-8 max-w-sm mx-auto text-sm sm:text-base'>
                    No credit card required. Your first website within a few minutes.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.04, opacity: 0.92 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ duration: 0.15, ease }}
                    onClick={() => setOpenLogin(true)}
                    className='inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-violet-500 to-blue-500 font-semibold text-sm hover:opacity-90 transition-opacity shadow-2xl shadow-violet-500/20'
                  >
                    <Sparkles size={15} />
                    Get Started Free
                  </motion.button>
                </div>
              </div>
            </TiltContainer>
          </FadeUp>
        </section>
      )}

      {/* ════════════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════════════ */}
      <footer className='border-t border-white/[0.07] py-10 px-5 sm:px-8'>
        <div className='max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4'>
          <div className='flex items-center gap-2 text-sm font-semibold'>
            <div className='w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center'>
              <Zap size={12} className='text-white' />
            </div>
            SiteForge AI
          </div>
          <p className='text-xs text-zinc-600'>
            &copy; {new Date().getFullYear()} SiteForge AI. All rights reserved.
          </p>
          <button
            className='text-sm text-zinc-500 hover:text-white transition-colors'
            onClick={() => navigate('/pricing')}
          >
            Pricing
          </button>
        </div>
      </footer>

      {/* ════════════════════════════════════════════════
          LOGIN MODAL
      ════════════════════════════════════════════════ */}
      {openLogin && (
        <LoginModal open={openLogin} onClose={() => setOpenLogin(false)} />
      )}
    </div>
  )
}

export default Home
