'use client'

import { useCallback, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { LocaleProvider } from '@/components/providers/locale-provider'
import { SettingsProvider } from '@/components/providers/settings-provider'
import { GatewaySettingsProvider } from '@/components/providers/gateway-settings-provider'
import { UIProvider, useUI } from '@/components/providers/ui-provider'
import { ExperienceProvider } from '@/components/providers/experience-provider'
import { AuthProvider } from '@/components/providers/auth-provider'
import { NotificationsProvider } from '@/components/providers/notifications-provider'
import { MusicProvider } from '@/components/providers/music-provider'
import { Navigation } from '@/components/navigation'
import { AnnouncementBanner } from '@/components/announcement-banner'
import { Footer } from '@/components/footer'
import { LoadingScreen } from '@/components/loading-screen'
import { HashFocusManager } from '@/components/hash-focus-manager'


const AnimatedBackground = dynamic(
  () => import('@/components/animated-background').then((m) => m.AnimatedBackground),
  { ssr: false },
)
const CommandPalette = dynamic(
  () => import('@/components/command-palette').then((m) => m.CommandPalette),
  { ssr: false },
)

const CustomCursor = dynamic(
  () => import('@/components/custom-cursor').then((m) => m.CustomCursor),
  { ssr: false },
)
const CustomizationStudio = dynamic(
  () => import('@/components/customization-studio').then((m) => m.CustomizationStudio),
  { ssr: false },
)
const WaitlistModal = dynamic(
  () => import('@/components/waitlist-modal').then((m) => m.WaitlistModal),
  { ssr: false },
)
const ComingSoonModal = dynamic(
  () => import('@/components/coming-soon-modal').then((m) => m.ComingSoonModal),
  { ssr: false },
)
const SupportUsModal = dynamic(
  () => import('@/components/support-us-modal').then((m) => m.SupportUsModal),
  { ssr: false },
)
const SocialConfirmModal = dynamic(
  () => import('@/components/social-confirm-modal').then((m) => m.SocialConfirmModal),
  { ssr: false },
)
const ExperienceOnboarding = dynamic(
  () => import('@/components/experience-onboarding').then((m) => m.ExperienceOnboarding),
  { ssr: false },
)
const WelcomeMember = dynamic(
  () => import('@/components/welcome-member').then((m) => m.WelcomeMember),
  { ssr: false },
)
const WhatsNewModal = dynamic(
  () => import('@/components/whats-new-modal').then((m) => m.WhatsNewModal),
  { ssr: false },
)
const MiniPlayer = dynamic(
  () => import('@/components/music/mini-player').then((m) => m.MiniPlayer),
  { ssr: false },
)
const FestivalImagePopup = dynamic(
  () => import('@/components/festival-image-popup').then((m) => m.FestivalImagePopup),
  { ssr: false },
)


function GatewayController() {
  const router = useRouter()
  const pathname = usePathname()
  const {
    openWaitlist,
    gatewayOpenRequest,
    setGatewayActive,
    activateMainSite,
  } = useUI()

  const activateHomepage = useCallback(() => {
    if (pathname !== '/') return
    // The Gateway has already unmounted and restored scrolling before this
    // callback runs. Two frames allow the homepage to paint before overlays
    // such as the welcome message are permitted to mount.
    window.requestAnimationFrame(() => window.requestAnimationFrame(activateMainSite))
  }, [activateMainSite, pathname])

  return (
    <LoadingScreen
      reopenRequest={gatewayOpenRequest}
      onStateChange={setGatewayActive}
      onSiteReady={activateHomepage}
      onEnter={activateHomepage}
      onJoinWaitlist={openWaitlist}
      onLearnBeta={() => router.push('/beta')}
    />
  )
}

function MainSiteOverlays() {
  const pathname = usePathname()
  const { gatewayActive, mainSiteActivationId } = useUI()

  // The welcome experience is a homepage-only main-site overlay. It is not
  // mounted beneath the Gateway and therefore cannot consume time, capture
  // focus, or announce itself while any Gateway view is active.
  if (gatewayActive || pathname !== '/' || mainSiteActivationId === 0) return null
  return <WelcomeMember activationId={mainSiteActivationId} />
}

function WhatsNewController() {
  // Stays mounted on every route (not just "/") so the footer's "What's
  // New" link can reopen it from anywhere. It no longer opens itself
  // automatically on first visit — see WhatsNewModal.
  const { whatsNewOpenRequest } = useUI()
  return <WhatsNewModal reopenRequest={whatsNewOpenRequest} />
}

export function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const authExperienceRoute =
    pathname === '/signin' ||
    pathname === '/signup' ||
    pathname === '/sign-in' ||
    pathname === '/update-password'

  return (
    <LocaleProvider>
    <SettingsProvider>
      <AuthProvider>
      <NotificationsProvider>
      <MusicProvider>
      <UIProvider>
        <ExperienceProvider>
        <GatewaySettingsProvider>
          <GatewayController />
        </GatewaySettingsProvider>
        <FestivalImagePopup />
        <div data-gh-site-layer className="contents">
          <AnimatedBackground />
          <CustomCursor />
          <div className="gh-viewport-frame relative z-10">
            <AnnouncementBanner />
            <Navigation />
            <HashFocusManager />
            <main className="relative min-h-screen">{children}</main>
            {!authExperienceRoute && <Footer />}
          </div>
          <CustomizationStudio />
          <CommandPalette />
          <WaitlistModal />
          <ComingSoonModal />
          <SupportUsModal />
          <SocialConfirmModal />
          <MainSiteOverlays />
          <WhatsNewController />
          <ExperienceOnboarding />
          <MiniPlayer />
        </div>
        </ExperienceProvider>
      </UIProvider>
      </MusicProvider>
      </NotificationsProvider>
      </AuthProvider>
    </SettingsProvider>
    </LocaleProvider>
  )
}
