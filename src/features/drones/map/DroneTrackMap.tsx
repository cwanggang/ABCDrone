import { useEffect, useState } from 'react'
import { CircleMarker, Polyline, useMap, useMapEvents } from 'react-leaflet'
import { Crosshair } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CLINIC_HOME_BASE } from '@/config/clinic'
import type { DroneTelemetry } from '@/features/telemetry/droneTelemetry'
import type { TelemetryPoint } from '@/types/telemetry'
import { STATUS_STYLES } from '../statusStyles'
import { BaseMap } from './BaseMap'
import { DroneMarker } from './DroneMarker'
import { HomeBaseMarker } from './HomeBaseMarker'

interface Props {
  telemetry: DroneTelemetry
  history: TelemetryPoint[]
  className?: string
}

/**
 * Detail-page map: follows the drone and draws a breadcrumb trail of its
 * recent positions. Dragging the map turns following off; the button turns it back on.
 */
export function DroneTrackMap({ telemetry, history, className }: Props) {
  const [following, setFollowing] = useState(true)
  const { latest, status } = telemetry
  const position =
    latest?.lat != null && latest.lng != null ? { lat: latest.lat, lng: latest.lng } : null

  const trail: [number, number][] = history.flatMap((p) =>
    p.lat != null && p.lng != null ? [[p.lat, p.lng]] : [],
  )
  const trailColor = STATUS_STYLES[status === 'offline' ? 'offline' : 'in_flight'].color

  return (
    <div className="relative">
      <BaseMap center={position ?? CLINIC_HOME_BASE} zoom={12} className={className}>
        <HomeBaseMarker />
        <Polyline positions={trail} pathOptions={{ color: trailColor, weight: 3, opacity: 0.6 }} />
        {trail.map((p, i) => (
          <CircleMarker
            key={i}
            center={p}
            radius={2.5}
            pathOptions={{ color: trailColor, fillColor: trailColor, fillOpacity: 0.8, weight: 0 }}
          />
        ))}
        <DroneMarker telemetry={telemetry} />
        {position && <FollowPosition lat={position.lat} lng={position.lng} enabled={following} />}
        <StopFollowingOnDrag onDrag={() => setFollowing(false)} />
      </BaseMap>

      {!position && (
        <div className="absolute inset-x-0 top-3 z-[1000] mx-auto w-fit rounded-md bg-background/95 px-3 py-1.5 text-sm shadow">
          No GPS fix yet
        </div>
      )}
      {position && (
        <Button
          size="sm"
          variant={following ? 'default' : 'outline'}
          className="absolute top-3 right-3 z-[1000] shadow"
          onClick={() => setFollowing((f) => !f)}
          aria-pressed={following}
        >
          <Crosshair /> {following ? 'Following' : 'Follow drone'}
        </Button>
      )}
    </div>
  )
}

function FollowPosition({ lat, lng, enabled }: { lat: number; lng: number; enabled: boolean }) {
  const map = useMap()
  useEffect(() => {
    if (enabled) map.panTo([lat, lng], { animate: true })
  }, [lat, lng, enabled, map])
  return null
}

function StopFollowingOnDrag({ onDrag }: { onDrag: () => void }) {
  useMapEvents({ dragstart: onDrag })
  return null
}
