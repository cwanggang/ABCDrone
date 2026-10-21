import type { DroneList } from '@/types/drone'
import type { TelemetryPoint, TimeRange } from '@/types/telemetry'

/**
 * The only way the app reads drone data. Components never call an
 * implementation directly; they use the hooks in this folder, which get
 * the active provider from TelemetryContext.
 */
export interface TelemetryProvider {
  readonly source: 'mock' | 'thingspeak'
  listDrones(): Promise<DroneList>
  /** Most recent reading, or null if the drone has never reported. */
  getLatest(droneId: string): Promise<TelemetryPoint | null>
  /** Readings within the range, oldest first. */
  getHistory(droneId: string, range: TimeRange): Promise<TelemetryPoint[]>
}
