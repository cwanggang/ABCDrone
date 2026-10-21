import type { LatLng } from '@/types/geo'

/** Home base for all drones: Duke University Hospital, Durham NC. */
export const CLINIC_HOME_BASE: LatLng & { name: string } = {
  name: 'Duke University Hospital',
  lat: 36.0074,
  lng: -78.9378,
}
