import { Check } from 'lucide-react'

export const PASSWORD_REQUIREMENTS = [
  { label: 'At least 8 characters', test: (value: string) => value.length >= 8 },
  { label: 'One uppercase letter', test: (value: string) => /[A-Z]/.test(value) },
  { label: 'One lowercase letter', test: (value: string) => /[a-z]/.test(value) },
  { label: 'One number', test: (value: string) => /\d/.test(value) },
  { label: 'One special character', test: (value: string) => /[^A-Za-z0-9]/.test(value) },
] as const

export function passwordMeetsRequirements(value: string) {
  return PASSWORD_REQUIREMENTS.every((requirement) => requirement.test(value))
}

// Shown wherever someone sets or changes a password (signup, forgot-password
// reset, in-app password change) so the requirements are consistent everywhere.
export function PasswordRequirements({ password }: { password: string }) {
  const complete = passwordMeetsRequirements(password)
  return (
    <div className="mt-3 rounded-xl border border-border/70 bg-muted/20 p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Password requirements</p>
        <span className={`text-[11px] font-semibold ${complete ? 'text-emerald-500' : 'text-muted-foreground'}`}>
          {complete ? 'Complete' : 'In progress'}
        </span>
      </div>
      <div className="grid gap-1.5 sm:grid-cols-2">
        {PASSWORD_REQUIREMENTS.map(({ label, test }) => {
          const met = test(password)
          return (
            <div key={label} className={`flex items-center gap-2 text-xs ${met ? 'text-emerald-500' : 'text-muted-foreground'}`}>
              <span className={`grid size-4 place-items-center rounded-full border ${met ? 'border-emerald-500 bg-emerald-500/10' : 'border-border'}`}>
                {met ? <Check className="size-2.5" /> : null}
              </span>
              <span>{label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
