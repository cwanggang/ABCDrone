import { CircleMarker, Tooltip } from 'react-leaflet'
import { CLINIC_HOME_BASE } from '@/config/clinic'

/** Small dark dot marking the clinic. */
export function HomeBaseMarker() {
  return (
    <CircleMarker
      center={[CLINIC_HOME_BASE.lat, CLINIC_HOME_BASE.lng]}
      radius={6}
      pathOptions={{ color: '#ffffff', weight: 2, fillColor: '#111827', fillOpacity: 1 }}
    >
      <Tooltip direction="bottom" offset={[0, 6]}>
        {CLINIC_HOME_BASE.name} (home base)
      </Tooltip>
    </CircleMarker>
  )
}
