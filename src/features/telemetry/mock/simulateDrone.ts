import { TEMPERATURE_SAFE_RANGE_C } from '@/config/telemetry'
import { distanceMeters, interpolate } from '@/lib/geo'
import type { TelemetryPoint } from '@/types/telemetry'
import type { MockDroneSpec } from './mockDrones'

/** Matches ThingSpeak's free-tier limit of one update per 15 s. */
export const SAMPLE_INTERVAL_MS = 15_000
const CRUISE_SPEED_MPS = 18 // ~40 mph
const BATTERY_AT_LANDING_PCT = 40

/**
 * Deterministic pseudo-random number in [-1, 1]. Using a hash instead of
 * Math.random() means the same drone at the same time always produces the
 * same reading, so history and "latest" never disagree.
 */
function noise(seed: number, sampleIndex: number): number {
  const x = Math.sin(seed * 12.9898 + sampleIndex * 78.233) * 43758.5453
  return (x - Math.floor(x)) * 2 - 1
}

function seedOf(id: string): number {
  let h = 0
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) % 10_000
  return h
}

const mod = (a: number, n: number) => ((a % n) + n) % n

/**
 * The reading a mock drone would upload at time `t` (ms since epoch).
 * This is a pure function: no state, just math on the clock.
 */
export function simulateDrone(spec: MockDroneSpec, t: number): TelemetryPoint {
  const seed = seedOf(spec.drone.id)
  const k = Math.round(t / SAMPLE_INTERVAL_MS)
  const home = spec.drone.homeBase

  let position = home
  let speedMps = Math.abs(noise(seed + 1, k)) * 0.2 // GPS jitter while parked
  let batteryPct = 98 + noise(seed + 2, k)

  if (spec.flight) {
    const { destination, groundTimeMs, pickupTimeMs, phaseOffsetMs } = spec.flight
    const legMs = (distanceMeters(home, destination) / CRUISE_SPEED_MPS) * 1000
    const flightMs = 2 * legMs + pickupTimeMs
    const u = mod(t + phaseOffsetMs, groundTimeMs + flightMs) // time within the current loop

    if (u < groundTimeMs) {
      // On the ground at the clinic: battery being swapped/charged back to 100%.
      batteryPct = BATTERY_AT_LANDING_PCT + (100 - BATTERY_AT_LANDING_PCT) * (u / groundTimeMs)
    } else {
      const f = u - groundTimeMs // time since takeoff
      batteryPct = 100 - (100 - BATTERY_AT_LANDING_PCT) * (f / flightMs)
      const flyingSpeed = CRUISE_SPEED_MPS + noise(seed + 3, k) * 1.5
      if (f < legMs) {
        position = interpolate(home, destination, f / legMs)
        speedMps = flyingSpeed
      } else if (f < legMs + pickupTimeMs) {
        position = destination // landed at the patient's home
      } else {
        position = interpolate(destination, home, (f - legMs - pickupTimeMs) / legMs)
        speedMps = flyingSpeed
      }
    }
  }

  return {
    timestamp: new Date(t),
    temperatureC: simulateTemperature(spec, t, seed, k),
    lat: position.lat,
    lng: position.lng,
    speedMps,
    batteryPct: Math.max(0, Math.min(100, batteryPct)),
  }
}

/**
 * Hovers around the middle of the safe range, with an occasional ~2-minute
 * excursion that pushes it past the edge so the alert UI gets exercised.
 */
function simulateTemperature(spec: MockDroneSpec, t: number, seed: number, k: number): number {
  const { min, max } = TEMPERATURE_SAFE_RANGE_C
  const center = (min + max) / 2
  const width = max - min

  const drift = 0.2 * width * Math.sin((2 * Math.PI * t) / (9 * 60_000) + seed)
  const jitter = 0.03 * width * noise(seed + 4, k)

  const { excursionPeriodMs, excursionDirection, excursionOffsetMs } = spec.temperature
  const excursionWindowMs = 2 * 60_000
  const p = mod(t + excursionOffsetMs, excursionPeriodMs)
  const excursion =
    p < excursionWindowMs
      ? excursionDirection * 0.85 * width * Math.sin((Math.PI * p) / excursionWindowMs)
      : 0

  return Math.round((center + drift + jitter + excursion) * 100) / 100
}
