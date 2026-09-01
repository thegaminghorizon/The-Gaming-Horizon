export const INDIA_TIME_ZONE = 'Asia/Kolkata'

export type MilestoneManualStatus =
  | 'completed'
  | 'inProgress'
  | 'upcoming'
  | 'delayed'
  | 'paused'
  | 'cancelled'
  | null

export type MilestoneCompletionBehavior =
  | 'dateActivated'
  | 'scheduledReached'
  | 'manualVerification'

export type RoadmapState =
  | 'Completed'
  | 'Scheduled Reached'
  | 'In Progress'
  | 'Upcoming'
  | 'Major Launch'
  | 'Delayed'
  | 'Paused'
  | 'Cancelled'

export interface Milestone {
  id: string
  title: string
  when: string
  scheduledAt: string
  timezone: typeof INDIA_TIME_ZONE
  description: string
  /** Optional start time for milestones that have a real working window. */
  startsAt?: string
  /** Manual reality always wins over the schedule-derived state. */
  manualStatus: MilestoneManualStatus
  completionBehavior: MilestoneCompletionBehavior
  kind: 'development' | 'program' | 'launch'
}

export interface ResolvedMilestone extends Milestone {
  state: RoadmapState
  statusLabel: string
  accessibleStatus: string
  scheduledReached: boolean
  verifiedCompletion: boolean
  targetMs: number
}

const IST = '+05:30'

export const ROADMAP_MILESTONES: Milestone[] = [
  {
    id: 'project-foundation',
    title: 'Project Foundation',
    when: 'September 2026',
    scheduledAt: `2026-09-30T23:59:00${IST}`,
    timezone: INDIA_TIME_ZONE,
    description: 'Vision locked, team assembled, and core principles for the ecosystem defined.',
    manualStatus: 'completed',
    completionBehavior: 'manualVerification',
    kind: 'development',
  },
  {
    id: 'architecture',
    title: 'Architecture',
    when: 'September – October 2026',
    startsAt: `2026-09-01T00:00:00${IST}`,
    scheduledAt: `2026-10-31T23:59:00${IST}`,
    timezone: INDIA_TIME_ZONE,
    description: 'System design for edge delivery, authentication, data, and the AI Companion pipeline.',
    manualStatus: 'inProgress',
    completionBehavior: 'manualVerification',
    kind: 'development',
  },
  {
    id: 'design-system',
    title: 'Design System',
    when: 'October 2026',
    startsAt: `2026-10-01T00:00:00${IST}`,
    scheduledAt: `2026-10-31T23:59:00${IST}`,
    timezone: INDIA_TIME_ZONE,
    description: 'The premium visual language, motion rules, accessibility baseline, and component library.',
    manualStatus: 'inProgress',
    completionBehavior: 'manualVerification',
    kind: 'development',
  },
  {
    id: 'frontend-development',
    title: 'Frontend Development',
    when: 'November – December 2026',
    startsAt: `2026-11-01T00:00:00${IST}`,
    scheduledAt: `2026-12-20T23:59:00${IST}`,
    timezone: INDIA_TIME_ZONE,
    description: 'Building the player-facing experience: discovery, play, profiles, progression, and social surfaces.',
    manualStatus: null,
    completionBehavior: 'manualVerification',
    kind: 'development',
  },
  {
    id: 'backend-infrastructure',
    title: 'Backend Infrastructure',
    when: 'December 2026',
    startsAt: `2026-12-01T00:00:00${IST}`,
    scheduledAt: `2026-12-23T23:59:00${IST}`,
    timezone: INDIA_TIME_ZONE,
    description: 'Services for accounts, progression, leaderboards, cloud saves, and recommendations.',
    manualStatus: null,
    completionBehavior: 'manualVerification',
    kind: 'development',
  },
  {
    id: 'internal-qa',
    title: 'Internal QA',
    when: 'December 2026',
    startsAt: `2026-12-15T00:00:00${IST}`,
    scheduledAt: `2026-12-31T23:59:00${IST}`,
    timezone: INDIA_TIME_ZONE,
    description: 'Hardening, browser compatibility, performance passes, and security review before public exposure.',
    manualStatus: null,
    completionBehavior: 'manualVerification',
    kind: 'development',
  },
  {
    id: 'public-beta',
    title: 'Public Beta',
    when: '1 January 2027 · 12:01 AM IST',
    scheduledAt: `2027-01-01T00:01:00${IST}`,
    timezone: INDIA_TIME_ZONE,
    description: 'The first public milestone: a real, usable slice of Gaming Horizon.',
    manualStatus: null,
    completionBehavior: 'dateActivated',
    kind: 'launch',
  },
  {
    id: 'feedback-portal-opens',
    title: 'Feedback Portal Opens',
    when: '15 January 2027',
    scheduledAt: `2027-01-15T00:00:00${IST}`,
    timezone: INDIA_TIME_ZONE,
    description: 'Structured feedback, bug reports, feature voting, and surveys go live.',
    manualStatus: null,
    completionBehavior: 'dateActivated',
    kind: 'program',
  },
  {
    id: 'community-testing',
    title: 'Community Testing',
    when: 'January – November 2027',
    startsAt: `2027-01-15T00:00:00${IST}`,
    scheduledAt: `2027-11-30T23:59:00${IST}`,
    timezone: INDIA_TIME_ZONE,
    description: 'Iterating with players through new modules, tuning, fixes, and an expanding game library.',
    manualStatus: null,
    completionBehavior: 'scheduledReached',
    kind: 'program',
  },
  {
    id: 'feedback-portal-closes',
    title: 'Feedback Portal Closes',
    when: '30 November 2027 · 11:59 PM IST',
    scheduledAt: `2027-11-30T23:59:00${IST}`,
    timezone: INDIA_TIME_ZONE,
    description: 'Feedback intake closes as the project moves toward feature completeness and stability.',
    manualStatus: null,
    completionBehavior: 'dateActivated',
    kind: 'program',
  },
  {
    id: 'feature-freeze',
    title: 'Feature Freeze',
    when: 'December 2027',
    startsAt: `2027-12-01T00:00:00${IST}`,
    scheduledAt: `2027-12-31T23:59:00${IST}`,
    timezone: INDIA_TIME_ZONE,
    description: 'Scope locks and the focus shifts entirely to stability, accessibility, and polish.',
    manualStatus: null,
    completionBehavior: 'scheduledReached',
    kind: 'development',
  },
  {
    id: 'release-candidate',
    title: 'Release Candidate',
    when: 'January – February 2028',
    startsAt: `2028-01-01T00:00:00${IST}`,
    scheduledAt: `2028-02-29T23:59:00${IST}`,
    timezone: INDIA_TIME_ZONE,
    description: 'Near-final builds are validated across supported browsers, devices, and accessibility modes.',
    manualStatus: null,
    completionBehavior: 'scheduledReached',
    kind: 'development',
  },
  {
    id: 'official-launch',
    title: 'Official Launch',
    when: '1 March 2028 · 12:01 AM IST',
    scheduledAt: `2028-03-01T00:01:00${IST}`,
    timezone: INDIA_TIME_ZONE,
    description: 'The complete Gaming Horizon ecosystem arrives for everyone.',
    manualStatus: null,
    completionBehavior: 'dateActivated',
    kind: 'launch',
  },
]

const manualState: Record<Exclude<MilestoneManualStatus, null>, RoadmapState> = {
  completed: 'Completed',
  inProgress: 'In Progress',
  upcoming: 'Upcoming',
  delayed: 'Delayed',
  paused: 'Paused',
  cancelled: 'Cancelled',
}

export function resolveMilestone(milestone: Milestone, now = Date.now()): ResolvedMilestone {
  const targetMs = new Date(milestone.scheduledAt).getTime()
  const startsMs = milestone.startsAt ? new Date(milestone.startsAt).getTime() : null
  const scheduledReached = Number.isFinite(targetMs) && now >= targetMs

  if (milestone.manualStatus) {
    const state = manualState[milestone.manualStatus]
    const verifiedCompletion = milestone.manualStatus === 'completed'
    return {
      ...milestone,
      state,
      statusLabel: state,
      accessibleStatus: verifiedCompletion
        ? `${milestone.title}: verified completed.`
        : `${milestone.title}: manually marked ${state.toLowerCase()}.`,
      scheduledReached,
      verifiedCompletion,
      targetMs,
    }
  }

  if (scheduledReached) {
    if (milestone.completionBehavior === 'dateActivated') {
      return {
        ...milestone,
        state: 'Completed',
        statusLabel: 'Completed',
        accessibleStatus: `${milestone.title}: scheduled launch or program date reached.`,
        scheduledReached: true,
        verifiedCompletion: true,
        targetMs,
      }
    }

    return {
      ...milestone,
      state: 'Scheduled Reached',
      statusLabel: 'Scheduled milestone reached',
      accessibleStatus: `${milestone.title}: scheduled milestone reached; engineering completion has not been manually verified.`,
      scheduledReached: true,
      verifiedCompletion: false,
      targetMs,
    }
  }

  if (startsMs !== null && Number.isFinite(startsMs) && now >= startsMs) {
    return {
      ...milestone,
      state: 'In Progress',
      statusLabel: 'In Progress',
      accessibleStatus: `${milestone.title}: scheduled work window is in progress.`,
      scheduledReached: false,
      verifiedCompletion: false,
      targetMs,
    }
  }

  const state: RoadmapState = milestone.kind === 'launch' ? 'Major Launch' : 'Upcoming'
  return {
    ...milestone,
    state,
    statusLabel: state === 'Major Launch' ? 'Scheduled launch' : 'Upcoming',
    accessibleStatus: `${milestone.title}: ${state === 'Major Launch' ? 'scheduled launch' : 'upcoming'}.`,
    scheduledReached: false,
    verifiedCompletion: false,
    targetMs,
  }
}

export function resolveMilestones(milestones: Milestone[], now = Date.now()) {
  return milestones.map((milestone) => resolveMilestone(milestone, now))
}

export const BETA_TIMELINE_IDS = [
  'architecture',
  'public-beta',
  'feedback-portal-opens',
  'community-testing',
  'feedback-portal-closes',
  'official-launch',
] as const

export const BETA_TIMELINE_MILESTONES = BETA_TIMELINE_IDS.map((id) => {
  const milestone = ROADMAP_MILESTONES.find((item) => item.id === id)
  if (!milestone) throw new Error(`Missing beta timeline milestone: ${id}`)
  return milestone
})
