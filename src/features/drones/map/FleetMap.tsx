import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import { useMap } from 'react-leaflet'
import { StaleIndicator } from '@/components/StaleIndicator'
import { CLINIC_HOME_BASE } from '@/config/clinic'
import type { DroneTelemetry } from '@/features/telemetry/droneTelemetry'
import { formatBattery } from '@/lib/format'
import { DroneStatusBadge } from '../DroneStatusBadge'
import { TemperatureReading } from '../TemperatureReading'
import { BaseMap } from './BaseMap'
import { DroneMarker } from './DroneMarker'
import { HomeBaseMarker } from './HomeBaseMarker'
import { MapLegend } from './MapLegend'

/** Map of every drone, used on the dashboard. */
export function FleetMap({ items, className }: { items: DroneTelemetry[]; className?: string }) {
  return (
    <BaseMap center={CLINIC_HOME_BASE} zoom={10} className={className}>
      <HomeBaseMarker />
      {items.map((t) => (
        <DroneMarker key={t.drone.id} telemetry={t} popup={<DronePopup telemetry={t} />} />
      ))}
      <FitToDronesOnce items={items} />
      <MapLegend />
    </BaseMap>
  )
}

function DronePopup({ telemetry }: { telemetry: DroneTelemetry }) {
  const { drone, latest, status, isStale, temperatureAlert } = telemetry
  return (
    <div className="min-w-44 space-y-2 text-sm">
      <div className="flex items-center justify-between gap-3">
        <span className="font-semibold">{drone.name}</span>
        <DroneStatusBadge status={status} />
      </div>
      <dl className="grid grid-cols-2 gap-x-3 gap-y-1">
        <dt className="text-muted-foreground">Temp</dt>
        <dd>
          <TemperatureReading
            temperatureC={latest?.temperatureC ?? null}
            alert={temperatureAlert}
          />
        </dd>
        <dt className="text-muted-foreground">Battery</dt>
        <dd>{formatBattery(latest?.batteryPct ?? null)}</dd>
      </dl>
      <StaleIndicator lastUpdated={latest?.timestamp ?? null} isStale={isStale} />
      <Link to={`/drones/${drone.id}`} className="block font-medium text-blue-700 hover:underline">
        View details →
      </Link>
    </div>
  )
}

/**
 * Zooms to fit all drones the first time positions arrive, then leaves the
 * view alone so it doesn't fight the user's panning on every poll.
 */
function FitToDronesOnce({ items }: { items: DroneTelemetry[] }) {
  const map = useMap()
  const done = useRef(false)

  useEffect(() => {
    if (done.current) return
    const points: [number, number][] = items.flatMap(({ latest }) =>
      latest?.lat != null && latest.lng != null ? [[latest.lat, latest.lng]] : [],
    )
    if (points.length === 0) return
    points.push([CLINIC_HOME_BASE.lat, CLINIC_HOME_BASE.lng])
    map.fitBounds(points, { padding: [40, 40], maxZoom: 13 })
    done.current = true
  }, [items, map])

  return null
}
