import { ThermometerSnowflake, ThermometerSun } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { TEMPERATURE_SAFE_RANGE_C } from '@/config/telemetry'
import type { DroneTelemetry } from '@/features/telemetry/droneTelemetry'
import { formatTemperature } from '@/lib/format'

/** Big, unmissable warning when a drone's sample temperature is out of range. */
export function TemperatureAlertBanner({ telemetry }: { telemetry: DroneTelemetry }) {
  const { temperatureAlert, latest, status } = telemetry
  if (!temperatureAlert || !latest) return null

  const tooHot = temperatureAlert === 'too_hot'
  const Icon = tooHot ? ThermometerSun : ThermometerSnowflake
  const { min, max } = TEMPERATURE_SAFE_RANGE_C

  return (
    <Alert variant="destructive" className="border-red-300 bg-red-50">
      <Icon aria-hidden />
      <AlertTitle>
        Sample temperature {tooHot ? 'too high' : 'too low'}:{' '}
        {formatTemperature(latest.temperatureC)}
      </AlertTitle>
      <AlertDescription>
        Safe range is {min}–{max} °C.
        {status === 'offline'
          ? ' This is the last reading before the drone went offline; its current temperature is unknown.'
          : ' Samples on this flight may be compromised.'}
      </AlertDescription>
    </Alert>
  )
}
