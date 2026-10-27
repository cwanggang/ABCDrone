import { CLINIC_HOME_BASE } from '@/config/clinic'
import type { Drone } from '@/types/drone'

/**
 * Built-in drone list, used only when the Supabase `drones` table can't be
 * read (Supabase not configured, network error, or the dev auth bypass is on
 * so there is no Supabase session). The UI shows a banner whenever this is used.
 *
 * Keep it in sync with the Supabase table. Channel ids aren't secret (read keys
 * are, see VITE_THINGSPEAK_READ_KEYS). Set a channel id to null for a drone
 * that doesn't have one yet; it will show an error instead of data.
 */
export const STATIC_DRONES: Drone[] = [
  // TODO(hardware): fill in real ThingSpeak channel ids.
  {
    id: 'blue-devil-1',
    name: 'Blue Devil 1',
    thingspeakChannelId: null,
    homeBase: CLINIC_HOME_BASE,
  },
]
