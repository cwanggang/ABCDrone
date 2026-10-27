import type { SupabaseClient } from '@supabase/supabase-js'
import { THINGSPEAK_API_URL } from '@/config/thingspeakFields'
import type { Drone, DroneList } from '@/types/drone'
import type { TelemetryPoint, TimeRange } from '@/types/telemetry'
import type { TelemetryProvider } from '../TelemetryProvider'
import { loadDroneList } from './loadDroneList'
import { parseFeedResponse } from './thingspeakSchema'

interface ThingSpeakOptions {
  /** Where the drone list comes from. Null means "use the static list". */
  supabase: SupabaseClient | null
  /** Used when Supabase can't be read (src/config/drones.ts). */
  fallbackDrones: Drone[]
  /** Read API keys by channel id. Channels without one are read as public. */
  readKeys: Record<string, string>
  /** Injected so tests don't hit the network. */
  fetch?: typeof fetch
  apiUrl?: string
}

const REQUEST_TIMEOUT_MS = 10_000

/**
 * Reads each drone's ThingSpeak channel. The drone list (which drone uses
 * which channel) comes from Supabase, falling back to the static list.
 *
 * Both reads use `/feeds.json`. We avoid `/feeds/last.json` because it
 * answers `-1` both for an empty channel and for a bad read key, and those
 * need different handling (null vs. an error).
 */
export class ThingSpeakTelemetryProvider implements TelemetryProvider {
  readonly source = 'thingspeak' as const
  private readonly options: ThingSpeakOptions
  private readonly fetch: typeof fetch
  /** Latest drone list, so getLatest/getHistory can find a drone's channel. */
  private droneList: Promise<DroneList> | null = null

  constructor(options: ThingSpeakOptions) {
    this.options = options
    // Bound so calling it as a method doesn't break the browser's `fetch`.
    this.fetch = options.fetch ?? fetch.bind(globalThis)
  }

  listDrones(): Promise<DroneList> {
    this.droneList = loadDroneList(this.options.supabase, this.options.fallbackDrones)
    return this.droneList
  }

  async getLatest(droneId: string): Promise<TelemetryPoint | null> {
    const points = await this.readFeed(droneId, { results: '1' })
    return points.at(-1) ?? null
  }

  getHistory(droneId: string, range: TimeRange): Promise<TelemetryPoint[]> {
    return this.readFeed(droneId, { minutes: String(range.minutes) })
  }

  private async readFeed(droneId: string, params: Record<string, string>) {
    const channelId = await this.channelFor(droneId)
    const url = new URL(
      `/channels/${encodeURIComponent(channelId)}/feeds.json`,
      this.options.apiUrl ?? THINGSPEAK_API_URL,
    )
    for (const [name, value] of Object.entries(params)) url.searchParams.set(name, value)
    const readKey = this.options.readKeys[channelId]
    if (readKey) url.searchParams.set('api_key', readKey)

    let response: Response
    try {
      response = await this.fetch(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) })
    } catch {
      throw new Error(`Couldn't reach ThingSpeak for channel ${channelId}. Check your connection.`)
    }
    if (!response.ok) {
      throw new Error(`ThingSpeak returned HTTP ${response.status} for channel ${channelId}.`)
    }
    // A non-JSON body becomes null, which parseFeedResponse reports as unexpected.
    const body: unknown = await response.json().catch(() => null)
    return parseFeedResponse(body, channelId)
  }

  private async channelFor(droneId: string): Promise<string> {
    const list = await (this.droneList ?? this.listDrones())
    const drone = list.drones.find((d) => d.id === droneId)
    if (!drone) throw new Error(`Unknown drone "${droneId}"`)
    if (!drone.thingspeakChannelId) {
      throw new Error(`${drone.name} has no ThingSpeak channel id set.`)
    }
    return drone.thingspeakChannelId
  }
}
