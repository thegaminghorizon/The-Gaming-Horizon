'use client'

import Link from 'next/link'
import { Info } from 'lucide-react'
import { PRIVACY_VERSION, TERMS_VERSION } from '@/components/consent-manager'

export function LegalConsent({ checked, onChange, source, id = 'legal-consent' }: { checked: boolean; onChange: (checked: boolean) => void; source: string; id?: string }) {
  return (
    <div className="space-y-3">
      <label htmlFor={id} className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-muted/20 p-3 text-xs leading-relaxed text-muted-foreground">
        <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 size-4 shrink-0 accent-[rgb(var(--accent-1))]" required />
        <span>I agree to the <Link href="/terms" target="_blank" rel="noopener noreferrer" className="font-medium text-foreground underline underline-offset-2">Terms of Service</Link> and acknowledge the <Link href="/privacy" target="_blank" rel="noopener noreferrer" className="font-medium text-foreground underline underline-offset-2">Privacy Policy</Link>.</span>
      </label>
      <input type="hidden" name="termsVersion" value={TERMS_VERSION} />
      <input type="hidden" name="privacyVersion" value={PRIVACY_VERSION} />
      <input type="hidden" name="consentSource" value={source} />
    </div>
  )
}

export function buildLegalAcceptance(source: string, identifier?: string) {
  return { termsVersion: TERMS_VERSION, privacyVersion: PRIVACY_VERSION, acceptedAt: new Date().toISOString(), consentSource: source, identifier: identifier || `submission-${Date.now().toString(36)}` }
}

export function PreReleaseNotice() {
  return <div className="flex items-start gap-2 rounded-xl border border-[rgb(var(--accent-1)/0.24)] bg-[rgb(var(--accent-1)/0.07)] px-4 py-3 text-xs leading-relaxed text-muted-foreground"><Info className="mt-0.5 size-4 shrink-0 text-[rgb(var(--accent-1))]" /><span>Gaming Horizon is under development. Public Beta begins on 1 January 2027. Features may change, and beta users may encounter bugs.</span></div>
}
