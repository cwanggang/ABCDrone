import type { ReactNode } from 'react'
import { CircleMarker, Popup, Tooltip } from 'react-leaflet'
import { hasActiveTemperatureAlert, type DroneTelemetry } from '@/features/telemetry/droneTelemetry'
import { ALERT_COLOR, STATUS_STYLES } from '../statusStyles'

interface Props {
  telemetry: DroneTelemetry
  /** Popup content; omit for no popup. */
  popup?: ReactNode
}

/**
 * A drone's current position. Fill = status, thick red ring = temperature
 * alert. Using CircleMarker (SVG) instead of Leaflet's default pin image
 * avoids Leaflet's broken-icon-path problem with Vite.
 */
export function DroneMarker({ telemetry, popup }: Props) {
  const { latest, status, drone } = telemetry
  if (latest?.lat == null || latest.lng == null) return null

  const alert = hasActiveTemperatureAlert(telemetry)
  return (
    <CircleMarker
      center={[latest.lat, latest.lng]}
      radius={10}
      pathOptions={{
        fillColor: STATUS_STYLES[status].color,
        fillOpacity: 1,
        color: alert ? ALERT_COLOR : '#ffffff',
        weight: alert ? 4 : 2,
      }}
    >
      <Tooltip direction="top" offset={[0, -10]}>
        {drone.name} · {STATUS_STYLES[status].label}
        {alert && ' · temperature alert'}
      </Tooltip>
      {popup && <Popup>{popup}</Popup>}
    </CircleMarker>
  )
}
