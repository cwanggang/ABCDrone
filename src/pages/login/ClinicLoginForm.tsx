import { useState, type FormEvent } from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/features/auth/useAuth'

interface Props {
  /** Where to go after signing in. */
  next: string
  /** Error to show on first render (e.g. a failed Google redirect). */
  initialError: string | null
}

/**
 * Email/password + Google sign-in. After a successful sign-in, LoginPage
 * notices the new user and redirects, so this form doesn't navigate itself.
 */
export function ClinicLoginForm({ next, initialError }: Props) {
  const { signInWithPassword, signInWithGoogle, isConfigured, isBypass } = useAuth()
  const [pending, setPending] = useState<'password' | 'google' | null>(null)
  const [error, setError] = useState<string | null>(initialError)

  const run = async (kind: 'password' | 'google', action: () => Promise<void>) => {
    setPending(kind)
    setError(null)
    try {
      await action()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign-in failed. Please try again.')
    } finally {
      // On success with Google the page is already navigating away, which is fine.
      setPending(null)
    }
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    void run('password', () =>
      signInWithPassword(String(form.get('email')), String(form.get('password'))),
    )
  }

  const disabled = !isConfigured || isBypass || pending !== null

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      {error && (
        <Alert variant="destructive">
          <AlertCircle aria-hidden />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <fieldset disabled={disabled} className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>
        <Button type="submit" className="w-full">
          {pending === 'password' && <Loader2 className="animate-spin" aria-hidden />}
          Sign in
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => void run('google', () => signInWithGoogle(next))}
        >
          {pending === 'google' ? <Loader2 className="animate-spin" aria-hidden /> : <GoogleIcon />}
          Continue with Google
        </Button>
      </fieldset>
      {!isConfigured && (
        <p className="text-center text-xs text-muted-foreground">
          Sign-in is unavailable: Supabase isn't configured (see README).
        </p>
      )}
      {isBypass && (
        <p className="text-center text-xs text-muted-foreground">
          Sign-in is disabled while the dev auth bypass is on.
        </p>
      )}
    </form>
  )
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-4">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.43.34-2.09V7.07H2.18A11 11 0 0 0 1 12c0 1.78.43 3.45 1.18 4.93l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  )
}
