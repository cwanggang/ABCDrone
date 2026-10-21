import type { ReactNode } from 'react'
import { MapContainer, TileLayer } from 'react-leaflet'
import { cn } from '@/lib/utils'
import type { LatLng } from '@/types/geo'

interface Props {
  center: LatLng
  zoom: number
  children?: ReactNode
  className?: string
}

/**
 * Leaflet map with OpenStreetMap tiles. `isolate` keeps Leaflet's high
 * z-indexes from covering our menus and the mobile sidebar.
 */
export function BaseMap({ center, zoom, children, className }: Props) {
  return (
    <div className={cn('relative isolate overflow-hidden rounded-xl border', className)}>
      <MapContainer center={[center.lat, center.lng]} zoom={zoom} className="size-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {children}
      </MapContainer>
    </div>
  )
}
