'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  LockKeyhole,
  Menu,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from 'lucide-react'
import { Logo } from '@/components/ui/logo'
import { GhButton } from '@/components/ui/primitives'
import { NAV_LINKS } from '@/lib/data'
import { useUI } from '@/components/providers/ui-provider'
import { useSettings } from '@/components/providers/settings-provider'
import { useAuth } from '@/components/providers/auth-provider'
import { useLocale } from '@/components/providers/locale-provider'
import { AvatarFrame } from '@/components/ui/avatar-frame'
import type { TranslationKey } from '@/lib/i18n'
import { cn } from '@/lib/utils'

// lib/data.ts NAV_LINKS hrefs mapped to their translation keys, so the
// visible nav labels follow the selected site language.
const NAV_LABEL_KEYS: Record<string, TranslationKey> = {
  '/': 'nav.home',
  '/vision': 'nav.vision',
  '/platform': 'nav.platform',
  '/ai': 'nav.ai',
  '/games': 'nav.games',
  '/music': 'nav.music',
  '/roadmap': 'nav.roadmap',
  '/beta': 'nav.beta',
  '/blog': 'nav.blog',
  '/faq': 'nav.faq',
}

const BETA_LABEL = 'Beta Preview — Closed. Opens January 1, 2027'
const SEARCH_EVENT = 'gh:open-command-palette'
const CONTROL_CLASS = 'min-h-10 rounded-xl border outline-none transition-[transform,background-color,border-color,color,box-shadow] duration-150 focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-1)/0.72)] focus-visible:ring-offset-2 focus-visible:ring-offset-background active:translate-y-px'
function isLinkActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function Navigation() {
  const pathname = usePathname()
  const { openWaitlist, openStudio, studioOpen, reopenGateway } = useUI()
  const { isDefault, settings } = useSettings()
  const { user, loading: authLoading, displayName, initials, avatarUrl, avatarAnimation, taskbarPreferences } = useAuth()
  const { t } = useLocale()
  const navLabel = (href: string, fallback: string) => {
    const key = NAV_LABEL_KEYS[href]
    return key ? t(key) : fallback
  }
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [shortcut, setShortcut] = useState('Ctrl K')
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const platform = (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform || navigator.platform || ''
    setShortcut(/mac|iphone|ipad|ipod/i.test(platform) ? '⌘K' : 'Ctrl K')
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useLayoutEffect(() => {
    const node = navRef.current
    if (!node) return
    const publish = () => {
      document.documentElement.style.setProperty('--nav-h', `${Math.ceil(node.getBoundingClientRect().height + 8)}px`)
    }
    publish()
    const observer = new ResizeObserver(publish)
    observer.observe(node)
    window.addEventListener('resize', publish)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', publish)
    }
  }, [scrolled])

  const openSearch = () => window.dispatchEvent(new CustomEvent(SEARCH_EVENT))

  const handleHomeNavigation = (event: MouseEvent<HTMLAnchorElement>) => {
    setOpen(false)
    if (pathname !== '/') return
    event.preventDefault()
    if (window.location.hash) window.history.pushState(window.history.state, '', '/')
    window.scrollTo({ top: 0, behavior: settings.motionMode === 'full' ? 'smooth' : 'auto' })
  }

  const openCustomization = () => openStudio()
  const visibleNavLinks = NAV_LINKS.filter((link) => link.href === '/' || taskbarPreferences.visibleLinks.includes(link.href))

  return (
    <header className="fixed inset-x-0 z-[100] flex justify-center px-3 pt-2 transition-[top] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] sm:px-4" style={{ top: 'var(--banner-h, 0px)' }}>
      <nav
        ref={navRef}
        aria-label="Main navigation"
        className={cn(
          'flex w-full max-w-[1540px] select-none items-center justify-between gap-2 rounded-2xl border px-2.5 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] sm:px-3',
          scrolled ? 'glass-navbar glow-sm min-h-[50px] border-border/70 py-0' : 'glass-navbar min-h-[56px] border-border/45 py-1',
        )}
      >
        <Link href="/" onClick={handleHomeNavigation} aria-label="Gaming Horizon home" className={cn('shrink-0 origin-left pl-1 transition-transform duration-300 gh-nav-logo-wordmark max-[1279px]:[&_.overflow-hidden]:hidden', scrolled ? 'scale-[0.86]' : 'scale-[0.93] xl:scale-100')}>
          <Logo reveal />
        </Link>

        <div className="hidden min-w-0 items-center gap-0 min-[1120px]:flex">
          {visibleNavLinks.map((link) => {
            const active = isLinkActive(pathname, link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={link.href === '/' ? handleHomeNavigation : undefined}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  // Padding + font-size scale continuously with viewport width
                  // (clamp) instead of jumping at a few fixed breakpoints, so
                  // as the row gets tighter every link shrinks in lockstep and
                  // none of them ever crowd or overlap their neighbours.
                  'group relative flex min-h-10 items-center rounded-lg px-[clamp(4px,0.45vw,10px)] text-[length:clamp(10px,0.85vw,13px)] transition-colors min-[1480px]:min-h-11',
                  active ? 'bg-[rgb(var(--accent-1)/0.07)] font-bold text-foreground' : 'font-medium text-muted-foreground hover:bg-muted/35 hover:text-foreground',
                )}
              >
                <span>{navLabel(link.href, link.label)}</span>
                <span aria-hidden="true" className={cn(
                  'absolute bottom-1 left-2 right-2 h-0.5 origin-center rounded-full bg-[rgb(var(--accent-1))] transition-transform duration-200 ease-out',
                  active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100',
                )} />
              </Link>
            )
          })}

        </div>

        <div className="hidden shrink-0 items-center gap-1 min-[1120px]:flex min-[1320px]:gap-1.5" aria-label="Navigation utilities and account actions">
          <span aria-hidden="true" className="mx-1 h-6 w-px bg-border/75" />

          {taskbarPreferences.showBeta && <Link
            href="/beta-preview"
            aria-label={BETA_LABEL}
            title={BETA_LABEL}
            className={cn(CONTROL_CLASS, 'group flex min-w-[76px] items-center gap-1.5 border-[rgb(var(--accent-1)/0.24)] bg-background/48 px-2 text-left shadow-[0_10px_30px_-25px_rgb(var(--accent-1)/0.52)] backdrop-blur-md hover:-translate-y-px hover:border-[rgb(var(--accent-1)/0.48)] hover:bg-[rgb(var(--accent-1)/0.07)] min-[1280px]:min-w-[112px] min-[1480px]:min-w-[126px] min-[1440px]:gap-2 min-[1440px]:px-2.5')}
          >
            <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-[rgb(var(--accent-1)/0.10)] text-[rgb(var(--accent-1))]">
              <LockKeyhole className="size-3.5" />
            </span>
            <span className="min-w-0 leading-none">
              <span className="block whitespace-nowrap text-[10px] font-bold text-foreground min-[1280px]:text-[11px]"><span className="min-[1280px]:hidden">Beta</span><span className="hidden min-[1280px]:inline">Beta Preview</span></span>
              <span className="mt-1 hidden whitespace-nowrap text-[8px] font-medium tracking-[0.01em] text-muted-foreground min-[1440px]:block">Closed</span>
            </span>
          </Link>}

          {taskbarPreferences.showSearch && <button
            type="button"
            onClick={openSearch}
            aria-label={`Search Gaming Horizon (${shortcut})`}
            title={`Search Gaming Horizon (${shortcut})`}
            className={cn(CONTROL_CLASS, 'group flex items-center gap-1.5 border-border/70 bg-background/40 px-2.5 text-muted-foreground hover:border-[rgb(var(--accent-1)/0.36)] hover:bg-muted/70 hover:text-foreground min-[1360px]:gap-2 min-[1360px]:px-3')}
          >
            <Search className="size-4 shrink-0" />
            <span className="whitespace-nowrap text-[11px] font-semibold min-[1280px]:text-xs">Search</span>
            <kbd className="hidden items-center justify-center whitespace-nowrap rounded-md border border-border/80 bg-muted/70 px-1.5 py-[3px] text-[9px] font-bold leading-none tracking-wide text-foreground/80 min-[1440px]:inline-flex">
              {shortcut}
            </kbd>
          </button>}

          {taskbarPreferences.showCustomize && <button
            type="button"
            onClick={openCustomization}
            data-customize-trigger="navigation"
            aria-label="Customize website"
            title="Customize website"
            aria-haspopup="dialog"
            aria-expanded={studioOpen}
            className={cn(CONTROL_CLASS, 'group relative flex items-center gap-1.5 border-border/70 bg-background/40 px-2.5 text-muted-foreground hover:border-[rgb(var(--accent-1)/0.42)] hover:bg-[rgb(var(--accent-1)/0.08)] hover:text-foreground min-[1360px]:gap-2 min-[1360px]:px-3')}
          >
            <SlidersHorizontal className="size-4 shrink-0" />
            <span className="whitespace-nowrap text-[10px] font-semibold min-[1280px]:text-[11px]">Customize</span>
            {!isDefault && <span className="pointer-events-none absolute -right-0.5 -top-0.5 size-2 rounded-full border border-background bg-[rgb(var(--accent-3))]" aria-hidden />}
          </button>}

          {authLoading ? (
            <div
              aria-label="Checking account status"
              className={cn(CONTROL_CLASS, 'flex min-w-[78px] items-center gap-2 border-transparent px-2.5 min-[1280px]:min-w-[96px]')}
            >
              <span className="size-7 animate-pulse rounded-lg bg-muted/80" />
              <span className="hidden h-2.5 w-10 animate-pulse rounded-full bg-muted/80 min-[1280px]:block" />
            </div>
          ) : user ? (
            <Link
              href="/account"
              aria-label={`Open ${displayName}'s account`}
              title={`Signed in as ${user.email || displayName}`}
              className={cn(
                CONTROL_CLASS,
                'group flex max-w-[150px] items-center gap-2 border-[rgb(var(--accent-1)/0.22)] bg-[rgb(var(--accent-1)/0.06)] px-2 text-[10px] font-semibold text-foreground hover:-translate-y-px hover:border-[rgb(var(--accent-1)/0.45)] hover:bg-[rgb(var(--accent-1)/0.11)] min-[1280px]:max-w-[180px] min-[1280px]:px-2.5 min-[1280px]:text-[11px]',
              )}
            >
              <AvatarFrame animation={avatarAnimation} rounded="rounded-lg">
                <span className="grid size-7 shrink-0 place-items-center overflow-hidden rounded-lg bg-[rgb(var(--accent-1))] text-[10px] font-bold text-[var(--accent-button-fg)] shadow-[0_8px_22px_-14px_rgb(var(--accent-1))]">{avatarUrl ? <img src={avatarUrl} alt="" className="size-full object-cover" /> : initials}</span>
              </AvatarFrame>
              <span className="hidden min-w-0 min-[1280px]:block">
                <span className="block truncate">{displayName}</span>
                <span className="mt-0.5 block text-[8px] font-medium text-muted-foreground">{t('nav.account')}</span>
              </span>
            </Link>
          ) : (
            <Link
              href="/signin"
              className={cn(CONTROL_CLASS, 'group relative flex items-center border-transparent px-2.5 text-[11px] font-semibold text-muted-foreground hover:border-border/55 hover:bg-[rgb(var(--accent-1)/0.06)] hover:text-foreground min-[1280px]:px-3 min-[1280px]:text-xs min-[1440px]:text-[13px]')}
            >
              <span className="whitespace-nowrap">{t('nav.signIn')}</span>
            </Link>
          )}
          {taskbarPreferences.showWaitlist && <GhButton size="sm" onClick={openWaitlist} magnetic={false} className="group !h-10 !rounded-xl !px-2.5 !text-[11px] !shadow-none active:!translate-y-px min-[1280px]:!px-3 min-[1280px]:!text-xs min-[1440px]:!px-3.5 min-[1440px]:!text-sm">
            <span className="whitespace-nowrap">{t('nav.joinWaitlist')}</span> <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
          </GhButton>}
        </div>

        <div className="flex items-center gap-1.5 min-[1120px]:hidden">
          {taskbarPreferences.showSearch && <button
            type="button"
            onClick={openSearch}
            aria-label="Search Gaming Horizon"
            title="Search Gaming Horizon"
            className="glass grid size-11 place-items-center rounded-xl outline-none transition-colors hover:bg-muted/65 focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-1)/0.72)]"
          >
            <Search className="size-5" />
          </button>}
          <button className="glass flex size-11 items-center justify-center rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-1)/0.72)]" onClick={() => setOpen((current) => !current)} aria-label="Toggle menu" aria-expanded={open}>
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div className={cn('glass-strong absolute inset-x-3 max-h-[calc(100dvh-var(--banner-h,0px)-82px)] overflow-y-auto rounded-2xl p-3 min-[1120px]:hidden sm:inset-x-4', scrolled ? 'top-[56px]' : 'top-[62px]')} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="grid grid-cols-2 gap-1">
              {visibleNavLinks.map((link) => {
                const active = isLinkActive(pathname, link.href)
                return (
                  <Link key={link.href} href={link.href} onClick={link.href === '/' ? handleHomeNavigation : undefined} aria-current={active ? 'page' : undefined} className={cn('relative min-h-11 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-muted/60 hover:text-foreground', active ? 'bg-[rgb(var(--accent-1)/0.08)] font-semibold text-foreground' : 'text-muted-foreground')}>
                    {navLabel(link.href, link.label)}
                    <span aria-hidden="true" className={cn('absolute bottom-1 left-3 right-3 h-0.5 rounded-full bg-[rgb(var(--accent-1))] transition-transform', active ? 'scale-x-100' : 'scale-x-0')} />
                  </Link>
                )
              })}
            </div>

            <section className="mt-3 border-t border-border pt-3" aria-labelledby="mobile-utilities-title">
              <p id="mobile-utilities-title" className="px-1 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Utilities</p>
              <div className="mt-2 grid gap-2">
                {taskbarPreferences.showBeta && <Link href="/beta-preview" aria-label={BETA_LABEL} title={BETA_LABEL} className="flex min-h-14 items-center gap-3 rounded-xl border border-[rgb(var(--accent-1)/0.24)] bg-[rgb(var(--accent-1)/0.06)] px-3 text-left outline-none transition-colors hover:border-[rgb(var(--accent-1)/0.48)] hover:bg-[rgb(var(--accent-1)/0.1)] focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-1)/0.72)]">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[rgb(var(--accent-1)/0.12)] text-[rgb(var(--accent-1))]"><LockKeyhole className="size-4" /></span>
                  <span className="min-w-0 flex-1"><span className="block text-sm font-bold text-foreground">Beta Preview</span><span className="mt-1 block text-[10px] leading-4 text-muted-foreground">Closed · Opens Jan 1, 2027</span></span>
                </Link>}
                {taskbarPreferences.showSearch && <button type="button" onClick={openSearch} className="flex min-h-12 items-center gap-3 rounded-xl border border-border/70 px-3 text-sm font-semibold text-foreground outline-none transition-colors hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-1)/0.72)]">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-muted/70 text-[rgb(var(--accent-1))]"><Search className="size-4" /></span>
                  Search Gaming Horizon
                </button>}
                {taskbarPreferences.showCustomize && <button
                  type="button"
                  onClick={openCustomization}
                  data-customize-trigger="navigation"
                  aria-label="Customize website"
                  title="Customize website"
                  aria-haspopup="dialog"
                  aria-expanded={studioOpen}
                  className="relative flex min-h-12 items-center gap-3 rounded-xl border border-border/70 px-3 text-sm font-semibold text-foreground outline-none transition-colors hover:border-[rgb(var(--accent-1)/0.42)] hover:bg-[rgb(var(--accent-1)/0.08)] focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-1)/0.72)]"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[rgb(var(--accent-1)/0.1)] text-[rgb(var(--accent-1))]"><SlidersHorizontal className="size-4" /></span>
                  Customize website
                  {!isDefault && <span className="ml-auto size-2 rounded-full bg-[rgb(var(--accent-3))]" aria-label="Custom settings active" />}
                </button>}
                <button
                  type="button"
                  onClick={() => { setOpen(false); reopenGateway() }}
                  className="flex min-h-12 items-center gap-3 rounded-xl border border-border/70 px-3 text-sm font-semibold text-foreground outline-none transition-colors hover:border-[rgb(var(--accent-1)/0.42)] hover:bg-[rgb(var(--accent-1)/0.08)] focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-1)/0.72)]"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[rgb(var(--accent-1)/0.1)] text-[rgb(var(--accent-1))]"><Sparkles className="size-4" /></span>
                  Reopen Entry Gateway
                </button>
              </div>
            </section>

            <div className="mt-3 flex gap-2 border-t border-border pt-3">
              {authLoading ? (
                <div className="flex min-h-10 flex-1 items-center justify-center rounded-xl border border-border bg-muted/30 text-xs font-semibold text-muted-foreground">
                  Checking account…
                </div>
              ) : user ? (
                <Link
                  href="/account"
                  onClick={() => setOpen(false)}
                  className="flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-[rgb(var(--accent-1)/0.28)] bg-[rgb(var(--accent-1)/0.08)] px-3 text-sm font-semibold text-foreground transition-colors hover:bg-[rgb(var(--accent-1)/0.13)]"
                >
                  <AvatarFrame animation={avatarAnimation} rounded="rounded-lg">
                    <span className="grid size-7 place-items-center overflow-hidden rounded-lg bg-[rgb(var(--accent-1))] text-[10px] font-bold text-[var(--accent-button-fg)]">{avatarUrl ? <img src={avatarUrl} alt="" className="size-full object-cover" /> : initials}</span>
                  </AvatarFrame>
                  <span className="max-w-[110px] truncate">{displayName}</span>
                </Link>
              ) : (
                <GhButton href="/signin" variant="glass" size="sm" magnetic={false} className="flex-1">{t('nav.signIn')}</GhButton>
              )}
              {taskbarPreferences.showWaitlist && <GhButton size="sm" magnetic={false} className="group flex-1" onClick={() => { setOpen(false); openWaitlist() }}>{t('nav.joinWaitlist')} <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" /></GhButton>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
