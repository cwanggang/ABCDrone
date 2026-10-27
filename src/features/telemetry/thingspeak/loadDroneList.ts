import type { SupabaseClient } from '@supabase/supabase-js'
import { z } from 'zod'
import type { Drone, DroneList } from '@/types/drone'

/** Shape of a `public.drones` row (see supabase/migrations). */
const DroneRowSchema = z.object({
  id: z.string(),
  name: z.string(),
  thingspeak_channel_id: z.string(),
  home_base_lat: z.number(),
  home_base_lng: z.number(),
})

function toDrone(row: z.infer<typeof DroneRowSchema>): Drone {
  return {
    id: row.id,
    name: row.name,
    thingspeakChannelId: row.thingspeak_channel_id,
    homeBase: { lat: row.home_base_lat, lng: row.home_base_lng },
  }
}

/**
 * Reads the drone registry from Supabase. If that isn't possible, returns the
 * static list instead, with `fallbackReason` set so the UI can say why
 * (DroneListSourceBanner). Never throws: a missing list would blank every page.
 */
export async function loadDroneList(
  client: SupabaseClient | null,
  fallbackDrones: Drone[],
): Promise<DroneList> {
  const fallback = (reason: string): DroneList => ({
    drones: fallbackDrones,
    source: 'static-fallback',
    fallbackReason: reason,
  })

  if (!client) return fallback('Supabase is not configured (VITE_SUPABASE_URL / _ANON_KEY).')

  try {
    // Without a session, row-level security silently returns zero rows rather
    // than an error. This happens with the dev auth bypass.
    const { data: session } = await client.auth.getSession()
    if (!session.session) return fallback('Not signed in to Supabase (is the dev auth bypass on?).')

    const { data, error } = await client
      .from('drones')
      .select('id, name, thingspeak_channel_id, home_base_lat, home_base_lng')
      .order('id')
    if (error) return fallback(`Supabase error: ${error.message}.`)

    const rows = z.array(DroneRowSchema).safeParse(data)
    if (!rows.success) return fallback('The Supabase drones table has an unexpected shape.')

    return { drones: rows.data.map(toDrone), source: 'supabase' }
  } catch (err) {
    return fallback(err instanceof Error ? err.message : String(err))
  }
}
