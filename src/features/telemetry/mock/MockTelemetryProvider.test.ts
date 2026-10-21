import { describe, expect, it } from 'vitest'
import { CLINIC_HOME_BASE } from '@/config/clinic'
import { distanceMeters } from '@/lib/geo'
import { deriveStatus } from '../deriveStatus'
import { MockTelemetryProvider } from './MockTelemetryProvider'

const NOW = Date.parse('2026-10-21T12:00:00Z')
const METERS_PER_MILE = 1609.34

function makeProvider(now = NOW) {
  return new MockTelemetryProvider({ now: () => now, latencyMs: 0 })
}

describe('MockTelemetryProvider', () => {
  it('lists 3–4 drones from the mock source', async () => {
    const list = await makeProvider().listDrones()
    expect(list.source).toBe('mock')
    expect(list.drones.length).toBeGreaterThanOrEqual(3)
    expect(list.drones.length).toBeLessThanOrEqual(4)
  })

  it('keeps the parked drone at the clinic and idle', async () => {
    const latest = await makeProvider().getLatest('blue-devil-1')
    expect(latest).not.toBeNull()
    expect(deriveStatus(latest, NOW)).toBe('idle')
    expect(latest!.lat).toBeCloseTo(CLINIC_HOME_BASE.lat)
    expect(latest!.lng).toBeCloseTo(CLINIC_HOME_BASE.lng)
  })

  it('shows the lost-contact drone as offline', async () => {
    const latest = await makeProvider().getLatest('blue-devil-4')
    expect(deriveStatus(latest, NOW)).toBe('offline')
  })

  it('never flies more than ~50 miles from the clinic', async () => {
    const provider = makeProvider()
    for (const id of ['blue-devil-2', 'blue-devil-3']) {
      const history = await provider.getHistory(id, { minutes: 24 * 60 })
      for (const p of history) {
        const miles =
          distanceMeters(CLINIC_HOME_BASE, { lat: p.lat!, lng: p.lng! }) / METERS_PER_MILE
        expect(miles).toBeLessThanOrEqual(50)
      }
    }
  })

  it('returns history oldest-first, 15 s apart, ending at the latest reading', async () => {
    const provider = makeProvider()
    const history = await provider.getHistory('blue-devil-2', { minutes: 5 })
    const latest = await provider.getLatest('blue-devil-2')

    expect(history.length).toBe(20) // 5 min / 15 s
    expect(history.at(-1)).toEqual(latest)
    for (let i = 1; i < history.length; i++) {
      expect(history[i]!.timestamp.getTime() - history[i - 1]!.timestamp.getTime()).toBe(15_000)
    }
  })

  it('mostly stays in the 2–8 °C range but sometimes leaves it', async () => {
    const history = await makeProvider().getHistory('blue-devil-2', { minutes: 6 * 60 })
    const outOfRange = history.filter((p) => p.temperatureC! < 2 || p.temperatureC! > 8)
    expect(outOfRange.length).toBeGreaterThan(0)
    expect(outOfRange.length / history.length).toBeLessThan(0.2)
  })

  it('rejects unknown drone ids', async () => {
    await expect(makeProvider().getLatest('nope')).rejects.toThrow(/Unknown drone/)
  })
})
