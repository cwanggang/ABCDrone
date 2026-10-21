/**
 * Tunable numbers for how we interpret telemetry. Change them here and
 * the whole app (status badges, alerts, charts, mock data) follows.
 */

/**
 * Safe range for the saliva samples, in °C. Cold-chain default of 2–8 °C.
 * If this ever needs to differ per drone or per sample type, move it into
 * the Supabase `drones` table and read it from there.
 */
export const TEMPERATURE_SAFE_RANGE_C: TemperatureRange = { min: 2, max: 8 }

export const STATUS_THRESHOLDS: ThresholdConfig = {
  /** No update for this long → 'offline'. */
  offlineAfterMs: 2 * 60 * 1000,
  /** Speed above this → 'in_flight'. Small but non-zero to ignore GPS jitter while parked. */
  inFlightMinSpeedMps: 0.5,
}

/**
 * Data older than this is flagged as stale. ThingSpeak's free tier accepts
 * one update per 15 s, so 45 s means roughly three missed uploads.
 */
export const STALE_AFTER_MS = 45 * 1000

/** How often the UI polls for new telemetry. */
export const POLL_INTERVAL_MS = 5 * 1000

/** How much history the drone detail page shows (map trail + chart). */
export const HISTORY_WINDOW_MINUTES = 30

export interface ThresholdConfig {
  offlineAfterMs: number
  inFlightMinSpeedMps: number
}
export interface TemperatureRange {
  min: number
  max: number
}
