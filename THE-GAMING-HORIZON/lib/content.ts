import { BETA_DATE, LAUNCH_DATE } from '@/lib/data'

/* --------------------------- Milestone helpers -------------------------- */

export interface MilestoneRef {
  key: 'beta' | 'launch'
  label: string
  date: string
  short: string
}

export const MILESTONES: MilestoneRef[] = [
  {
    key: 'beta',
    label: 'Public Beta',
    date: BETA_DATE,
    short: 'January 1, 2027',
  },
  {
    key: 'launch',
    label: 'Official Platform Launch',
    date: LAUNCH_DATE,
    short: 'March 1, 2028',
  },
]

// Returns the next milestone that has not yet passed (falls back to launch).
export function nextMilestone(now = Date.now()): MilestoneRef {
  return (
    MILESTONES.find((m) => new Date(m.date).getTime() > now) ??
    MILESTONES[MILESTONES.length - 1]
  )
}

/* ----------------------------- Status page ------------------------------ */

export interface ServiceStatus {
  name: string
  state: 'Development' | 'Planned'
  note: string
}

export const SERVICE_STATUS: ServiceStatus[] = [
  { name: 'Authentication', state: 'Development', note: 'Provider abstraction under active build.' },
  { name: 'AI Services', state: 'Development', note: 'Recommendation engine prototype online internally.' },
  { name: 'CDN', state: 'Development', note: 'Edge topology and cache rules being finalised.' },
  { name: 'Browser Streaming', state: 'Development', note: 'Instant-play delivery pipeline in progress.' },
  { name: 'Recommendations', state: 'Development', note: 'Signals and ranking model iterating.' },
  { name: 'Community Services', state: 'Planned', note: 'Scoped for the post-beta phase.' },
  { name: 'Profiles', state: 'Development', note: 'Identity model spec complete, build underway.' },
  { name: 'Waitlist', state: 'Development', note: 'Frontend live; backend intake wiring next.' },
  { name: 'Public API', state: 'Planned', note: 'Contract drafting ahead of developer platform.' },
  { name: 'Infrastructure', state: 'Development', note: 'Provisioning and observability being stood up.' },
  { name: 'Beta Services', state: 'Development', note: 'Staging environment and launch checklist forming.' },
]

/* ------------------------------ Press kit ------------------------------- */

export const BRAND_COLORS = [
  { name: 'Aurora Indigo', value: '#6d5efc' },
  { name: 'Signal Cyan', value: '#22d3ee' },
  { name: 'Deep Navy', value: '#0a0e1f' },
  { name: 'Void Black', value: '#05060d' },
  { name: 'Mist', value: '#c7ccdb' },
]

export const PRESS_FACTS = [
  { label: 'Product', value: 'Premium browser gaming ecosystem' },
  { label: 'Stage', value: 'Pre-launch · in active development' },
  { label: 'Public Beta', value: 'January 1, 2027 · 12:01 AM IST' },
  { label: 'Official Launch', value: 'March 1, 2028 · 12:01 AM IST' },
  { label: 'Platform', value: 'Browser-first · no downloads' },
]

/* ------------------------------- Legal ---------------------------------- */

export interface LegalPage {
  slug: string
  title: string
  eyebrow: string
  intro: string
  sections: { heading: string; body: string }[]
}

const draftNote =
  'This document is a pre-launch draft published for transparency. The finalised, legally binding version will be released before the Public Beta on January 1, 2027.'

export const LEGAL_PAGES: Record<string, LegalPage> = {
  privacy: {
    slug: 'privacy',
    title: 'Privacy Policy',
    eyebrow: 'Legal',
    intro:
      'Privacy is a founding principle of Gaming Horizon. Here is how we intend to handle your data.',
    sections: [
      { heading: 'Data we will collect', body: 'Only what is needed to run your profile, progression and recommendations — such as account details you provide and gameplay activity you generate. We are designing for data minimisation from day one.' },
      { heading: 'How recommendations work', body: 'The AI Companion is built to personalise using the minimum signals required, with clear controls over what is used. We will never sell your personal data.' },
      { heading: 'Your controls', body: 'You will be able to view, export and delete your data, and opt out of personalisation at any time.' },
      { heading: 'Draft notice', body: draftNote },
    ],
  },
  cookies: {
    slug: 'cookies',
    title: 'Cookies & Browser Storage',
    eyebrow: 'Privacy',
    intro: 'A clear explanation of the small amount of browser storage used by this pre-launch website.',
    sections: [
      { heading: 'Essential storage only', body: 'Gaming Horizon currently uses local browser storage only for essential preferences, such as your theme, motion settings, dismissed notices and customization choices. These settings help the site remember how you want it to behave.' },
      { heading: 'No advertising trackers', body: 'This announcement website does not use advertising cookies, cross-site tracking pixels or third-party profiles. We do not sell personal information or follow your activity across other websites.' },
      { heading: 'Optional personalization', body: 'Future platform personalization will be optional and clearly explained. You will be able to understand which signals shape recommendations and turn those signals off without losing basic access.' },
      { heading: 'Your control', body: 'You can clear stored site preferences through your browser at any time. Account data controls, including access, export and deletion, are planned before Public Beta.' },
      { heading: 'Draft notice', body: draftNote },
    ],
  },
  terms: {
    slug: 'terms',
    title: 'Terms of Service',
    eyebrow: 'Legal',
    intro:
      'These terms will govern your use of Gaming Horizon once the platform is live.',
    sections: [
      { heading: 'Using the platform', body: 'Gaming Horizon is provided for personal, non-commercial play. You agree to use it lawfully and respectfully toward other players.' },
      { heading: 'Accounts', body: 'You are responsible for activity on your account. Authentication becomes functional closer to the Public Beta.' },
      { heading: 'Content and conduct', body: 'Community features are subject to guidelines designed to keep Gaming Horizon safe and welcoming.' },
      { heading: 'Draft notice', body: draftNote },
    ],
  },
  accessibility: {
    slug: 'accessibility',
    title: 'Accessibility Statement',
    eyebrow: 'Commitment',
    intro:
      'Gaming Horizon is being built to be usable by everyone, on any device.',
    sections: [
      { heading: 'Standards', body: 'We are targeting WCAG 2.2 AA as a baseline across the entire experience, including keyboard navigation and screen-reader support.' },
      { heading: 'Motion and visuals', body: 'A full reduced-motion mode, adjustable density and font scaling are available in the Customization Studio today.' },
      { heading: 'Ongoing work', body: 'Accessibility is tracked as a first-class item on our development dashboard and audited each sprint.' },
      { heading: 'Draft notice', body: draftNote },
    ],
  },
}

export const LEGAL_SLUGS = Object.keys(LEGAL_PAGES)
