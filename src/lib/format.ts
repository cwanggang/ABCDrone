const MPS_TO_MPH = 2.236936

export function formatTemperature(c: number | null): string {
  return c === null ? '—' : `${c.toFixed(1)} °C`
}

export function formatSpeed(mps: number | null): string {
  return mps === null ? '—' : `${mps.toFixed(1)} m/s (${(mps * MPS_TO_MPH).toFixed(0)} mph)`
}

export function formatBattery(pct: number | null): string {
  return pct === null ? '—' : `${Math.round(pct)}%`
}

export function formatCoordinate(value: number | null): string {
  return value === null ? '—' : value.toFixed(5)
}

/** "12s ago", "3m ago", "2h ago". */
export function formatTimeAgo(date: Date, now: number): string {
  const seconds = Math.max(0, Math.round((now - date.getTime()) / 1000))
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export function formatClockTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
