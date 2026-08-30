import { Hero, HeroProductPreview } from '@/components/sections/hero'
import { AtAGlance } from '@/components/sections/at-a-glance'
import { WhatIsIt } from '@/components/sections/what-is-it'
import { UniverseMap } from '@/components/sections/universe-map'
import { Vision } from '@/components/sections/vision'
import { HowItWorks } from '@/components/sections/how-it-works'
import { Platform } from '@/components/sections/platform'
import { Capabilities } from '@/components/sections/capabilities'
import { WhoItsFor } from '@/components/sections/who-its-for'
import { AiCompanion } from '@/components/sections/ai-companion'
import { AiChatSection } from '@/components/sections/ai-chat-section'
import { DashboardPreview } from '@/components/sections/dashboard-preview'
import { GamesPreview } from '@/components/sections/games-preview'
import { WhyBrowser } from '@/components/sections/why-browser'
import { PlayerJourney } from '@/components/sections/player-journey'
import { Development } from '@/components/sections/development'
import { RoadmapPreview } from '@/components/sections/roadmap-preview'
import { ProjectJourney } from '@/components/sections/project-journey'
import { BetaLaunch } from '@/components/sections/beta-launch'
import { BetaProgram } from '@/components/sections/beta-program'
import { FaqPreview } from '@/components/sections/faq-preview'
import { LatestUpdates } from '@/components/sections/latest-updates'
import { GameRequestCta } from '@/components/sections/game-request-cta'
import { DesignSuggestionsCta } from '@/components/sections/design-suggestions-cta'
import { LogoDownload } from '@/components/sections/logo-download'
import { SectionDivider } from '@/components/ui/section-divider'
import { PrivacyCookies } from '@/components/sections/privacy-cookies'
import { ExperienceCta } from '@/components/sections/experience-cta'
import { Pricing } from '@/components/sections/pricing'
import { SupportUs } from '@/components/sections/support-us'

export default function HomePage() {
  return (
    <>
      <Hero />
      <HeroProductPreview />
      <SectionDivider variant="beam" />
      <AtAGlance />
      <ExperienceCta />
      <SectionDivider variant="line" />
      <WhatIsIt />
      <SectionDivider variant="orbit" />
      <UniverseMap />
      <SectionDivider variant="particles" />
      <Vision />
      <SectionDivider variant="line" />
      <HowItWorks />
      <SectionDivider variant="line" />
      <Platform />
      <SectionDivider variant="beam" />
      <Pricing />
      <SectionDivider variant="orbit" />
      <Capabilities />
      <SectionDivider variant="line" />
      <WhoItsFor />
      <SectionDivider variant="orbit" />
      <AiCompanion />
      <SectionDivider variant="line" />
      <AiChatSection />
      <SectionDivider variant="particles" />
      <DashboardPreview />
      <SectionDivider variant="orbit" />
      <GamesPreview />
      <SectionDivider variant="line" />
      <WhyBrowser />
      <SectionDivider variant="particles" />
      <PlayerJourney />
      <SectionDivider variant="line" />
      <Development />
      <SectionDivider variant="orbit" />
      <RoadmapPreview />
      <SectionDivider variant="line" />
      <LatestUpdates />
      <SectionDivider variant="particles" />
      <GameRequestCta />
      <SectionDivider variant="line" />
      <DesignSuggestionsCta />
      <SectionDivider variant="line" />
      <LogoDownload />
      <SectionDivider variant="line" />
      <ProjectJourney />
      <SectionDivider variant="beam" />
      <BetaLaunch />
      <SectionDivider variant="line" />
      <BetaProgram />
      <SectionDivider variant="beam" />
      <SupportUs />
      <SectionDivider variant="line" />
      <FaqPreview />
      <SectionDivider variant="line" />
      <PrivacyCookies />
    </>
  )
}
