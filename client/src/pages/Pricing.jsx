import { ArrowLeft, Check, ChevronDown, Coins } from 'lucide-react'
import React, { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useInView } from 'motion/react'
import TiltContainer from '../components/TiltContainer'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { serverUrl } from '../App'

const ease = [0.16, 1, 0.3, 1]

/* ─── Plan definitions ─────────────────────────────────────── */
const plans = [
  {
    key: 'free',
    name: 'Free',
    price: '₹0',
    credits: 100,
    description: 'Perfect to explore SiteForge AI',
    features: [
      'AI website generation',
      'Responsive HTML output',
      'Basic animations',
    ],
    popular: false,
    button: 'Get Started',
  },
  {
    key: 'pro',
    name: 'Pro',
    price: '₹499',
    credits: 500,
    description: 'For serious creators & freelancers',
    features: [
      'Everything in Free',
      'Faster generation',
      'Edit & regenerate',
    ],
    popular: true,
    button: 'Upgrade to Pro',
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    price: '₹1499',
    credits: 1000,
    description: 'For teams & power users',
    features: [
      'Unlimited iterations',
      'Highest priority',
      'Team collaboration',
      'Dedicated support',
    ],
    popular: false,
    button: 'Contact Sales',
  },
]

/* ─── FAQ data ─────────────────────────────────────────────── */
const faqs = [
  {
    q: 'How do credits work?',
    a: 'Each AI generation consumes credits. You purchase credits once and they never expire. The Free plan gives you 100 credits to get started.',
  },
  {
    q: 'Can I edit the generated website?',
    a: 'Yes — every generated website can be opened in the SiteForge editor where you can tweak code, regenerate sections, and redeploy.',
  },
  {
    q: 'Is there a recurring subscription?',
    a: 'No subscriptions, no recurring charges. Buy a credit pack once and use it whenever you want. Top up any time.',
  },
  {
    q: 'How long does generation take?',
    a: 'Generation typically takes a few minutes depending on the complexity of the prompt. The result is a complete, responsive website.',
  },
  {
    q: 'Can I deploy my website publicly?',
    a: 'Yes. Every generated website can be deployed to a live public URL with one click — included in all plans.',
  },
]

/* ─── FAQ accordion item ───────────────────────────────────── */
function FAQItem({ q, a, index }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-32px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay: index * 0.05, ease }}
      className='border-b border-white/[0.07]'
    >
      <button
        onClick={() => setOpen(!open)}
        className='w-full flex items-center justify-between py-5 text-left gap-4 group'
      >
        <span className='text-sm font-medium text-zinc-300 group-hover:text-white transition-colors duration-200'>
          {q}
        </span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2, ease }}
          className='shrink-0 w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center'
        >
          <ChevronDown size={13} className='text-zinc-400' />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease }}
            className='overflow-hidden'
          >
            <p className='pb-5 text-sm text-zinc-400 leading-relaxed'>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ─── Pricing card ─────────────────────────────────────────── */
function PricingCard({ p, index, loading, onBuy }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-48px' })

  return (
    <TiltContainer 
      enableGlow={p.popular} 
      glowColor="rgba(99,102,241,0.18)" 
      maxRotation={p.popular ? 8 : 4} 
      className="rounded-3xl h-full"
    >
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.55, delay: index * 0.1, ease }}
        className={`relative flex flex-col rounded-3xl p-8 border backdrop-blur-xl transition-colors duration-300 h-full ${
          p.popular
            ? 'border-indigo-500/70 bg-gradient-to-b from-indigo-500/[0.13] via-indigo-500/[0.05] to-transparent shadow-2xl shadow-indigo-500/15'
            : 'border-white/[0.08] bg-white/[0.03] hover:border-white/[0.16] hover:bg-white/[0.05]'
        }`}
      >
      {/* Pro card ambient glow — animated pulse */}
      {p.popular && (
        <motion.div
          className='absolute inset-0 rounded-3xl pointer-events-none'
          animate={{ boxShadow: ['0 0 0 0 rgba(99,102,241,0)', '0 0 40px 4px rgba(99,102,241,0.18)', '0 0 0 0 rgba(99,102,241,0)'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Most Popular badge */}
      {p.popular && (
        <div className='absolute -top-3.5 left-1/2 -translate-x-1/2'>
          <span className='inline-flex items-center px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-xs font-semibold text-white shadow-lg shadow-indigo-500/30 whitespace-nowrap'>
            Most Popular
          </span>
        </div>
      )}

      {/* Plan header */}
      <div className='mb-5'>
        <h2 className='text-xl font-semibold tracking-tight mb-1'>{p.name}</h2>
        <p className='text-sm text-zinc-400'>{p.description}</p>
      </div>

      {/* Price */}
      <div className='flex items-end gap-1.5 mb-3'>
        <span className='text-4xl font-bold tracking-tight'>{p.price}</span>
        <span className='text-sm text-zinc-500 mb-1.5'>/one-time</span>
      </div>

      {/* Credits badge */}
      <div className='flex items-center gap-2 mb-8 w-fit px-3 py-1.5 rounded-xl bg-white/5 border border-white/[0.07]'>
        <Coins size={14} className='text-yellow-400' />
        <span className='text-sm font-semibold'>{p.credits} Credits</span>
      </div>

      {/* Feature list */}
      <ul className='space-y-3 mb-8 flex-1'>
        {p.features.map((f) => (
          <li key={f} className='flex items-start gap-2.5 text-sm'>
            <div className='mt-0.5 w-4 h-4 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0'>
              <Check size={10} className='text-emerald-400' />
            </div>
            <span className='text-zinc-300'>{f}</span>
          </li>
        ))}
      </ul>

      {/* CTA button — all payment logic unchanged */}
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        disabled={!!loading}
        onClick={() => onBuy(p.key)}
        className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${p.popular
            ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-90 shadow-lg shadow-indigo-500/20'
            : 'glass border border-white/10 text-zinc-200 hover:bg-white/10 hover:text-white'
          }`}
      >
        {loading === p.key ? (
          <span className='flex items-center justify-center gap-2'>
            <span className='w-3.5 h-3.5 rounded-full border-2 border-white/20 border-t-white animate-spin' />
            Redirecting…
          </span>
        ) : (
          p.button
        )}
      </motion.button>
      </motion.div>
    </TiltContainer>
  )
}

/* ══════════════════════════════════════════════════════════════
   Pricing Page
══════════════════════════════════════════════════════════════ */
function Pricing() {
  const navigate = useNavigate()
  const { userData } = useSelector(state => state.user)
  const [loading, setLoading] = useState(null)

  /* ── handleBuy — all original Stripe logic preserved ── */
  const handleBuy = async (planKey) => {
    if (!userData) {
      navigate('/')
      return
    }
    if (planKey === 'free') {
      navigate('/dashboard')
      return
    }
    setLoading(planKey)
    try {
      const result = await axios.post(`${serverUrl}/api/billing`, { planType: planKey }, { withCredentials: true })
      window.location.href = result.data.sessionUrl
    } catch (error) {
      console.log(error)
      setLoading(null)
    }
  }

  return (
    <div className='relative min-h-screen overflow-hidden bg-[#050505] text-white'>

      {/* ── Ambient background blobs ── */}
      <div className='absolute inset-0 pointer-events-none overflow-hidden'>
        <div className='absolute -top-48 -left-48 w-[600px] h-[600px] bg-indigo-600/12 rounded-full blur-[130px]' />
        <div className='absolute bottom-0 -right-48 w-[500px] h-[500px] bg-purple-600/12 rounded-full blur-[130px]' />
        <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-600/5 rounded-full blur-[100px]' />
      </div>

      <div className='relative z-10 max-w-6xl mx-auto px-5 sm:px-8 pt-16 pb-28'>

        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease }}
          whileHover={{ x: -2 }}
          className='mb-10 flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors duration-200'
          onClick={() => navigate('/')}
        >
          <ArrowLeft size={15} />
          Back
        </motion.button>

        {/* Hero heading */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05, ease }}
          className='text-center mb-16'
        >
          <p className='text-xs text-indigo-400 font-semibold tracking-widest uppercase mb-4'>Pricing</p>
          <h1 className='text-4xl sm:text-5xl font-bold tracking-[-0.03em] mb-4'>
            Simple, transparent pricing
          </h1>
          <p className='text-zinc-400 text-lg'>Buy credits once. Build anytime.</p>
        </motion.div>

        {/* Pricing cards grid */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 mb-14'>
          {plans.map((p, i) => (
            <PricingCard
              key={p.key}
              p={p}
              index={i}
              loading={loading}
              onBuy={handleBuy}
            />
          ))}
        </div>

        {/* Trust signals */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease }}
          className='flex items-center justify-center gap-2 flex-wrap mb-20'
        >
          {['No subscription', 'Credits never expire', 'Instant access'].map((t, i) => (
            <React.Fragment key={i}>
              <span className='text-sm text-zinc-500'>{t}</span>
              {i < 2 && <span className='text-zinc-700 select-none'>•</span>}
            </React.Fragment>
          ))}
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease }}
          className='max-w-2xl mx-auto'
        >
          <h2 className='text-2xl font-bold tracking-tight text-center mb-10'>
            Frequently asked questions
          </h2>
          <div className='glass rounded-2xl px-6 overflow-hidden'>
            {faqs.map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} index={i} />
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  )
}

export default Pricing
