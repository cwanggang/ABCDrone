import { formatTimeAgo } from '@/lib/format'
import { useNow } from '@/lib/useNow'

/** "12s ago", ticking every second. Hover shows the exact time. */
export function TimeAgo({ date }: { date: Date }) {
  const now = useNow()
  return (
    <time dateTime={date.toISOString()} title={date.toLocaleString()}>
      {formatTimeAgo(date, now)}
    </time>
  )
}
