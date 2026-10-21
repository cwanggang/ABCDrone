import { STALE_AFTER_MS, STATUS_THRESHOLDS, type ThresholdConfig } from '@/config/telemetry'
import type { DroneStatus } from '@/types/drone'
import type { TelemetryPoint } from '@/types/telemetry'

/**
 * offline   → no reading in the last `offlineAfterMs`
 * in_flight → moving faster than `inFlightMinSpeedMps`
 * idle      → otherwise (parked at the clinic or landed at a pickup)
 */
export function deriveStatus(
  point: TelemetryPoint | null,
  now: number,
  thresholds: ThresholdConfig = STATUS_THRESHOLDS,
): DroneStatus {
  if (!point || now - point.timestamp.getTime() > thresholds.offlineAfterMs) return 'offline'
  if ((point.speedMps ?? 0) > thresholds.inFlightMinSpeedMps) return 'in_flight'
  return 'idle'
}

export function isStale(
  point: TelemetryPoint | null,
  now: number,
  staleAfterMs: number = STALE_AFTER_MS,
): boolean {
  return !point || now - point.timestamp.getTime() > staleAfterMs
}
