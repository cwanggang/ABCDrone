import { describe, expect, it } from 'vitest'
import type { TelemetryPoint } from '@/types/telemetry'
import { deriveStatus, isStale } from './deriveStatus'

const NOW = Date.parse('2026-10-21T12:00:00Z')
const thresholds = { offlineAfterMs: 120_000, inFlightMinSpeedMps: 0.5 }

function point(secondsAgo: number, speedMps: number | null): TelemetryPoint {
  return {
    timestamp: new Date(NOW - secondsAgo * 1000),
    temperatureC: 5,
    lat: 36,
    lng: -78.9,
    speedMps,
    batteryPct: 90,
  }
}

describe('deriveStatus', () => {
  it('is offline when there is no reading at all', () => {
    expect(deriveStatus(null, NOW, thresholds)).toBe('offline')
  })

  it('is offline when the last reading is older than the threshold', () => {
    expect(deriveStatus(point(121, 15), NOW, thresholds)).toBe('offline')
  })

  it('is not offline exactly at the threshold', () => {
    expect(deriveStatus(point(120, 15), NOW, thresholds)).toBe('in_flight')
  })

  it('is in_flight when moving faster than the threshold', () => {
    expect(deriveStatus(point(5, 0.6), NOW, thresholds)).toBe('in_flight')
  })

  it('is idle when stationary or only GPS jitter', () => {
    expect(deriveStatus(point(5, 0), NOW, thresholds)).toBe('idle')
    expect(deriveStatus(point(5, 0.5), NOW, thresholds)).toBe('idle')
  })

  it('treats a missing speed as idle', () => {
    expect(deriveStatus(point(5, null), NOW, thresholds)).toBe('idle')
  })
})

describe('isStale', () => {
  it('is stale with no reading', () => {
    expect(isStale(null, NOW, 45_000)).toBe(true)
  })

  it('is fresh within the window and stale after it', () => {
    expect(isStale(point(44, 0), NOW, 45_000)).toBe(false)
    expect(isStale(point(46, 0), NOW, 45_000)).toBe(true)
  })
})
