import { ThermometerSnowflake, ThermometerSun } from 'lucide-react'
import { formatTemperature } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { TemperatureAlert } from '@/features/telemetry/temperature'

interface Props {
  temperatureC: number | null
  alert: TemperatureAlert
  className?: string
}

/** A temperature value that turns red with an icon when out of range. */
export function TemperatureReading({ temperatureC, alert, className }: Props) {
  if (!alert) return <span className={className}>{formatTemperature(temperatureC)}</span>
  const Icon = alert === 'too_hot' ? ThermometerSun : ThermometerSnowflake
  return (
    <span className={cn('inline-flex items-center gap-1 font-medium text-red-600', className)}>
      <Icon className="size-4" aria-hidden />
      {formatTemperature(temperatureC)}
      <span className="sr-only">{alert === 'too_hot' ? '(too hot)' : '(too cold)'}</span>
    </span>
  )
}
