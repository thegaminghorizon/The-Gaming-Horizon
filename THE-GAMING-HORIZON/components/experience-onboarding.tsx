'use client'

import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Brain, Check, ChevronLeft, ChevronRight, RotateCcw, Sparkles, X } from 'lucide-react'
import { useUI } from '@/components/providers/ui-provider'
import { EMPTY_EXPERIENCE, useExperience, type ExperienceProfile } from '@/components/providers/experience-provider'
import { ACCENTS, BACKGROUND_MODES, BACKGROUND_STYLES, getAccentTones, useSettings, type AccentKey, type BackgroundMode, type CursorStyle, type Density, type PerformancePreset } from '@/components/providers/settings-provider'
import { cn } from '@/lib/utils'

const GENRES = ['Action','FPS','Racing','Strategy','Puzzle','RPG','Adventure','Horror','Sports','Casual','Indie','Sandbox','Simulation','Multiplayer','Co-op']
const SESSION = ['Under 15 minutes','Around 30 minutes','Around 1 hour','Multiple hours']
const PLAY = ['Solo','Friends','Co-op','Competitive','Doesn\'t Matter']
const DIFFICULTY = ['Relaxed','Balanced','Challenging','Adaptive']
const CONTROLLER = ['Prefer controller','Keyboard & mouse','Touch controls','No preference']
const PRIORITIES = ['Quick sessions','Progression','Exploration','Competition','Relaxation']
const DEVICES = ['Desktop','Laptop','Tablet','Mobile','Multiple devices']
const BROWSERS = ['Chrome','Edge','Firefox','Safari','Brave','Other']
const AI = ['Trending Games','Hidden Gems','Competitive Titles','Relaxing Experiences','Short Sessions','Multiplayer','Controller-Friendly Games','Low-End Device Performance','Achievement Hunting','Daily Challenges']

function profileLabel(p: ExperienceProfile) {
  if (p.sessionLength === 'Under 15 minutes') return 'Quick-Session Player'
  if (p.playStyle === 'Competitive' || p.priorities.includes('Competition')) return 'Competitive Explorer'
  if (p.playStyle === 'Friends' || p.playStyle === 'Co-op') return 'Social Challenger'
  return 'Relaxed Discoverer'
}

const Choice = memo(function Choice({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return <button type="button" aria-pressed={selected} onClick={onClick} className={cn('min-h-11 rounded-xl border px-3 py-2 text-left text-sm transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-1))]', selected ? 'border-[rgb(var(--accent-1))] bg-[rgb(var(--accent-1)/0.14)] font-semibold text-foreground shadow-[0_0_18px_rgb(var(--accent-1)/0.12)]' : 'border-border bg-background/45 text-muted-foreground hover:border-[rgb(var(--accent-1)/0.45)] hover:text-foreground')}><span className="flex items-center justify-between gap-2">{label}{selected && <Check className="size-4 text-[rgb(var(--accent-1))]" />}</span></button>
})

const LivePreview = memo(function LivePreview({ profile }: { profile: ExperienceProfile }) {
  const label = profileLabel(profile)
  const chips = [...profile.genres.slice(0, 3), ...profile.aiPriorities.slice(0, 2)]
  return <div className="glass-strong sticky top-0 rounded-3xl p-5 md:p-6">
    <div className="flex items-center gap-3"><div className="grid size-11 place-items-center rounded-2xl bg-[rgb(var(--accent-1)/0.16)]"><Brain className="size-5 text-[rgb(var(--accent-1))]" /></div><div><p className="text-xs uppercase tracking-[.18em] text-muted-foreground">Live beta preview</p><h3 className="font-heading text-lg font-bold">{label}</h3></div></div>
    <div className="mt-5 flex flex-wrap gap-2">{chips.length ? chips.map(x => <span key={x} className="rounded-full border border-[rgb(var(--accent-1)/0.3)] bg-[rgb(var(--accent-1)/0.09)] px-3 py-1 text-xs">{x}</span>) : <span className="text-sm text-muted-foreground">Your choices will shape this preview.</span>}</div>
    <div className="mt-5 space-y-3">{['Recommended for you','Because you enjoy','Optimized for'].map((title, i) => <div key={title} className="rounded-2xl border border-border/70 bg-background/45 p-3"><p className="text-xs text-muted-foreground">{title}</p><p className="mt-1 text-sm font-semibold">{i===0 ? (profile.aiPriorities[0] || 'Balanced discoveries') : i===1 ? (profile.genres.slice(0,2).join(' + ') || 'Your favorite genres') : `${profile.browser || 'Your browser'} on ${profile.device || 'your device'}`}</p></div>)}</div>
  </div>
})

export function ExperienceOnboarding() {
  const { experienceOpen, closeExperience, openWaitlist } = useUI()
  const { saved, save, reset } = useExperience()
  const { settings, update } = useSettings()
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState<ExperienceProfile>(saved)
  const closeRef = useRef<HTMLButtonElement>(null)
  const trigger = useRef<HTMLElement | null>(null)

  useEffect(() => { if (experienceOpen) { trigger.current = document.activeElement as HTMLElement; setDraft(saved); setTimeout(()=>closeRef.current?.focus(), 0); document.body.style.overflow='hidden' } else { document.body.style.overflow=''; trigger.current?.focus() } return () => { document.body.style.overflow='' } }, [experienceOpen, saved])
  useEffect(() => { if (!experienceOpen) return; const onKey=(e:KeyboardEvent)=>{ if(e.key==='Escape') closeExperience() }; window.addEventListener('keydown',onKey); return()=>window.removeEventListener('keydown',onKey)}, [experienceOpen, closeExperience])

  const toggle = (key: 'genres'|'priorities'|'aiPriorities', value: string) => setDraft(d => ({...d, [key]: d[key].includes(value) ? d[key].filter(x=>x!==value) : [...d[key], value]}))
  const TOTAL_STEPS = 7
  const progress = Math.round((step / (TOTAL_STEPS - 1)) * 100)
  const reduced = settings.reducedMotion || settings.performance === 'battery'
  const summary = useMemo(() => profileLabel(draft), [draft])

  const saveNow = (completed = false) => save({...draft, completed})
  const content = [
    <div key="welcome" className="space-y-5"><div className="grid size-14 place-items-center rounded-2xl bg-[rgb(var(--accent-1)/0.15)]"><Sparkles className="size-7 text-[rgb(var(--accent-1))]" /></div><div><h2 className="font-heading text-2xl font-bold sm:text-3xl">Create Your Gaming Horizon Experience</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">Shape a lightweight preview of how Gaming Horizon may recommend games during Public Beta. Your choices are stored only in this browser for now and may later sync after you create an account.</p><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">You can also choose your visual identity here. These appearance choices use the existing Customization Studio system, so they update the whole website instantly and remain editable later.</p></div></div>,
    <VisualIdentity settings={settings} update={update} key="visual" />,
    <Step title="Choose your favorite genres" subtitle="Select everything that feels like your kind of game." options={GENRES} selected={draft.genres} onToggle={v=>toggle('genres',v)} key="genres" />,
    <div key="play" className="space-y-6"><Single title="Typical session length" options={SESSION} value={draft.sessionLength} onChange={v=>setDraft({...draft,sessionLength:v})}/><Single title="How do you usually play?" options={PLAY} value={draft.playStyle} onChange={v=>setDraft({...draft,playStyle:v})}/><Single title="Preferred difficulty" options={DIFFICULTY} value={draft.difficulty} onChange={v=>setDraft({...draft,difficulty:v})}/><Single title="Controller preference" options={CONTROLLER} value={draft.controller} onChange={v=>setDraft({...draft,controller:v})}/><Step title="What matters most?" options={PRIORITIES} selected={draft.priorities} onToggle={v=>toggle('priorities',v)} /></div>,
    <div key="device" className="space-y-7"><Single title="Your main device" options={DEVICES} value={draft.device} onChange={v=>setDraft({...draft,device:v})}/><Single title="Your main browser" options={BROWSERS} value={draft.browser} onChange={v=>setDraft({...draft,browser:v})}/></div>,
    <Step key="ai" title="What should the future AI Companion prioritize?" subtitle="These choices only shape this preview; AI features are planned for Public Beta." options={AI} selected={draft.aiPriorities} onToggle={v=>toggle('aiPriorities',v)} />,
    <div key="summary" className="space-y-5"><div><p className="text-xs uppercase tracking-[.2em] text-[rgb(var(--accent-1))]">Preview profile</p><h2 className="font-heading mt-2 text-3xl font-bold">{summary}</h2><p className="mt-2 text-sm text-muted-foreground">This is a preview profile, not permanent account data.</p></div><div className="grid gap-3 sm:grid-cols-2">{[['Favorite genres',draft.genres.join(', ')||'Not selected'],['Session',draft.sessionLength||'Not selected'],['Play style',draft.playStyle||'Not selected'],['Device',draft.device||'Not selected'],['Browser',draft.browser||'Not selected'],['AI priorities',draft.aiPriorities.join(', ')||'Not selected'],['Theme',settings.theme],['Accent',getAccentTones(settings).label],['Background style',BACKGROUND_STYLES.find((item)=>item.key===settings.backgroundStyle)?.label||'Default Horizon'],['Atmosphere',BACKGROUND_MODES.find((item)=>item.key===settings.backgroundMode)?.label||'Calm'],['Cursor',settings.cursor],['Performance',settings.performance],['UI density',settings.density]].map(([k,v])=><div key={k} className="rounded-2xl border border-border bg-background/45 p-4"><p className="text-xs text-muted-foreground">{k}</p><p className="mt-1 text-sm font-semibold capitalize">{v}</p></div>)}</div><div className="rounded-3xl border border-[rgb(var(--accent-1)/0.35)] bg-[rgb(var(--accent-1)/0.08)] p-5"><h3 className="font-heading text-lg font-bold">Your Gaming Horizon Beta Preview</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">You will likely enjoy {draft.genres.slice(0,2).join(' and ') || 'a balanced mix of browser games'}. Recommendations will prioritize {draft.aiPriorities[0]?.toLowerCase() || 'personalized discoveries'} and be optimized for {draft.browser || 'your browser'} on {draft.device || 'your device'}.</p></div></div>
  ]

  return <AnimatePresence>{experienceOpen && <div className="fixed inset-0 z-[260] flex items-end justify-center md:items-center md:p-6"><motion.button aria-label="Close personalization" className="absolute inset-0 bg-black/70" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={closeExperience}/><motion.section role="dialog" aria-modal="true" aria-label="Create Your Gaming Horizon Experience" className="glass-panel-large relative z-10 flex h-[100dvh] w-full max-w-6xl flex-col overflow-hidden bg-background/96 md:h-[min(760px,92vh)] md:rounded-[2rem]" initial={{opacity:0,y:reduced?0:24,scale:reduced?1:.98}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:reduced?0:18,scale:reduced?1:.99}} transition={{duration:reduced?.12:.24}}>
    <header className="flex items-center gap-4 border-b border-border px-4 py-3 sm:px-6"><div className="min-w-0 flex-1"><div className="flex items-center justify-between text-xs text-muted-foreground"><span>Step {Math.min(step+1,TOTAL_STEPS)} of {TOTAL_STEPS}</span><span>{Math.max(1,TOTAL_STEPS-step)} min remaining</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"><motion.div className="h-full bg-[rgb(var(--accent-1))]" animate={{width:`${progress}%`}} transition={{duration:reduced?0:.25}} /></div></div><button ref={closeRef} onClick={closeExperience} className="grid size-11 place-items-center rounded-xl hover:bg-muted" aria-label="Close"><X className="size-5"/></button></header>
    <div className="grid min-h-0 flex-1 overflow-y-auto md:grid-cols-[1.2fr_.8fr] md:overflow-hidden"><div className="min-w-0 overflow-y-auto p-5 sm:p-7"><AnimatePresence mode="wait"><motion.div key={step} initial={{opacity:0,x:reduced?0:16}} animate={{opacity:1,x:0}} exit={{opacity:0,x:reduced?0:-12}} transition={{duration:reduced?.1:.22}}>{content[step]}</motion.div></AnimatePresence></div><aside className="border-t border-border p-4 md:overflow-y-auto md:border-l md:border-t-0 md:p-6"><LivePreview profile={draft}/></aside></div>
    <footer className="flex flex-wrap items-center gap-2 border-t border-border px-4 py-3 sm:px-6"><button onClick={()=>{saveNow(false);closeExperience()}} className="min-h-11 rounded-xl px-3 text-sm text-muted-foreground hover:bg-muted">Continue Later</button>{saved.savedAt && <button onClick={()=>{reset();setDraft(EMPTY_EXPERIENCE);setStep(0)}} className="min-h-11 rounded-xl px-3 text-sm text-muted-foreground hover:bg-muted"><RotateCcw className="mr-1 inline size-4"/>Reset</button>}<div className="ml-auto flex gap-2">{step>0&&<button onClick={()=>setStep(s=>s-1)} className="min-h-11 rounded-xl border border-border px-4 text-sm"><ChevronLeft className="mr-1 inline size-4"/>Back</button>}{step<TOTAL_STEPS-1?<button onClick={()=>setStep(s=>s+1)} className="min-h-11 rounded-xl bg-[rgb(var(--accent-1))] px-5 text-sm font-semibold text-white">Continue<ChevronRight className="ml-1 inline size-4"/></button>:<><button onClick={()=>{saveNow(true);closeExperience()}} className="min-h-11 rounded-xl border border-border px-4 text-sm">Save Locally</button><button onClick={()=>{saveNow(true);closeExperience();openWaitlist()}} className="min-h-11 rounded-xl bg-[rgb(var(--accent-1))] px-5 text-sm font-semibold text-white">Join Waitlist</button></>}</div></footer>
  </motion.section></div>}</AnimatePresence>
}


type VisualSettings = ReturnType<typeof useSettings>['settings']
type UpdateSetting = ReturnType<typeof useSettings>['update']

function VisualIdentity({ settings, update }: { settings: VisualSettings; update: UpdateSetting }) {
  const cursors: { key: CursorStyle; label: string }[] = [
    { key: 'default', label: 'Default' },
    { key: 'horizonDot', label: 'Horizon Dot' },
    { key: 'neonRing', label: 'Neon Ring' },
    { key: 'minimalArrow', label: 'Minimal Arrow' },
    { key: 'pixelPointer', label: 'Pixel Pointer' },
    { key: 'orbital', label: 'Orbital Cursor' },
    { key: 'cometTrail', label: 'Comet Trail' },
  ]
  const performance: { key: PerformancePreset; label: string }[] = [
    { key: 'battery', label: 'Battery Saver' },
    { key: 'balanced', label: 'Balanced' },
    { key: 'high', label: 'High Fidelity' },
  ]
  const densities: { key: Density; label: string }[] = [
    { key: 'compact', label: 'Compact' },
    { key: 'cozy', label: 'Cozy' },
    { key: 'comfortable', label: 'Comfortable' },
  ]

  return <div className="space-y-7">
    <div><h2 className="font-heading text-2xl font-bold">Choose your visual identity</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">These controls are connected to the existing Customization Studio and preview live across the website.</p></div>
    <div className="rounded-2xl border border-[rgb(var(--accent-1)/0.18)] bg-[rgb(var(--accent-1)/0.055)] p-4"><p className="text-sm font-semibold">Light, dark, or system</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Gaming Horizon supports a polished light experience and a purpose-built premium dark palette through Customize.</p></div>
    <div><h3 className="text-sm font-semibold">Accent preset</h3><div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">{(Object.entries(ACCENTS) as [AccentKey, (typeof ACCENTS)[AccentKey]][]).filter(([key])=>key!=='custom').map(([key,accent])=><button key={key} type="button" aria-pressed={settings.accent===key} onClick={()=>update('accent',key)} className={cn('min-h-12 rounded-xl border px-3 py-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-1))]',settings.accent===key?'border-[rgb(var(--accent-1))] bg-[rgb(var(--accent-1)/0.13)] shadow-[0_0_18px_rgb(var(--accent-1)/0.12)]':'border-border bg-background/45 hover:border-[rgb(var(--accent-1)/0.45)]')}><span className="flex items-center gap-2"><span className="size-5 shrink-0 rounded-full ring-1 ring-white/20" style={{background:`linear-gradient(135deg,rgb(${accent.a1}),rgb(${accent.a3}))`}}/><span className="min-w-0"><span className="block text-xs font-semibold leading-4">{accent.label}</span></span>{settings.accent===key&&<Check className="ml-auto size-4 shrink-0 text-[rgb(var(--accent-1))]"/>}</span></button>)}</div></div>
    <div><h3 className="text-sm font-semibold">Atmosphere</h3><div className="mt-3 grid gap-2 sm:grid-cols-2">{BACKGROUND_MODES.map(mode=><Choice key={mode.key} label={mode.label} selected={settings.backgroundMode===mode.key} onClick={()=>update('backgroundMode',mode.key as BackgroundMode)}/>)}</div></div>
    <div><h3 className="text-sm font-semibold">Cursor style</h3><div className="mt-3 grid gap-2 sm:grid-cols-2">{cursors.map(cursor=><Choice key={cursor.key} label={cursor.label} selected={settings.cursor===cursor.key} onClick={()=>update('cursor',cursor.key)}/>)}</div></div>
    <Single title="Performance mode" options={performance.map(x=>x.label)} value={performance.find(x=>x.key===settings.performance)?.label || 'Balanced'} onChange={label=>update('performance',performance.find(x=>x.label===label)?.key || 'balanced')} />
    <Single title="UI density" options={densities.map(x=>x.label)} value={densities.find(x=>x.key===settings.density)?.label || 'Cozy'} onChange={label=>update('density',densities.find(x=>x.label===label)?.key || 'cozy')} />
    <div><div className="flex items-center justify-between gap-3"><h3 className="text-sm font-semibold">Motion intensity</h3><span className="text-xs text-muted-foreground">{Math.round(settings.animationIntensity*100)}%</span></div><input aria-label="Motion intensity" type="range" min="0.25" max="1" step="0.05" value={settings.animationIntensity} onChange={e=>update('animationIntensity',Number(e.target.value))} className="mt-3 w-full accent-[rgb(var(--accent-1))]" /></div>
    <div><div className="flex items-center justify-between gap-3"><h3 className="text-sm font-semibold">Glass intensity</h3><span className="text-xs text-muted-foreground">{Math.round(settings.glassOpacity*100)}%</span></div><input aria-label="Glass intensity" type="range" min="0.42" max="0.76" step="0.02" value={settings.glassOpacity} onChange={e=>update('glassOpacity',Number(e.target.value))} className="mt-3 w-full accent-[rgb(var(--accent-1))]" /></div>
  </div>
}

function Step({title,subtitle,options,selected,onToggle}:{title:string;subtitle?:string;options:string[];selected:string[];onToggle:(v:string)=>void}){return <div><h2 className="font-heading text-2xl font-bold">{title}</h2>{subtitle&&<p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}<div className="mt-5 grid gap-2 sm:grid-cols-2">{options.map(o=><Choice key={o} label={o} selected={selected.includes(o)} onClick={()=>onToggle(o)}/>)}</div></div>}
function Single({title,options,value,onChange}:{title:string;options:string[];value:string;onChange:(v:string)=>void}){return <div><h3 className="text-sm font-semibold">{title}</h3><div className="mt-3 grid gap-2 sm:grid-cols-2">{options.map(o=><Choice key={o} label={o} selected={value===o} onClick={()=>onChange(o)}/>)}</div></div>}
