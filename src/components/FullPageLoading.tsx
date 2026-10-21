import { Loader2 } from 'lucide-react'

/** Centered spinner for the brief moment while we check who's signed in. */
export function FullPageLoading() {
  return (
    <div className="flex min-h-svh items-center justify-center" role="status">
      <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden />
      <span className="sr-only">Loading…</span>
    </div>
  )
}
