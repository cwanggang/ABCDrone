import { AlertCircle, RotateCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  title?: string
  error?: unknown
  onRetry?: () => void
}

/** Friendly replacement for a blank screen when something fails to load. */
export function ErrorState({ title = 'Something went wrong', error, onRetry }: Props) {
  const message = error instanceof Error ? error.message : undefined
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-10 text-center"
    >
      <AlertCircle className="size-8 text-destructive" aria-hidden />
      <div>
        <p className="font-medium">{title}</p>
        {message && <p className="mt-1 text-sm text-muted-foreground">{message}</p>}
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RotateCw /> Try again
        </Button>
      )}
    </div>
  )
}
