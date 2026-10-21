import type { Drone, DroneStatus } from '@/types/drone'
import type { TelemetryPoint } from '@/types/telemetry'
import { deriveStatus, isStale } from './deriveStatus'
import { getTemperatureAlert, type TemperatureAlert } from './temperature'

/** Everything the UI needs to show one drone right now. */
export interface DroneTelemetry {
  drone: Drone
  latest: TelemetryPoint | null
  status: DroneStatus
  /** True if the data is old, or the last poll failed. */
  isStale: boolean
  temperatureAlert: TemperatureAlert
}

export function toDroneTelemetry(
  drone: Drone,
  latest: TelemetryPoint | null,
  now: number,
  lastPollFailed: boolean,
): DroneTelemetry {
  return {
    drone,
    latest,
    status: deriveStatus(latest, now),
    isStale: lastPollFailed || isStale(latest, now),
    temperatureAlert: getTemperatureAlert(latest?.temperatureC ?? null),
  }
}

/**
 * Alerts only count while the drone is reporting. An offline drone's last
 * reading is shown, but we can't tell if it's still true.
 */
export function hasActiveTemperatureAlert(t: DroneTelemetry): boolean {
  return t.temperatureAlert !== null && t.status !== 'offline'
}
