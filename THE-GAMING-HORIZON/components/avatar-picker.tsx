'use client'

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  X,
  Palette,
  Upload,
  Camera,
  Wand2,
  Trash2,
  RotateCcw,
  RotateCw,
  ZoomIn,
  Check,
  ArrowLeft,
  Loader2,
  ImagePlus,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AvatarFrame, AVATAR_ANIMATIONS, type AvatarAnimation } from '@/components/ui/avatar-frame'
import {
  BG_SWATCHES,
  SKIN_TONES,
  HAIR_COLORS,
  OUTFIT_COLORS,
  HAIR_STYLES,
  EYE_STYLES,
  MOUTH_STYLES,
  ACCESSORY_STYLES,
  OUTFIT_STYLES,
  POSES,
  DEFAULT_AVATAR_DESIGN,
  renderAvatarSvg,
  type AvatarDesign,
} from '@/lib/avatar-design'

// Square crop viewport shown to the user (CSS px) vs. the final exported
// avatar resolution (canvas px). Kept separate so the on-screen editor can
// be a comfortable size regardless of the stored image's resolution.
const VIEWPORT = 280
const OUTPUT = 320

type Step = 'closed' | 'menu' | 'color' | 'design' | 'crop' | 'selfie' | 'animation' | 'confirm'
type PendingKind = 'photo' | 'color' | 'design' | 'remove' | 'animation'

export interface AvatarPickerHandle {
  open: () => void
}

interface AvatarPickerProps {
  avatar: string
  initials: string
  onApply: (avatarDataUrl: string) => void
  animation?: AvatarAnimation
  onApplyAnimation?: (animation: AvatarAnimation) => void
}

function MenuTile({
  icon: Icon,
  label,
  onClick,
  disabled,
  danger,
  full,
}: {
  icon: (props: { className?: string }) => ReactNode
  label: string
  onClick: () => void
  disabled?: boolean
  danger?: boolean
  full?: boolean
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-2 rounded-xl border border-border bg-background/50 px-3 py-4 text-center text-xs font-semibold transition-colors hover:border-[rgb(var(--accent-1)/0.5)] hover:bg-[rgb(var(--accent-1)/0.08)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:bg-background/50',
        danger && 'text-red-400 hover:border-red-400/50 hover:bg-red-500/10',
        full && 'col-span-2 flex-row justify-center py-3.5',
      )}
    >
      <span
        className={cn(
          'grid size-9 shrink-0 place-items-center rounded-lg',
          danger ? 'bg-red-500/12 text-red-400' : 'bg-[rgb(var(--accent-1)/0.14)] text-[rgb(var(--accent-1))]',
        )}
      >
        <Icon className="size-4.5" />
      </span>
      {label}
    </button>
  )
}

function ColorRow({
  label,
  colors,
  value,
  onChange,
}: {
  label: string
  colors: string[]
  value: string
  onChange: (color: string) => void
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {colors.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            className={cn(
              'size-7 shrink-0 rounded-full ring-offset-2 ring-offset-background transition-transform hover:scale-110',
              value.toLowerCase() === c.toLowerCase() && 'ring-2 ring-[rgb(var(--accent-1))]',
            )}
            style={{ backgroundColor: c }}
            aria-label={`Use colour ${c}`}
          />
        ))}
      </div>
    </div>
  )
}

function PillRow<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
              value === opt.value
                ? 'border-[rgb(var(--accent-1))] bg-[rgb(var(--accent-1)/0.14)] text-[rgb(var(--accent-1))]'
                : 'border-border bg-background/50 text-muted-foreground hover:border-[rgb(var(--accent-1)/0.4)] hover:text-foreground',
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export const AvatarPicker = forwardRef<AvatarPickerHandle, AvatarPickerProps>(function AvatarPicker(
  { avatar, initials, onApply, animation = 'none', onApplyAnimation },
  ref,
) {
  const [step, setStep] = useState<Step>('closed')
  const [error, setError] = useState<string | null>(null)

  // Solid colour step
  const [color, setColor] = useState(BG_SWATCHES[0])

  // Design-your-own step
  const [design, setDesign] = useState<AvatarDesign>(DEFAULT_AVATAR_DESIGN)
  const designPreviewSvg = useMemo(() => renderAvatarSvg(design), [design])

  // Animation step
  const [animationChoice, setAnimationChoice] = useState<AvatarAnimation>(animation)

  // Crop step (shared by "Browse a photo" and "Take a selfie")
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [imgLoaded, setImgLoaded] = useState(false)
  const [isGif, setIsGif] = useState(false)
  const [baseScale, setBaseScale] = useState(1)
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  const dragState = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // Selfie step
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Confirmation step
  const [pending, setPending] = useState<{ kind: PendingKind; value: string } | null>(null)

  // Release the blob URL whenever it changes or the picker unmounts.
  useEffect(() => {
    return () => {
      if (imageSrc) URL.revokeObjectURL(imageSrc)
    }
  }, [imageSrc])

  // Stop the camera whenever the stream reference changes or the picker unmounts.
  useEffect(() => {
    return () => {
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [stream])

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream
  }, [stream])

  useEffect(() => {
    if (step === 'closed') return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeAll()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  useImperativeHandle(ref, () => ({ open: openMenu }))

  function openMenu() {
    setError(null)
    setStep('menu')
  }

  function resetCropState() {
    setImageSrc(null)
    setImgLoaded(false)
    setIsGif(false)
    setZoom(1)
    setRotation(0)
    setOffset({ x: 0, y: 0 })
  }

  function stopCamera() {
    stream?.getTracks().forEach((t) => t.stop())
    setStream(null)
    setCameraError(null)
  }

  function closeAll() {
    resetCropState()
    stopCamera()
    setPending(null)
    setError(null)
    setStep('closed')
  }

  function backToMenu() {
    resetCropState()
    stopCamera()
    setPending(null)
    setError(null)
    setStep('menu')
  }

  function handleFile(file?: File) {
    if (!file) return
    setError(null)
    if (!file.type.startsWith('image/')) {
      setError('Choose an image file.')
      return
    }
    if (file.size > 12 * 1024 * 1024) {
      setError('Please choose an image smaller than 12 MB.')
      return
    }
    setImgLoaded(false)
    setIsGif(file.type === 'image/gif')
    setZoom(1)
    setRotation(0)
    setOffset({ x: 0, y: 0 })
    setImageSrc(URL.createObjectURL(file))
    setStep('crop')
    if (fileRef.current) fileRef.current.value = ''
  }

  async function openSelfie() {
    setError(null)
    setCameraError(null)
    setStep('selfie')
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
      setStream(s)
    } catch {
      setCameraError('Camera access was denied or is unavailable. You can browse a photo instead.')
    }
  }

  function captureSelfie() {
    const video = videoRef.current
    if (!video || !video.videoWidth) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      setError('Image editing is unavailable in this browser.')
      return
    }
    // Mirror the capture so it matches the mirrored live preview the user saw.
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    stopCamera()
    setImgLoaded(false)
    setIsGif(false)
    setZoom(1)
    setRotation(0)
    setOffset({ x: 0, y: 0 })
    setImageSrc(canvas.toDataURL('image/jpeg', 0.92))
    setStep('crop')
  }

  function onImgLoad() {
    const img = imgRef.current
    if (!img) return
    setBaseScale(Math.max(VIEWPORT / img.naturalWidth, VIEWPORT / img.naturalHeight))
    setImgLoaded(true)
  }

  function clampOffset(n: number) {
    return Math.min(VIEWPORT, Math.max(-VIEWPORT, n))
  }

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (!imgLoaded) return
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
    setDragging(true)
    dragState.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y }
  }
  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (!dragState.current) return
    const dx = e.clientX - dragState.current.x
    const dy = e.clientY - dragState.current.y
    setOffset({ x: clampOffset(dragState.current.ox + dx), y: clampOffset(dragState.current.oy + dy) })
  }
  function onPointerUp() {
    dragState.current = null
    setDragging(false)
  }

  function rotateBy(delta: number) {
    setRotation((r) => {
      let next = r + delta
      while (next > 180) next -= 360
      while (next < -180) next += 360
      return next
    })
  }

  function resetTransform() {
    setZoom(1)
    setRotation(0)
    setOffset({ x: 0, y: 0 })
  }

  function finishCrop() {
    const img = imgRef.current
    if (!img || !imgLoaded) return
    const canvas = document.createElement('canvas')
    canvas.width = OUTPUT
    canvas.height = OUTPUT
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      setError('Image editing is unavailable in this browser.')
      return
    }
    const factor = OUTPUT / VIEWPORT
    const effScale = baseScale * zoom * factor
    const drawW = img.naturalWidth * effScale
    const drawH = img.naturalHeight * effScale
    ctx.save()
    ctx.translate(OUTPUT / 2, OUTPUT / 2)
    ctx.translate(offset.x * factor, offset.y * factor)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH)
    ctx.restore()
    setPending({ kind: 'photo', value: canvas.toDataURL('image/jpeg', 0.85) })
    setStep('confirm')
  }

  function finishColor() {
    const canvas = document.createElement('canvas')
    canvas.width = OUTPUT
    canvas.height = OUTPUT
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      setError('Image editing is unavailable in this browser.')
      return
    }
    ctx.fillStyle = color
    ctx.fillRect(0, 0, OUTPUT, OUTPUT)
    ctx.fillStyle = 'rgba(255,255,255,0.94)'
    ctx.font = '700 128px system-ui, -apple-system, Segoe UI, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText((initials || 'GH').slice(0, 2), OUTPUT / 2, OUTPUT / 2 + 6)
    setPending({ kind: 'color', value: canvas.toDataURL('image/png') })
    setStep('confirm')
  }

  function finishDesign() {
    setError(null)
    const svg = designPreviewSvg
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = OUTPUT
      canvas.height = OUTPUT
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        setError('Image editing is unavailable in this browser.')
        return
      }
      ctx.drawImage(img, 0, 0, OUTPUT, OUTPUT)
      setPending({ kind: 'design', value: canvas.toDataURL('image/png') })
      setStep('confirm')
    }
    img.onerror = () => setError('Could not render your design. Try again.')
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
  }

  function chooseRemove() {
    setPending({ kind: 'remove', value: '' })
    setStep('confirm')
  }

  function finishAnimation() {
    setPending({ kind: 'animation', value: animationChoice })
    setStep('confirm')
  }

  function confirmApply() {
    if (!pending) return
    if (pending.kind === 'animation') {
      onApplyAnimation?.(pending.value as AvatarAnimation)
    } else {
      onApply(pending.value)
    }
    closeAll()
  }

  function backFromConfirm() {
    if (!pending) return
    if (pending.kind === 'photo') setStep('crop')
    else if (pending.kind === 'color') setStep('color')
    else if (pending.kind === 'design') setStep('design')
    else if (pending.kind === 'animation') setStep('animation')
    else setStep('menu')
  }

  const isOpen = step !== 'closed'
  const wide = step === 'design' || step === 'animation'

  return (
    <>
      <AvatarFrame animation={animation} rounded="rounded-2xl">
        <button
          type="button"
          onClick={openMenu}
          className="group relative grid size-20 shrink-0 place-items-center overflow-hidden rounded-2xl bg-[rgb(var(--accent-1))] text-2xl font-bold text-[var(--accent-button-fg)] shadow-[0_18px_45px_-22px_rgb(var(--accent-1))]"
        >
          {avatar ? (
            <img src={avatar} alt="Profile preview" className="size-full object-cover" />
          ) : (
            initials
          )}
          <span className="absolute inset-0 grid place-items-center bg-black/45 text-white opacity-0 transition-opacity group-hover:opacity-100">
            <ImagePlus className="size-5" />
          </span>
        </button>
      </AvatarFrame>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeAll}
            />
            <motion.div
              className={cn(
                'glass-strong relative z-10 max-h-[88vh] w-full overflow-y-auto rounded-3xl p-6 sm:p-7',
                wide ? 'max-w-lg' : 'max-w-sm',
              )}
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ type: 'spring', stiffness: 300, damping: 26 }}
              role="dialog"
              aria-modal="true"
              aria-label="Change profile picture"
            >
              <button
                type="button"
                onClick={closeAll}
                className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-lg hover:bg-muted"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>

              {step === 'menu' && (
                <div>
                  <h2 className="font-heading pr-8 text-lg font-semibold">Change profile picture</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Choose how you&apos;d like to update it.</p>
                  <div className="mt-5 grid grid-cols-2 gap-2.5">
                    <MenuTile icon={Palette} label="Solid colour" onClick={() => setStep('color')} />
                    <MenuTile icon={Wand2} label="Design your own" onClick={() => setStep('design')} />
                    <MenuTile icon={Upload} label="Browse a photo" onClick={() => fileRef.current?.click()} />
                    <MenuTile icon={Camera} label="Take a selfie" onClick={openSelfie} />
                    <MenuTile icon={Trash2} label="Remove profile picture" onClick={chooseRemove} disabled={!avatar} danger full />
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      className="hidden"
                      onChange={(e) => handleFile(e.target.files?.[0])}
                    />
                  </div>

                  {onApplyAnimation && (
                    <div className="mt-4 border-t border-border/60 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setAnimationChoice(animation)
                          setStep('animation')
                        }}
                        className="flex w-full items-center gap-3 rounded-xl border border-border bg-background/50 px-4 py-3.5 text-left text-sm font-medium transition-colors hover:border-[rgb(var(--accent-1)/0.5)] hover:bg-[rgb(var(--accent-1)/0.08)]"
                      >
                        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[rgb(var(--accent-1)/0.14)] text-[rgb(var(--accent-1))]">
                          <Sparkles className="size-4.5" />
                        </span>
                        Avatar animation
                        <span className="ml-auto text-xs font-normal text-muted-foreground">
                          {AVATAR_ANIMATIONS.find((a) => a.value === animation)?.label ?? 'None'}
                        </span>
                      </button>
                    </div>
                  )}

                  {error && (
                    <p role="alert" className="mt-3 text-sm text-red-400">
                      {error}
                    </p>
                  )}
                </div>
              )}

              {step === 'color' && (
                <div>
                  <button
                    type="button"
                    onClick={openMenu}
                    className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="size-3.5" />
                    Back
                  </button>
                  <h2 className="font-heading pr-8 text-lg font-semibold">Pick a colour</h2>
                  <div className="mt-5 flex items-center justify-center">
                    <div
                      className="grid size-24 place-items-center rounded-2xl text-3xl font-bold text-white shadow-inner"
                      style={{ backgroundColor: color }}
                    >
                      {(initials || 'GH').slice(0, 2)}
                    </div>
                  </div>
                  <div className="mt-5 grid grid-cols-5 gap-2.5">
                    {BG_SWATCHES.map((sw) => (
                      <button
                        key={sw}
                        type="button"
                        onClick={() => setColor(sw)}
                        className={cn(
                          'aspect-square w-full rounded-full ring-offset-2 ring-offset-background transition-transform hover:scale-105',
                          color.toLowerCase() === sw.toLowerCase() && 'ring-2 ring-[rgb(var(--accent-1))]',
                        )}
                        style={{ backgroundColor: sw }}
                        aria-label={`Use colour ${sw}`}
                      />
                    ))}
                  </div>
                  <label className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-border bg-background/50 px-4 py-2.5 text-sm">
                    Custom colour
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="h-8 w-14 cursor-pointer rounded border border-border bg-transparent p-0"
                    />
                  </label>
                  {error && (
                    <p role="alert" className="mt-3 text-sm text-red-400">
                      {error}
                    </p>
                  )}
                  <div className="mt-6 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={openMenu}
                      className="rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={finishColor}
                      className="rounded-xl bg-[rgb(var(--accent-1))] px-5 py-2.5 text-sm font-semibold text-[var(--accent-button-fg)]"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {step === 'design' && (
                <div>
                  <button
                    type="button"
                    onClick={openMenu}
                    className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="size-3.5" />
                    Back
                  </button>
                  <h2 className="font-heading pr-8 text-lg font-semibold">Design your own</h2>
                  <p className="mt-1 text-xs text-muted-foreground">Mix and match to build your own avatar.</p>

                  <div className="mt-4 flex items-center justify-center">
                    <div
                      className="size-28 overflow-hidden rounded-2xl border border-border shadow-[0_18px_45px_-22px_rgb(var(--accent-1))]"
                      dangerouslySetInnerHTML={{ __html: designPreviewSvg }}
                    />
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <ColorRow label="Background" colors={BG_SWATCHES} value={design.bg} onChange={(v) => setDesign((d) => ({ ...d, bg: v }))} />
                    <ColorRow label="Skin tone" colors={SKIN_TONES} value={design.skin} onChange={(v) => setDesign((d) => ({ ...d, skin: v }))} />
                    <ColorRow label="Hair colour" colors={HAIR_COLORS} value={design.hairColor} onChange={(v) => setDesign((d) => ({ ...d, hairColor: v }))} />
                    <ColorRow label="Outfit colour" colors={OUTFIT_COLORS} value={design.outfitColor} onChange={(v) => setDesign((d) => ({ ...d, outfitColor: v }))} />
                    <PillRow label="Hair style" options={HAIR_STYLES} value={design.hair} onChange={(v) => setDesign((d) => ({ ...d, hair: v }))} />
                    <PillRow label="Eyes" options={EYE_STYLES} value={design.eyes} onChange={(v) => setDesign((d) => ({ ...d, eyes: v }))} />
                    <PillRow label="Mouth" options={MOUTH_STYLES} value={design.mouth} onChange={(v) => setDesign((d) => ({ ...d, mouth: v }))} />
                    <PillRow label="Accessory" options={ACCESSORY_STYLES} value={design.accessory} onChange={(v) => setDesign((d) => ({ ...d, accessory: v }))} />
                    <PillRow label="Outfit style" options={OUTFIT_STYLES} value={design.outfit} onChange={(v) => setDesign((d) => ({ ...d, outfit: v }))} />
                    <PillRow label="Pose" options={POSES} value={design.pose} onChange={(v) => setDesign((d) => ({ ...d, pose: v }))} />
                  </div>

                  {error && (
                    <p role="alert" className="mt-3 text-sm text-red-400">
                      {error}
                    </p>
                  )}

                  <div className="mt-6 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setDesign(DEFAULT_AVATAR_DESIGN)}
                      className="mr-auto text-xs font-medium text-muted-foreground hover:text-foreground"
                    >
                      Reset
                    </button>
                    <button
                      type="button"
                      onClick={openMenu}
                      className="rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={finishDesign}
                      className="rounded-xl bg-[rgb(var(--accent-1))] px-5 py-2.5 text-sm font-semibold text-[var(--accent-button-fg)]"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {step === 'selfie' && (
                <div>
                  <button
                    type="button"
                    onClick={backToMenu}
                    className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="size-3.5" />
                    Back
                  </button>
                  <h2 className="font-heading pr-8 text-lg font-semibold">Take a selfie</h2>
                  <p className="mt-1 text-xs text-muted-foreground">Centre your face in the frame, then capture.</p>

                  <div
                    className="relative mx-auto mt-4 overflow-hidden rounded-2xl border border-border bg-black"
                    style={{ width: VIEWPORT, height: VIEWPORT }}
                  >
                    {cameraError ? (
                      <div className="absolute inset-0 grid place-items-center p-6 text-center text-xs text-muted-foreground">
                        {cameraError}
                      </div>
                    ) : !stream ? (
                      <div className="absolute inset-0 grid place-items-center text-muted-foreground">
                        <Loader2 className="size-6 animate-spin" />
                      </div>
                    ) : null}
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="absolute inset-0 size-full object-cover [transform:scaleX(-1)]"
                    />
                  </div>

                  {error && (
                    <p role="alert" className="mt-3 text-sm text-red-400">
                      {error}
                    </p>
                  )}

                  <div className="mt-5 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={backToMenu}
                      className="rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={!stream}
                      onClick={captureSelfie}
                      className="flex items-center gap-2 rounded-xl bg-[rgb(var(--accent-1))] px-5 py-2.5 text-sm font-semibold text-[var(--accent-button-fg)] disabled:opacity-50"
                    >
                      <Camera className="size-4" />
                      Capture
                    </button>
                  </div>
                </div>
              )}

              {step === 'crop' && imageSrc && (
                <div>
                  <button
                    type="button"
                    onClick={backToMenu}
                    className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="size-3.5" />
                    Back
                  </button>
                  <h2 className="font-heading pr-8 text-lg font-semibold">Adjust your photo</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Drag to reposition. Use the controls to zoom and rotate.
                    {isGif ? ' Animated GIFs are saved as a still image.' : ''}
                  </p>

                  <div
                    className="relative mx-auto mt-4 touch-none select-none overflow-hidden rounded-2xl border border-border bg-black/40"
                    style={{ width: VIEWPORT, height: VIEWPORT, cursor: dragging ? 'grabbing' : 'grab' }}
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerLeave={onPointerUp}
                  >
                    {!imgLoaded && (
                      <div className="absolute inset-0 grid place-items-center text-muted-foreground">
                        <Loader2 className="size-6 animate-spin" />
                      </div>
                    )}
                    <img
                      ref={imgRef}
                      src={imageSrc}
                      alt=""
                      onLoad={onImgLoad}
                      draggable={false}
                      className={cn(
                        'pointer-events-none absolute left-1/2 top-1/2 max-w-none transition-opacity',
                        imgLoaded ? 'opacity-100' : 'opacity-0',
                      )}
                      style={{
                        transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) rotate(${rotation}deg) scale(${baseScale * zoom})`,
                      }}
                    />
                    <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/15" />
                  </div>

                  <div className="mt-4 grid gap-3">
                    <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <ZoomIn className="size-3.5" />
                        Zoom
                      </span>
                      <input
                        type="range"
                        min={1}
                        max={3}
                        step={0.01}
                        value={zoom}
                        onChange={(e) => setZoom(Number(e.target.value))}
                        className="w-full accent-[rgb(var(--accent-1))]"
                      />
                    </label>
                    <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
                      <span>Rotate</span>
                      <input
                        type="range"
                        min={-180}
                        max={180}
                        step={1}
                        value={rotation}
                        onChange={(e) => setRotation(Number(e.target.value))}
                        className="w-full accent-[rgb(var(--accent-1))]"
                      />
                    </label>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => rotateBy(-90)}
                          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted"
                        >
                          <RotateCcw className="size-3.5" />
                          90°
                        </button>
                        <button
                          type="button"
                          onClick={() => rotateBy(90)}
                          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted"
                        >
                          <RotateCw className="size-3.5" />
                          90°
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={resetTransform}
                        className="text-xs font-medium text-muted-foreground hover:text-foreground"
                      >
                        Reset
                      </button>
                    </div>
                  </div>

                  {error && (
                    <p role="alert" className="mt-3 text-sm text-red-400">
                      {error}
                    </p>
                  )}

                  <div className="mt-5 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={backToMenu}
                      className="rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={!imgLoaded}
                      onClick={finishCrop}
                      className="rounded-xl bg-[rgb(var(--accent-1))] px-5 py-2.5 text-sm font-semibold text-[var(--accent-button-fg)] disabled:opacity-50"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {step === 'animation' && (
                <div>
                  <button
                    type="button"
                    onClick={openMenu}
                    className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="size-3.5" />
                    Back
                  </button>
                  <h2 className="font-heading pr-8 text-lg font-semibold">Avatar animation</h2>
                  <p className="mt-1 text-xs text-muted-foreground">Add a decorative animated frame around your profile picture.</p>

                  <div className="mt-5 grid grid-cols-3 gap-3">
                    {AVATAR_ANIMATIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setAnimationChoice(opt.value)}
                        className={cn(
                          'flex flex-col items-center gap-2 rounded-xl border p-3 text-center text-[11px] font-semibold transition-colors',
                          animationChoice === opt.value
                            ? 'border-[rgb(var(--accent-1))] bg-[rgb(var(--accent-1)/0.08)]'
                            : 'border-border bg-background/50 hover:border-[rgb(var(--accent-1)/0.4)]',
                        )}
                      >
                        <AvatarFrame animation={opt.value} rounded="rounded-xl">
                          <span className="grid size-12 place-items-center overflow-hidden rounded-xl bg-[rgb(var(--accent-1))] text-xs font-bold text-[var(--accent-button-fg)]">
                            {avatar ? <img src={avatar} alt="" className="size-full object-cover" /> : initials}
                          </span>
                        </AvatarFrame>
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  {error && (
                    <p role="alert" className="mt-3 text-sm text-red-400">
                      {error}
                    </p>
                  )}

                  <div className="mt-6 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={openMenu}
                      className="rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={finishAnimation}
                      className="rounded-xl bg-[rgb(var(--accent-1))] px-5 py-2.5 text-sm font-semibold text-[var(--accent-button-fg)]"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {step === 'confirm' && pending && (
                <div>
                  <h2 className="font-heading pr-8 text-lg font-semibold">
                    {pending.kind === 'remove'
                      ? 'Remove profile picture?'
                      : pending.kind === 'animation'
                        ? 'Apply this animation?'
                        : 'Apply this profile picture?'}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {pending.kind === 'remove'
                      ? 'This clears your current profile picture. You can set a new one anytime.'
                      : pending.kind === 'animation'
                        ? 'Are you sure you want to use this animated frame around your profile picture?'
                        : 'Are you sure you want to use this as your new profile picture?'}
                  </p>
                  <div className="mt-5 flex items-center justify-center">
                    {pending.kind === 'remove' ? (
                      <div className="grid size-24 place-items-center rounded-2xl border border-dashed border-border text-2xl font-bold text-muted-foreground">
                        {(initials || 'GH').slice(0, 2)}
                      </div>
                    ) : pending.kind === 'animation' ? (
                      <AvatarFrame animation={pending.value as AvatarAnimation} rounded="rounded-2xl">
                        <span className="grid size-24 place-items-center overflow-hidden rounded-2xl bg-[rgb(var(--accent-1))] text-2xl font-bold text-[var(--accent-button-fg)] shadow-[0_18px_45px_-22px_rgb(var(--accent-1))]">
                          {avatar ? <img src={avatar} alt="" className="size-full object-cover" /> : initials}
                        </span>
                      </AvatarFrame>
                    ) : (
                      <img
                        src={pending.value}
                        alt="New profile picture preview"
                        className="size-24 rounded-2xl object-cover shadow-[0_18px_45px_-22px_rgb(var(--accent-1))]"
                      />
                    )}
                  </div>
                  <div className="mt-6 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={backFromConfirm}
                      className="rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={confirmApply}
                      className={cn(
                        'flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold',
                        pending.kind === 'remove'
                          ? 'bg-red-500 text-white'
                          : 'bg-[rgb(var(--accent-1))] text-[var(--accent-button-fg)]',
                      )}
                    >
                      <Check className="size-4" />
                      {pending.kind === 'remove' ? 'Yes, remove' : 'Yes, apply'}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
})
