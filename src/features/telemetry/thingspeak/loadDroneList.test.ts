import type { SupabaseClient } from '@supabase/supabase-js'
import { describe, expect, it } from 'vitest'
import type { Drone } from '@/types/drone'
import { loadDroneList } from './loadDroneList'

const FALLBACK: Drone[] = [
  { id: 'static-1', name: 'Static 1', thingspeakChannelId: '1', homeBase: { lat: 0, lng: 0 } },
]

interface FakeClientOptions {
  signedIn?: boolean
  rows?: unknown[]
  error?: { message: string } | null
}

/** Just enough of a Supabase client for loadDroneList. */
function fakeClient({ signedIn = true, rows = [], error = null }: FakeClientOptions) {
  return {
    auth: { getSession: async () => ({ data: { session: signedIn ? {} : null } }) },
    from: () => ({ select: () => ({ order: async () => ({ data: rows, error }) }) }),
  } as unknown as SupabaseClient
}

describe('loadDroneList', () => {
  it('maps Supabase rows to drones', async () => {
    const row = {
      id: 'blue-devil-1',
      name: 'Blue Devil 1',
      thingspeak_channel_id: '1234567',
      home_base_lat: 36.0074,
      home_base_lng: -78.9378,
    }
    const list = await loadDroneList(fakeClient({ rows: [row] }), FALLBACK)
    expect(list).toEqual({
      source: 'supabase',
      drones: [
        {
          id: 'blue-devil-1',
          name: 'Blue Devil 1',
          thingspeakChannelId: '1234567',
          homeBase: { lat: 36.0074, lng: -78.9378 },
        },
      ],
    })
  })

  it('falls back with a reason when Supabase fails', async () => {
    const cases = [
      { client: null, reason: /not configured/ },
      { client: fakeClient({ signedIn: false }), reason: /Not signed in/ },
      { client: fakeClient({ error: { message: 'boom' } }), reason: /boom/ },
      { client: fakeClient({ rows: [{ id: 1 }] }), reason: /unexpected shape/ },
    ]
    for (const { client, reason } of cases) {
      const list = await loadDroneList(client, FALLBACK)
      expect(list.source).toBe('static-fallback')
      expect(list.drones).toBe(FALLBACK)
      expect(list.fallbackReason).toMatch(reason)
    }
  })
})
