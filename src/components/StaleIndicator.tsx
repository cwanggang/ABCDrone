import { AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TimeAgo } from './TimeAgo'

interface Props {
  lastUpdated: Date | null
  isStale: boolean
  className?: string
}

/**
 * Shows whether telemetry is fresh. Put this next to any telemetry value
 * so nobody mistakes an old reading for a live one.
 */
export function StaleIndicator({ lastUpdated, isStale, className }: Props) {
  if (!lastUpdated) {
    return (
      <span
        className={cn('inline-flex items-center gap-1.5 text-xs text-muted-foreground', className)}
      >
        <AlertTriangle className="size-3.5" aria-hidden />
        No data yet
      </span>
    )
  }

  if (isStale) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-400',
          className,
        )}
      >
        <AlertTriangle className="size-3.5" aria-hidden />
        Stale · <TimeAgo date={lastUpdated} />
      </span>
    )
  }

  return (
    <span
      className={cn('inline-flex items-center gap-1.5 text-xs text-muted-foreground', className)}
    >
      <span className="relative flex size-2" aria-hidden>
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60" />
        <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
      </span>
      Live · <TimeAgo date={lastUpdated} />
    </span>
  )
}
