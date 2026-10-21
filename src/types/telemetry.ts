/**
 * One reading from a drone's carrier. Every sensor value can be null:
 * ThingSpeak fields are optional, and the GPS may not have a fix yet.
 */
export interface TelemetryPoint {
  timestamp: Date
  temperatureC: number | null
  lat: number | null
  lng: number | null
  speedMps: number | null
  batteryPct: number | null
}

/** A window of history ending "now". */
export interface TimeRange {
  minutes: number
}
