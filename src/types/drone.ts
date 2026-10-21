import type { LatLng } from './geo'

/**
 * Derived from telemetry (see features/telemetry/deriveStatus.ts),
 * never stored. Thresholds live in config/telemetry.ts.
 */
export type DroneStatus = 'idle' | 'in_flight' | 'offline'

export interface Drone {
  id: string
  name: string
  /** ThingSpeak channel this drone's carrier writes to. Null for mock drones. */
  thingspeakChannelId: string | null
  homeBase: LatLng
}

/** Where the drone list came from, so the UI can warn when it is a fallback. */
export type DroneListSource = 'mock' | 'supabase' | 'static-fallback'

export interface DroneList {
  drones: Drone[]
  source: DroneListSource
  /** Set when we fell back to the static list; explains why (shown in the UI). */
  fallbackReason?: string
}
