'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import {
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  Code2,
  GitBranch,
  Globe,
  Headphones,
  Heart,
  Loader2,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Ticket,
  Wallet,
} from 'lucide-react'
import { Instagram, Discord, Twitter } from '@/components/ui/brand-icons'
import { Logo } from '@/components/ui/logo'
import { GhButton } from '@/components/ui/primitives'
import { useUI } from '@/components/providers/ui-provider'
import { useSettings } from '@/components/providers/settings-provider'
import { useNotifications } from '@/components/providers/notifications-provider'
import { useLocale } from '@/components/providers/locale-provider'
import { LANGUAGES, CURRENCIES } from '@/lib/i18n'
import { DISCORD_INVITE_URL, X_PROFILE_URL, INSTAGRAM_PROFILE_URL, getSocialPlatformByHref } from '@/lib/data'
import { FooterLiveStatus } from '@/components/footer-live-status'
import { useFooterClearance, useFooterPresence } from '@/components/use-footer-clearance'
import { cn } from '@/lib/utils'
import type { TranslationKey } from '@/lib/i18n'

const FestivalLibraryModal = dynamic(
  () => import('@/components/festival-library-modal').then((m) => m.FestivalLibraryModal),
  { ssr: false },
)

function useFooterColumns(t: (key: TranslationKey) => string) {
  return [
    {
      title: t('footer.colExplore'),
      links: [
        { label: t('footer.linkVision'), href: '/vision' },
        { label: t('footer.linkPlatform'), href: '/platform' },
        { label: t('footer.linkPlansPricing'), href: '/plans' },
        { label: t('footer.linkAiCompanion'), href: '/ai' },
        { label: t('footer.linkGames'), href: '/games' },
      ],
    },
    {
      title: t('footer.colResources'),
      links: [
        { label: t('footer.linkDevelopmentHub'), href: '/roadmap#development' },
        { label: t('footer.linkRoadmap'), href: '/roadmap' },
        { label: t('footer.linkFaq'), href: '/faq' },
        { label: t('footer.linkStatus'), href: '/status' },
        { label: t('footer.linkBlog'), href: '/blog' },
        { label: t('footer.linkDesignSuggestions'), href: '/suggestions' },
        { label: t('footer.linkLibrary'), href: '#library' },
      ],
    },
    {
      title: t('footer.colDevelopers'),
      links: [
        { label: t('footer.linkDeveloperPortal'), href: '/developers' },
        { label: t('footer.linkApiReference'), href: '/developers#reference' },
        { label: t('footer.linkWebhooks'), href: '/developers#webhooks' },
        { label: t('footer.linkApiKeysApps'), href: '/developers#keys' },
        { label: t('footer.linkPlatformChangelog'), href: '/developers#changelog' },
      ],
    },
    {
      title: t('footer.colCompany'),
      links: [
        { label: 'Support Us', href: '/support-us' },
        { label: t('footer.linkPressKit'), href: '/press' },
        { label: t('footer.linkDownloadLogo'), href: '/#logo-download' },
        { label: t('footer.linkWhatsNew'), href: '#whats-new' },
        { label: t('footer.linkContact'), href: '/contact' },
        { label: t('footer.linkPrivacyPolicy'), href: '/privacy' },
        { label: t('footer.linkCookies'), href: '/cookies' },
        { label: t('footer.linkTerms'), href: '/terms' },
        { label: t('footer.linkAccessibility'), href: '/accessibility' },
      ],
    },
  ]
}

const SOCIALS = [
  { label: 'Join Discord', platform: 'Discord', icon: Discord, href: DISCORD_INVITE_URL },
  { label: 'View GitHub', platform: 'GitHub', icon: GitBranch },
  { label: 'Follow on Instagram', platform: 'Instagram', icon: Instagram, href: INSTAGRAM_PROFILE_URL },
  { label: 'Follow on X', platform: 'X', icon: Twitter, href: X_PROFILE_URL },
]

const FACTS = [
  'Browser-first gaming',
  'AI-powered discovery',
  'Unified progression',
  'Community-driven',
]

const TRUST_BADGES = [
  { label: 'SSL Secured', icon: Lock },
  { label: 'GDPR Compliant', icon: ShieldCheck },
  { label: 'PCI DSS Ready', icon: CheckCircle2 },
  { label: 'Verified Platform', icon: Building2 },
  { label: 'Developer API: Sandbox Live', icon: Code2, href: '/developers' },
]

function useSupportChannels(t: (key: TranslationKey) => string) {
  return [
    { label: t('footer.supportCenter'), detail: t('footer.supportCenterDetail'), icon: Headphones, href: '/support' },
    { label: t('footer.trackTicket'), detail: t('footer.trackTicketDetail'), icon: Ticket, href: '/support#open-ticket' },
    { label: t('footer.linkDeveloperPortal'), detail: t('footer.developerPortalDetail'), icon: Code2, href: '/developers' },
    { label: t('footer.liveChat'), detail: t('footer.liveChatDetail'), icon: MessageCircle },
  ]
}

/* ---------------- Generic dropdown selector (region/language, currency) ---------------- */
function FooterSelect<T extends { code: string; label: string }>({
  icon: Icon,
  label,
  options,
  value,
  onChange,
  renderOption,
  align = 'left',
}: {
  icon: typeof Globe
  label: string
  options: T[]
  value: T
  onChange: (option: T) => void
  renderOption?: (option: T) => string
  align?: 'left' | 'right'
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDocClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        title={label}
        className="group inline-flex h-10 items-center gap-2 rounded-xl border border-[rgb(var(--accent-1)/0.18)] bg-background/45 px-3.5 text-sm text-muted-foreground backdrop-blur transition-colors hover:border-[rgb(var(--accent-1)/0.5)] hover:text-foreground"
      >
        <Icon className="size-4 text-[rgb(var(--accent-1))]" />
        <span className="font-medium text-foreground">{renderOption ? renderOption(value) : value.label}</span>
        <ChevronDown className={cn('size-3.5 transition-transform', open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              'glass absolute bottom-full z-30 mb-2 max-h-64 w-56 overflow-y-auto rounded-2xl border border-border/70 p-1.5 shadow-xl',
              align === 'right' ? 'right-0' : 'left-0',
            )}
          >
            {options.map((option) => (
              <li key={option.code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={option.code === value.code}
                  onClick={() => {
                    onChange(option)
                    setOpen(false)
                  }}
                  className={cn(
                    'flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm transition-colors hover:bg-[rgb(var(--accent-1)/0.1)]',
                    option.code === value.code ? 'text-[rgb(var(--accent-1))]' : 'text-foreground',
                  )}
                >
                  {renderOption ? renderOption(option) : option.label}
                  {option.code === value.code && <Check className="size-3.5 shrink-0" />}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ---------------- Newsletter signup ---------------- */
function NewsletterSignup() {
  const { notify } = useNotifications()
  const { t } = useLocale()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle')
  const [error, setError] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (status === 'loading') return
    const trimmed = email.trim()
    if (!/^\S+@\S+\.\S+$/.test(trimmed)) {
      setError('Enter a valid email address')
      return
    }
    setError('')
    setStatus('loading')
    window.setTimeout(() => {
      try {
        const list = JSON.parse(localStorage.getItem('gh-newsletter') || '[]')
        list.push({ email: trimmed, at: new Date().toISOString() })
        localStorage.setItem('gh-newsletter', JSON.stringify(list))
      } catch {
        /* ignore */
      }
      notify({
        title: t('footer.subscribed'),
        body: `You're now subscribed to Gaming Horizon updates at ${trimmed}. Expect release notes, new feature drops, and the occasional community highlight — never more than a few emails a month, and you can unsubscribe from any newsletter email at any time.`,
        icon: 'waitlist',
        toast: false,
      })
      setStatus('done')
    }, 500)
  }

  return (
    <div>
      <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Mail className="size-4 text-[rgb(var(--accent-1))]" />
        {t('footer.stayInLoop')}
      </p>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
        {t('footer.stayInLoopDesc')}
      </p>

      <AnimatePresence mode="wait">
        {status === 'done' ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-center gap-2 rounded-xl border border-[rgb(var(--accent-1)/0.3)] bg-[rgb(var(--accent-1)/0.08)] px-3.5 py-2.5 text-sm font-medium text-foreground"
          >
            <CheckCircle2 className="size-4 shrink-0 text-[rgb(var(--accent-1))]" />
            {t('footer.subscribed')}
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            onSubmit={submit}
            noValidate
            className="mt-4"
          >
            <div className="flex flex-col gap-2 sm:flex-row">
              <label htmlFor="footer-newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="footer-newsletter-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder={t('footer.emailPlaceholder')}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (error) setError('')
                }}
                className="h-11 w-full min-w-0 rounded-xl border border-input bg-background/60 px-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-[rgb(var(--accent-1))] sm:max-w-[220px]"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'footer-newsletter-error' : undefined}
              />
              <GhButton type="submit" size="md" magnetic={false} disabled={status === 'loading'} className="shrink-0">
                {status === 'loading' ? <Loader2 className="size-4 animate-spin" /> : t('footer.subscribe')}
              </GhButton>
            </div>
            {error && (
              <p id="footer-newsletter-error" className="mt-2 text-xs font-medium text-red-500">
                {error}
              </p>
            )}
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}

function BackToTop() {
  const [visible, setVisible] = useState(false)
  const systemReducedMotion = useReducedMotion()
  const { settings } = useSettings()
  const reduceMotion = systemReducedMotion || settings.motionMode !== 'full'
  const { bottomOverlayOffset } = useUI()
  const footerLift = useFooterClearance(18, 0.42)
  const footerDocked = useFooterPresence('0px 0px -30% 0px')

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > Math.max(720, window.innerHeight * 0.72))
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          aria-label="Back to top"
          title="Back to top"
          tabIndex={footerDocked ? -1 : 0}
          initial={{ opacity: 0, y: 12, scale: 0.92 }}
          animate={{ opacity: footerDocked ? 0 : 1, y: footerDocked ? 8 : 0, scale: footerDocked ? 0.96 : 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.92 }}
          whileHover={reduceMotion ? undefined : { y: -3 }}
          whileTap={reduceMotion ? undefined : { scale: 0.94 }}
          onClick={() => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' })}
          className="gh-floating-control group fixed left-4 z-[120] flex h-11 select-none items-center gap-1.5 whitespace-nowrap rounded-2xl px-4 text-sm font-medium text-foreground transition-[bottom] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] sm:left-5"
          style={{
            bottom: `calc(1rem + env(safe-area-inset-bottom) + ${Math.max(bottomOverlayOffset, footerLift)}px)`,
            pointerEvents: footerDocked ? 'none' : 'auto',
          }}
        >
          <ChevronUp className="size-4 transition-transform group-hover:-translate-y-0.5" />
          Back to top
        </motion.button>
      )}
    </AnimatePresence>
  )
}

export function Footer() {
  const { openComingSoon, openWaitlist, openSupport, reopenWhatsNew, openSocialConfirm } = useUI()
  const { language, currency, setLanguage, setCurrency, t } = useLocale()
  const COLS = useFooterColumns(t)
  const SUPPORT_CHANNELS = useSupportChannels(t)
  const [libraryOpen, setLibraryOpen] = useState(false)

  return (
    <>
      <footer id="site-footer" className="relative mt-20 overflow-hidden border-t border-[rgb(var(--accent-1)/0.12)]">
        {/* Quiet atmospheric layer */}
        <div className="pointer-events-none absolute inset-0 opacity-70">
          <motion.div
            className="absolute -left-32 top-12 size-80 rounded-full bg-[rgb(var(--accent-1)/0.10)] blur-3xl"
            animate={{ x: [0, 42, 0], y: [0, -18, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute -right-24 bottom-0 size-72 rounded-full bg-[rgb(var(--accent-2)/0.08)] blur-3xl"
            animate={{ x: [0, -36, 0], y: [0, 20, 0] }}
            transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
          />
          {[12, 26, 41, 58, 73, 87].map((left, i) => (
            <motion.span
              key={left}
              className="absolute size-1 rounded-full bg-[rgb(var(--accent-1)/0.35)]"
              style={{ left: `${left}%`, top: `${20 + (i % 3) * 24}%` }}
              animate={{ y: [0, -9, 0], opacity: [0.2, 0.55, 0.2] }}
              transition={{ duration: 5 + i, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}
        </div>

        <div className="relative mx-auto max-w-[1540px] px-4 py-14 sm:py-16 lg:px-8">


          {/* Final conversion CTA */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="glass relative mb-12 overflow-hidden rounded-3xl border border-[rgb(var(--accent-1)/0.22)] px-6 py-9 text-center sm:px-10 sm:py-11"
          >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[rgb(var(--accent-1)/0.10)] via-transparent to-[rgb(var(--accent-2)/0.08)]" />
            <div className="relative">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[rgb(var(--accent-1))]">
                {t('footer.ctaEyebrow')}
              </p>
              <h2 className="font-heading text-balance text-2xl font-semibold sm:text-4xl">
                {t('footer.ctaHeadline')}
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                {t('footer.ctaBody')}
              </p>
              <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <GhButton onClick={openWaitlist} size="lg">
                  {t('footer.joinWaitlist')} <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </GhButton>
                <GhButton href="/roadmap" variant="glass" size="lg">
                  {t('footer.viewRoadmap')}
                </GhButton>
                <GhButton onClick={() => openSupport()} variant="outline" size="lg">
                  <Heart className="size-4" /> Support Us
                </GhButton>
              </div>
            </div>
          </motion.section>

          <motion.div
            className="grid gap-10 lg:grid-cols-[1.15fr_0.72fr_0.72fr_0.72fr_0.72fr_1fr] lg:gap-8 xl:gap-12"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div>
              <Logo />
              <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
                Gaming Horizon exists to give browser games the premium home they have never had: instant access, thoughtful discovery, one persistent identity, and progress that stays meaningful across experiences.
              </p>

              <ul className="mt-5 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2 lg:grid-cols-1">
                {FACTS.map((fact) => (
                  <li key={fact} className="flex items-center gap-2">
                    <span className="flex size-5 items-center justify-center rounded-full bg-[rgb(var(--accent-1)/0.10)] text-[rgb(var(--accent-1))]">
                      <Check className="size-3" />
                    </span>
                    {fact}
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex flex-wrap gap-3">
                {SOCIALS.map((social, index) => (
                  <motion.a
                    key={social.label}
                    href={social.href ?? '#'}
                    target={social.href ? '_blank' : undefined}
                    rel={social.href ? 'noopener noreferrer' : undefined}
                    onClick={(event) => {
                      if (!social.href) {
                        event.preventDefault()
                        openComingSoon(social.label, { platform: social.platform, isSocial: true })
                        return
                      }
                      const platform = getSocialPlatformByHref(social.href)
                      if (platform) {
                        event.preventDefault()
                        openSocialConfirm(platform)
                      }
                    }}
                    aria-label={social.label}
                    title={social.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -3, scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="group relative flex size-12 items-center justify-center rounded-xl border border-[rgb(var(--accent-1)/0.18)] bg-background/45 text-muted-foreground shadow-sm backdrop-blur transition-all hover:border-[rgb(var(--accent-1)/0.5)] hover:text-[rgb(var(--accent-1))] hover:shadow-[0_10px_30px_-12px_rgb(var(--accent-1)/0.8)]"
                  >
                    <social.icon className="size-[18px]" />
                    <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md border border-border/70 bg-background/95 px-2.5 py-1 text-[11px] font-medium text-foreground opacity-0 shadow-md transition-opacity group-hover:opacity-100">
                      {social.label}
                    </span>
                  </motion.a>
                ))}
              </div>
            </div>

            {COLS.map((col) => (
              <div key={col.title}>
                <p className="text-sm font-semibold text-foreground">{col.title}</p>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      {link.href === '#whats-new' ? (
                        <button
                          type="button"
                          onClick={reopenWhatsNew}
                          className="group relative inline-flex text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <span className="transition-transform group-hover:translate-x-0.5">{link.label}</span>
                          <span className="absolute -bottom-1 left-0 h-px w-0 bg-gradient-to-r from-[rgb(var(--accent-1))] to-transparent transition-all duration-300 group-hover:w-full" />
                        </button>
                      ) : link.href === '#library' ? (
                        <button
                          type="button"
                          onClick={() => setLibraryOpen(true)}
                          className="group relative inline-flex text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <span className="transition-transform group-hover:translate-x-0.5">{link.label}</span>
                          <span className="absolute -bottom-1 left-0 h-px w-0 bg-gradient-to-r from-[rgb(var(--accent-1))] to-transparent transition-all duration-300 group-hover:w-full" />
                        </button>
                      ) : (
                        <Link
                          href={link.href}
                          className="group relative inline-flex text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <span className="transition-transform group-hover:translate-x-0.5">{link.label}</span>
                          <span className="absolute -bottom-1 left-0 h-px w-0 bg-gradient-to-r from-[rgb(var(--accent-1))] to-transparent transition-all duration-300 group-hover:w-full" />
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div>
              <NewsletterSignup />

              <div className="mt-7">
                <p className="text-sm font-semibold text-foreground">{t('footer.customerSupport')}</p>
                <ul className="mt-4 space-y-2.5">
                  {SUPPORT_CHANNELS.map((channel) => (
                    <li key={channel.label}>
                      {channel.href ? (
                        <Link
                          href={channel.href}
                          className="group flex items-start gap-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <channel.icon className="mt-0.5 size-4 shrink-0 text-[rgb(var(--accent-1))]" />
                          <span>
                            <span className="block font-medium text-foreground/90 group-hover:text-foreground">{channel.label}</span>
                            <span className="block text-xs text-muted-foreground">{channel.detail}</span>
                          </span>
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openComingSoon(channel.label)}
                          className="group flex items-start gap-2.5 text-left text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <channel.icon className="mt-0.5 size-4 shrink-0 text-[rgb(var(--accent-1))]" />
                          <span>
                            <span className="block font-medium text-foreground/90 group-hover:text-foreground">{channel.label}</span>
                            <span className="block text-xs text-muted-foreground">{channel.detail}</span>
                          </span>
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>

          <FooterLiveStatus />

          {/* Region, currency, trust & compliance */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10 flex flex-col gap-6 border-t border-border/60 pt-8"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <FooterSelect
                  icon={Globe}
                  label={t('footer.regionLanguage')}
                  options={LANGUAGES}
                  value={language}
                  onChange={setLanguage}
                  renderOption={(o) => `${o.label} · ${o.region}`}
                />
                <FooterSelect
                  icon={Wallet}
                  label={t('footer.currency')}
                  options={CURRENCIES}
                  value={currency}
                  onChange={setCurrency}
                  renderOption={(o) => `${o.symbol} ${o.code}`}
                  align="right"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {TRUST_BADGES.map((badge) =>
                  'href' in badge && badge.href ? (
                    <Link
                      key={badge.label}
                      href={badge.href}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[rgb(var(--accent-1)/0.3)] bg-[rgb(var(--accent-1)/0.08)] px-3 py-1.5 text-xs font-medium text-foreground/90 backdrop-blur transition-colors hover:border-[rgb(var(--accent-1)/0.6)]"
                    >
                      <span className="relative flex size-1.5">
                        <span className="absolute inline-flex size-full animate-ping rounded-full bg-[rgb(var(--accent-3))] opacity-60" />
                        <span className="relative inline-flex size-1.5 rounded-full bg-[rgb(var(--accent-3))]" />
                      </span>
                      <badge.icon className="size-3.5 text-[rgb(var(--accent-1))]" />
                      {badge.label}
                    </Link>
                  ) : (
                    <span
                      key={badge.label}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[rgb(var(--accent-1)/0.18)] bg-background/45 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur"
                    >
                      <badge.icon className="size-3.5 text-[rgb(var(--accent-1))]" />
                      {badge.label}
                    </span>
                  ),
                )}
              </div>
            </div>

            <p className="max-w-3xl text-xs leading-relaxed text-muted-foreground/80">
              {t('footer.localisationNotice')}
            </p>

            <div className="flex flex-col gap-1.5 text-xs leading-relaxed text-muted-foreground/80">
              <p className="flex max-w-3xl items-start gap-2">
                <Building2 className="mt-0.5 size-3.5 shrink-0 text-[rgb(var(--accent-1))]" />
                {t('footer.betaNotice')}
              </p>
              <p className="flex items-center gap-1.5 pl-5 text-muted-foreground/70">
                <MapPin className="size-3.5 shrink-0" /> {t('footer.remoteFirst')}
              </p>
            </div>
          </motion.div>

          <div className="mt-8 flex flex-col gap-4 border-t border-border/60 pt-6 text-xs text-muted-foreground md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-medium text-foreground">© {new Date().getFullYear()} THE Gaming Horizon</p>
              <p className="mt-1">{t('footer.copyrightTagline')}</p>
            </div>
            <p className="text-left md:text-right">
              <Link href="/privacy" className="underline-offset-4 hover:underline">{t('footer.privacy')}</Link> <span aria-hidden="true">•</span> <Link href="/cookies" className="underline-offset-4 hover:underline">{t('footer.cookies')}</Link> <span aria-hidden="true">•</span> Built with Next.js • Supabase • Framer Motion • Tailwind CSS
            </p>
          </div>
        </div>
      </footer>
      <BackToTop />
      <FestivalLibraryModal open={libraryOpen} onClose={() => setLibraryOpen(false)} />
    </>
  )
}
