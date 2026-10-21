import { House, Plane, WifiOff, type LucideIcon } from 'lucide-react'
import type { DroneStatus } from '@/types/drone'

/**
 * One place for how each status looks. `color` is a hex value because
 * Leaflet and Recharts draw SVG and can't use Tailwind classes.
 * Status is never shown by color alone: there is always a label and icon.
 */
export const STATUS_STYLES: Record<
  DroneStatus,
  { label: string; color: string; icon: LucideIcon; badgeClass: string }
> = {
  in_flight: {
    label: 'In flight',
    color: '#2563eb',
    icon: Plane,
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  idle: {
    label: 'Idle',
    color: '#16a34a',
    icon: House,
    badgeClass: 'bg-green-50 text-green-700 border-green-200',
  },
  offline: {
    label: 'Offline',
    color: '#6b7280',
    icon: WifiOff,
    badgeClass: 'bg-gray-100 text-gray-700 border-gray-200',
  },
}

/** Used for temperature alerts on maps and charts. */
export const ALERT_COLOR = '#dc2626'
