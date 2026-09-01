// Config, option lists, and the SVG renderer behind the "Design your own"
// avatar creator. Kept framework-agnostic (plain strings/objects) so it can
// be used both for the live preview and for rasterizing the final avatar.

export type HairStyle = 'bald' | 'buzz' | 'short' | 'long' | 'mohawk' | 'curly' | 'ponytail' | 'afro' | 'bun'
export type EyeStyle = 'normal' | 'happy' | 'wink' | 'glasses' | 'sleepy' | 'star'
export type MouthStyle = 'smile' | 'neutral' | 'open' | 'smirk' | 'laugh' | 'surprised'
export type Accessory = 'none' | 'headset' | 'cap' | 'shades' | 'beanie' | 'earrings' | 'vr'
export type OutfitStyle = 'tee' | 'hoodie' | 'jacket' | 'jersey'
export type Pose = 'standing' | 'wave' | 'crossedArms' | 'handsOnHips' | 'thumbsUp' | 'peace' | 'gamerStance' | 'victory'

export interface AvatarDesign {
  bg: string
  skin: string
  hairColor: string
  hair: HairStyle
  eyes: EyeStyle
  mouth: MouthStyle
  accessory: Accessory
  outfit: OutfitStyle
  outfitColor: string
  pose: Pose
}

// Shared swatches — also used by the plain "Solid colour" avatar option.
export const BG_SWATCHES = [
  '#8B5CF6',
  '#4F6CFF',
  '#22D3EE',
  '#22C55E',
  '#EAB308',
  '#F97316',
  '#EF4444',
  '#EC4899',
  '#64748B',
  '#0F172A',
]

export const SKIN_TONES = ['#FFDBB4', '#F1C27D', '#E0AC69', '#C68642', '#8D5524', '#4A2C17']

export const HAIR_COLORS = ['#2B2B2B', '#5C3A21', '#B08D57', '#8B5CF6', '#EF4444', '#22D3EE', '#F4E4BC', '#FFFFFF']

export const OUTFIT_COLORS = [
  '#111827',
  '#334155',
  '#1D4ED8',
  '#7C3AED',
  '#059669',
  '#DC2626',
  '#EA580C',
  '#DB2777',
  '#F59E0B',
  '#F8FAFC',
]

export const HAIR_STYLES: { value: HairStyle; label: string }[] = [
  { value: 'bald', label: 'Bald' },
  { value: 'buzz', label: 'Buzz' },
  { value: 'short', label: 'Short' },
  { value: 'long', label: 'Long' },
  { value: 'mohawk', label: 'Mohawk' },
  { value: 'curly', label: 'Curly' },
  { value: 'ponytail', label: 'Ponytail' },
  { value: 'afro', label: 'Afro' },
  { value: 'bun', label: 'Bun' },
]

export const EYE_STYLES: { value: EyeStyle; label: string }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'happy', label: 'Happy' },
  { value: 'wink', label: 'Wink' },
  { value: 'glasses', label: 'Glasses' },
  { value: 'sleepy', label: 'Sleepy' },
  { value: 'star', label: 'Star-struck' },
]

export const MOUTH_STYLES: { value: MouthStyle; label: string }[] = [
  { value: 'smile', label: 'Smile' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'open', label: 'Grin' },
  { value: 'smirk', label: 'Smirk' },
  { value: 'laugh', label: 'Laugh' },
  { value: 'surprised', label: 'Surprised' },
]

export const ACCESSORY_STYLES: { value: Accessory; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'headset', label: 'Headset' },
  { value: 'cap', label: 'Cap' },
  { value: 'shades', label: 'Shades' },
  { value: 'beanie', label: 'Beanie' },
  { value: 'earrings', label: 'Earrings' },
  { value: 'vr', label: 'VR Visor' },
]

export const OUTFIT_STYLES: { value: OutfitStyle; label: string }[] = [
  { value: 'tee', label: 'Tee' },
  { value: 'hoodie', label: 'Hoodie' },
  { value: 'jacket', label: 'Jacket' },
  { value: 'jersey', label: 'Jersey' },
]

export const POSES: { value: Pose; label: string }[] = [
  { value: 'standing', label: 'Standing' },
  { value: 'wave', label: 'Wave' },
  { value: 'crossedArms', label: 'Crossed Arms' },
  { value: 'handsOnHips', label: 'Hands on Hips' },
  { value: 'thumbsUp', label: 'Thumbs Up' },
  { value: 'peace', label: 'Peace Sign' },
  { value: 'gamerStance', label: 'Gamer Stance' },
  { value: 'victory', label: 'Victory' },
]

export const DEFAULT_AVATAR_DESIGN: AvatarDesign = {
  bg: BG_SWATCHES[0],
  skin: SKIN_TONES[1],
  hairColor: HAIR_COLORS[0],
  hair: 'short',
  eyes: 'normal',
  mouth: 'smile',
  accessory: 'none',
  outfit: 'tee',
  outfitColor: OUTFIT_COLORS[0],
  pose: 'standing',
}

const HAIR_PATHS: Record<HairStyle, (color: string) => string> = {
  bald: () => `<ellipse cx="85" cy="70" rx="14" ry="8" fill="rgba(255,255,255,0.18)"/>`,
  buzz: (c) => `<path d="M44,90 Q100,38 156,90 Q156,74 100,58 Q44,74 44,90 Z" fill="${c}"/>`,
  short: (c) => `<path d="M38,98 Q100,20 162,98 L162,78 Q150,42 100,38 Q50,42 38,78 Z" fill="${c}"/>`,
  long: (c) => `
    <path d="M38,98 Q100,20 162,98 L162,78 Q150,42 100,38 Q50,42 38,78 Z" fill="${c}"/>
    <path d="M38,90 Q30,140 46,178 L60,178 Q50,140 54,95 Z" fill="${c}"/>
    <path d="M162,90 Q170,140 154,178 L140,178 Q150,140 146,95 Z" fill="${c}"/>
  `,
  mohawk: (c) => `<path d="M92,42 Q100,20 108,42 L114,92 Q100,102 86,92 Z" fill="${c}"/>`,
  curly: (c) => `
    <circle cx="58" cy="75" r="17" fill="${c}"/>
    <circle cx="82" cy="55" r="19" fill="${c}"/>
    <circle cx="108" cy="52" r="20" fill="${c}"/>
    <circle cx="134" cy="58" r="18" fill="${c}"/>
    <circle cx="154" cy="78" r="15" fill="${c}"/>
  `,
  ponytail: (c) => `
    <path d="M38,98 Q100,20 162,98 L162,78 Q150,42 100,38 Q50,42 38,78 Z" fill="${c}"/>
    <path d="M150,70 Q178,90 170,150 Q160,160 152,148 Q160,100 140,72 Z" fill="${c}"/>
  `,
  afro: (c) => `
    <circle cx="100" cy="55" r="46" fill="${c}"/>
    <circle cx="52" cy="80" r="30" fill="${c}"/>
    <circle cx="148" cy="80" r="30" fill="${c}"/>
  `,
  bun: (c) => `
    <path d="M38,98 Q100,26 162,98 L162,80 Q150,44 100,40 Q50,44 38,80 Z" fill="${c}"/>
    <circle cx="100" cy="28" r="16" fill="${c}"/>
  `,
}

const EYE_PATHS: Record<EyeStyle, string> = {
  normal: `
    <circle cx="78" cy="100" r="7" fill="#20242b"/><circle cx="122" cy="100" r="7" fill="#20242b"/>
    <circle cx="80.5" cy="97" r="2.2" fill="#fff"/><circle cx="124.5" cy="97" r="2.2" fill="#fff"/>
  `,
  happy: `
    <path d="M68,102 Q78,88 88,102" stroke="#20242b" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M112,102 Q122,88 132,102" stroke="#20242b" stroke-width="5" fill="none" stroke-linecap="round"/>
  `,
  wink: `
    <circle cx="78" cy="100" r="7" fill="#20242b"/><circle cx="80.5" cy="97" r="2.2" fill="#fff"/>
    <path d="M112,102 Q122,88 132,102" stroke="#20242b" stroke-width="5" fill="none" stroke-linecap="round"/>
  `,
  glasses: `
    <rect x="60" y="86" width="36" height="28" rx="11" fill="none" stroke="#20242b" stroke-width="4"/>
    <rect x="104" y="86" width="36" height="28" rx="11" fill="none" stroke="#20242b" stroke-width="4"/>
    <line x1="96" y1="98" x2="104" y2="98" stroke="#20242b" stroke-width="4"/>
    <circle cx="78" cy="100" r="5" fill="#20242b"/><circle cx="122" cy="100" r="5" fill="#20242b"/>
  `,
  sleepy: `
    <path d="M70,100 Q78,104 86,100" stroke="#20242b" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M114,100 Q122,104 130,100" stroke="#20242b" stroke-width="4" fill="none" stroke-linecap="round"/>
  `,
  star: `
    <path d="M78,90 L81,98 L89,98 L82,103 L85,111 L78,106 L71,111 L74,103 L67,98 L75,98 Z" fill="#FFD34D"/>
    <path d="M122,90 L125,98 L133,98 L126,103 L129,111 L122,106 L115,111 L118,103 L111,98 L119,98 Z" fill="#FFD34D"/>
  `,
}

const MOUTH_PATHS: Record<MouthStyle, string> = {
  smile: `<path d="M76,128 Q100,150 124,128" stroke="#5c3a2e" stroke-width="5" fill="none" stroke-linecap="round"/>`,
  neutral: `<line x1="82" y1="132" x2="118" y2="132" stroke="#5c3a2e" stroke-width="5" stroke-linecap="round"/>`,
  open: `<ellipse cx="100" cy="135" rx="17" ry="12" fill="#5c2a24"/><rect x="85" y="126" width="30" height="7" rx="3.5" fill="#fff"/>`,
  smirk: `<path d="M80,130 Q104,142 122,120" stroke="#5c3a2e" stroke-width="5" fill="none" stroke-linecap="round"/>`,
  laugh: `<ellipse cx="100" cy="132" rx="22" ry="16" fill="#5c2a24"/><rect x="82" y="122" width="36" height="8" rx="4" fill="#fff"/>`,
  surprised: `<ellipse cx="100" cy="132" rx="9" ry="12" fill="#5c2a24"/>`,
}

const ACCESSORY_PATHS: Record<Accessory, string> = {
  none: '',
  headset: `
    <path d="M36,96 Q100,10 164,96" stroke="#1f2430" stroke-width="9" fill="none" stroke-linecap="round"/>
    <circle cx="36" cy="104" r="15" fill="#1f2430"/><circle cx="164" cy="104" r="15" fill="#1f2430"/>
    <path d="M164,114 Q172,138 144,150" stroke="#1f2430" stroke-width="6" fill="none" stroke-linecap="round"/>
    <circle cx="144" cy="150" r="6" fill="#8B5CF6"/>
  `,
  cap: `
    <path d="M40,90 Q100,30 160,90 L160,70 Q100,22 40,70 Z" fill="#8B5CF6"/>
    <path d="M96,68 Q138,66 160,90 L160,98 Q130,80 96,80 Z" fill="#6d3fd1"/>
  `,
  shades: `
    <rect x="58" y="88" width="40" height="26" rx="11" fill="#12141a"/>
    <rect x="102" y="88" width="40" height="26" rx="11" fill="#12141a"/>
    <line x1="98" y1="99" x2="102" y2="99" stroke="#12141a" stroke-width="5"/>
  `,
  beanie: `
    <path d="M38,92 Q100,26 162,92 L162,100 L38,100 Z" fill="#334155"/>
    <rect x="38" y="92" width="124" height="14" rx="7" fill="#1e293b"/>
    <circle cx="100" cy="24" r="9" fill="#94a3b8"/>
  `,
  earrings: `<circle cx="40" cy="126" r="4" fill="#FFD34D"/><circle cx="160" cy="126" r="4" fill="#FFD34D"/>`,
  vr: `
    <rect x="54" y="86" width="92" height="32" rx="14" fill="#12141a"/>
    <rect x="60" y="92" width="34" height="20" rx="8" fill="#2b3a55"/>
    <rect x="106" y="92" width="34" height="20" rx="8" fill="#2b3a55"/>
    <path d="M54,102 Q40,102 40,112" stroke="#12141a" stroke-width="6" fill="none" stroke-linecap="round"/>
    <path d="M146,102 Q160,102 160,112" stroke="#12141a" stroke-width="6" fill="none" stroke-linecap="round"/>
  `,
}

// Shared shoulders-and-chest silhouette that every outfit is built on top of.
// Its top edge tucks in behind the head circle (drawn afterwards), so it
// only needs to look right below the chin line.
const TORSO_BASE = 'M20,200 Q20,150 60,148 Q100,138 140,148 Q180,150 180,200 Z'

const OUTFIT_PATHS: Record<OutfitStyle, (color: string) => string> = {
  tee: (c) => `
    <path d="${TORSO_BASE}" fill="${c}"/>
    <path d="M84,150 Q100,164 116,150" stroke="rgba(0,0,0,0.18)" stroke-width="3" fill="none"/>
  `,
  hoodie: (c) => `
    <path d="${TORSO_BASE}" fill="${c}"/>
    <path d="M52,150 Q46,124 66,116 Q76,140 70,158 Z" fill="${c}" opacity="0.85"/>
    <path d="M148,150 Q154,124 134,116 Q124,140 130,158 Z" fill="${c}" opacity="0.85"/>
    <line x1="92" y1="176" x2="90" y2="196" stroke="rgba(0,0,0,0.25)" stroke-width="3" stroke-linecap="round"/>
    <line x1="108" y1="176" x2="110" y2="196" stroke="rgba(0,0,0,0.25)" stroke-width="3" stroke-linecap="round"/>
    <circle cx="90" cy="198" r="3" fill="rgba(0,0,0,0.25)"/>
    <circle cx="110" cy="198" r="3" fill="rgba(0,0,0,0.25)"/>
  `,
  jacket: (c) => `
    <path d="${TORSO_BASE}" fill="${c}"/>
    <path d="M72,150 L96,192 L100,178 L104,192 L128,150" stroke="rgba(0,0,0,0.28)" stroke-width="4" fill="none" stroke-linecap="round"/>
    <line x1="100" y1="178" x2="100" y2="200" stroke="rgba(0,0,0,0.28)" stroke-width="3"/>
  `,
  jersey: (c) => `
    <path d="${TORSO_BASE}" fill="${c}"/>
    <path d="M84,150 L100,170 L116,150" stroke="rgba(255,255,255,0.55)" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M20,178 Q100,192 180,178" stroke="rgba(255,255,255,0.35)" stroke-width="6" fill="none"/>
  `,
}

// Pose arms are layered last, on top of the head/hair/accessory, since a
// raised hand or crossed arm sits in front of (or beside) the rest of the
// character. `sleeve` takes the outfit colour so the arm matches the outfit.
const POSE_PATHS: Record<Pose, (skin: string, sleeve: string) => string> = {
  standing: () => '',
  wave: (skin, sleeve) => `
    <path d="M144,156 Q184,150 180,98" stroke="${sleeve}" stroke-width="18" fill="none" stroke-linecap="round"/>
    <circle cx="180" cy="88" r="12" fill="${skin}"/>
    <path d="M168,72 L164,58" stroke="${skin}" stroke-width="5" stroke-linecap="round"/>
    <path d="M180,68 L180,52" stroke="${skin}" stroke-width="5" stroke-linecap="round"/>
    <path d="M192,72 L196,58" stroke="${skin}" stroke-width="5" stroke-linecap="round"/>
  `,
  crossedArms: (skin, sleeve) => `
    <path d="M36,166 L152,194" stroke="${sleeve}" stroke-width="18" fill="none" stroke-linecap="round"/>
    <path d="M164,166 L48,194" stroke="${sleeve}" stroke-width="18" fill="none" stroke-linecap="round"/>
    <circle cx="150" cy="194" r="10" fill="${skin}"/>
    <circle cx="50" cy="194" r="10" fill="${skin}"/>
  `,
  handsOnHips: (_skin, sleeve) => `
    <path d="M46,156 Q18,176 32,200 L64,200 Q54,176 64,158 Z" fill="${sleeve}"/>
    <path d="M154,156 Q182,176 168,200 L136,200 Q146,176 136,158 Z" fill="${sleeve}"/>
  `,
  thumbsUp: (skin, sleeve) => `
    <path d="M144,156 Q180,148 178,112" stroke="${sleeve}" stroke-width="18" fill="none" stroke-linecap="round"/>
    <circle cx="180" cy="104" r="13" fill="${skin}"/>
    <rect x="174" y="80" width="10" height="22" rx="5" fill="${skin}"/>
  `,
  peace: (skin, sleeve) => `
    <path d="M144,156 Q182,148 182,116" stroke="${sleeve}" stroke-width="18" fill="none" stroke-linecap="round"/>
    <circle cx="184" cy="106" r="11" fill="${skin}"/>
    <rect x="176" y="78" width="7" height="26" rx="3.5" fill="${skin}"/>
    <rect x="188" y="78" width="7" height="26" rx="3.5" fill="${skin}"/>
  `,
  gamerStance: (skin, sleeve) => `
    <path d="M55,160 Q68,186 88,192" stroke="${sleeve}" stroke-width="16" fill="none" stroke-linecap="round"/>
    <path d="M145,160 Q132,186 112,192" stroke="${sleeve}" stroke-width="16" fill="none" stroke-linecap="round"/>
    <circle cx="82" cy="190" r="9" fill="${skin}"/>
    <circle cx="118" cy="190" r="9" fill="${skin}"/>
    <rect x="86" y="178" width="28" height="22" rx="9" fill="#1f2430"/>
    <circle cx="94" cy="189" r="3" fill="#8B5CF6"/>
    <circle cx="106" cy="189" r="3" fill="#22D3EE"/>
  `,
  victory: (skin, sleeve) => `
    <path d="M58,156 Q22,142 18,92" stroke="${sleeve}" stroke-width="16" fill="none" stroke-linecap="round"/>
    <path d="M142,156 Q178,142 182,92" stroke="${sleeve}" stroke-width="16" fill="none" stroke-linecap="round"/>
    <circle cx="17" cy="84" r="11" fill="${skin}"/>
    <circle cx="183" cy="84" r="11" fill="${skin}"/>
  `,
}

// Renders a flat, stylized character avatar as a 200x200 SVG string built
// entirely from the chosen options — no external art assets or libraries.
export function renderAvatarSvg(design: AvatarDesign): string {
  const parts = [
    `<rect x="0" y="0" width="200" height="200" fill="${design.bg}"/>`,
    OUTFIT_PATHS[design.outfit](design.outfitColor),
    `<circle cx="40" cy="115" r="11" fill="${design.skin}"/><circle cx="160" cy="115" r="11" fill="${design.skin}"/>`,
    `<circle cx="100" cy="112" r="58" fill="${design.skin}"/>`,
    HAIR_PATHS[design.hair](design.hairColor),
    EYE_PATHS[design.eyes],
    MOUTH_PATHS[design.mouth],
    ACCESSORY_PATHS[design.accessory],
    POSE_PATHS[design.pose](design.skin, design.outfitColor),
  ]
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">${parts.join('')}</svg>`
}
