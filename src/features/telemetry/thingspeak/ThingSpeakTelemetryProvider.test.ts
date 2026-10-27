import { describe, expect, it, vi } from 'vitest'
import type { Drone } from '@/types/drone'
import { ThingSpeakTelemetryProvider } from './ThingSpeakTelemetryProvider'

const DRONES: Drone[] = [
  { id: 'bd-1', name: 'BD 1', thingspeakChannelId: '111', homeBase: { lat: 36, lng: -78.9 } },
  { id: 'bd-2', name: 'BD 2', thingspeakChannelId: null, homeBase: { lat: 36, lng: -78.9 } },
]

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status })
}

function makeProvider(fetchImpl: typeof fetch, readKeys: Record<string, string> = {}) {
  return new ThingSpeakTelemetryProvider({
    supabase: null,
    fallbackDrones: DRONES,
    readKeys,
    fetch: fetchImpl,
  })
}

const entry = (created_at: string, temp: string) => ({ created_at, field1: temp })

describe('ThingSpeakTelemetryProvider', () => {
  it('lists the static drones when Supabase is not configured', async () => {
    const list = await makeProvider(vi.fn()).listDrones()
    expect(list.source).toBe('static-fallback')
    expect(list.fallbackReason).toMatch(/not configured/)
    expect(list.drones).toEqual(DRONES)
  })

  it('reads the latest entry with the channel read key', async () => {
    const fetchMock = vi.fn<typeof fetch>(async () =>
      jsonResponse({ feeds: [entry('2026-10-27T14:00:00Z', '5.5')] }),
    )
    const latest = await makeProvider(fetchMock, { '111': 'KEY' }).getLatest('bd-1')

    expect(latest?.temperatureC).toBe(5.5)
    const url = new URL(String(fetchMock.mock.calls[0]![0]))
    expect(url.pathname).toBe('/channels/111/feeds.json')
    expect(url.searchParams.get('results')).toBe('1')
    expect(url.searchParams.get('api_key')).toBe('KEY')
  })

  it('returns null when the channel has no entries yet', async () => {
    const provider = makeProvider(async () => jsonResponse({ feeds: [] }))
    expect(await provider.getLatest('bd-1')).toBeNull()
  })

  it('reads history by minutes, without a key for public channels', async () => {
    const fetchMock = vi.fn<typeof fetch>(async () =>
      jsonResponse({
        feeds: [entry('2026-10-27T14:00:00Z', '5'), entry('2026-10-27T14:00:15Z', '6')],
      }),
    )
    const history = await makeProvider(fetchMock).getHistory('bd-1', { minutes: 30 })

    expect(history.map((p) => p.temperatureC)).toEqual([5, 6])
    const url = new URL(String(fetchMock.mock.calls[0]![0]))
    expect(url.searchParams.get('minutes')).toBe('30')
    expect(url.searchParams.has('api_key')).toBe(false)
  })

  it('gives readable errors', async () => {
    const failingFetch = async (): Promise<Response> => {
      throw new TypeError('Failed to fetch')
    }
    await expect(makeProvider(async () => jsonResponse(-1)).getLatest('bd-1')).rejects.toThrow(
      /read key/,
    )
    await expect(makeProvider(async () => jsonResponse({}, 500)).getLatest('bd-1')).rejects.toThrow(
      /HTTP 500/,
    )
    await expect(makeProvider(failingFetch).getLatest('bd-1')).rejects.toThrow(
      /Couldn't reach ThingSpeak/,
    )
    await expect(makeProvider(vi.fn()).getLatest('bd-2')).rejects.toThrow(/no ThingSpeak channel/)
    await expect(makeProvider(vi.fn()).getLatest('nope')).rejects.toThrow(/Unknown drone/)
  })
})
