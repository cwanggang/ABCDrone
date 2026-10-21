import { CLINIC_HOME_BASE } from '@/config/clinic'
import type { Drone } from '@/types/drone'
import type { LatLng } from '@/types/geo'

/** How a mock drone behaves. All times in ms. */
export interface MockDroneSpec {
  drone: Drone
  /** Null means the drone stays parked at the clinic. */
  flight: {
    destination: LatLng
    /** Time on the ground at the clinic between trips (battery swap). */
    groundTimeMs: number
    /** Time landed at the patient's home for pickup. */
    pickupTimeMs: number
    /** Shifts where in its loop the drone is, so drones are not in sync. */
    phaseOffsetMs: number
  } | null
  temperature: {
    /** How often a temperature excursion happens. */
    excursionPeriodMs: number
    /** +1 = gets too warm, -1 = gets too cold. */
    excursionDirection: 1 | -1
    excursionOffsetMs: number
  }
  /** If set, the drone stopped reporting this long before the app started. */
  lostContactMsBeforeStart?: number
  /** Staggers upload times so drones do not all update on the same tick. */
  sampleOffsetMs: number
}

const MIN = 60 * 1000

function drone(id: string, name: string): Drone {
  return { id, name, thingspeakChannelId: null, homeBase: CLINIC_HOME_BASE }
}

export const MOCK_DRONE_SPECS: MockDroneSpec[] = [
  {
    drone: drone('blue-devil-1', 'Blue Devil 1'),
    flight: null,
    temperature: { excursionPeriodMs: 11 * MIN, excursionDirection: 1, excursionOffsetMs: 3 * MIN },
    sampleOffsetMs: 0,
  },
  {
    // Raleigh, ~28 mi away
    drone: drone('blue-devil-2', 'Blue Devil 2'),
    flight: {
      destination: { lat: 35.7796, lng: -78.6382 },
      groundTimeMs: 4 * MIN,
      pickupTimeMs: 3 * MIN,
      phaseOffsetMs: 0,
    },
    temperature: { excursionPeriodMs: 7 * MIN, excursionDirection: 1, excursionOffsetMs: 0 },
    sampleOffsetMs: 4_000,
  },
  {
    // Sanford, ~39 mi away
    drone: drone('blue-devil-3', 'Blue Devil 3'),
    flight: {
      destination: { lat: 35.4799, lng: -79.1803 },
      groundTimeMs: 5 * MIN,
      pickupTimeMs: 3 * MIN,
      phaseOffsetMs: 37 * MIN,
    },
    temperature: {
      excursionPeriodMs: 13 * MIN,
      excursionDirection: -1,
      excursionOffsetMs: 5 * MIN,
    },
    sampleOffsetMs: 8_000,
  },
  {
    // Roxboro, ~27 mi away. Lost its cellular link mid-flight, so it shows as offline.
    drone: drone('blue-devil-4', 'Blue Devil 4'),
    flight: {
      destination: { lat: 36.3937, lng: -78.9828 },
      groundTimeMs: 4 * MIN,
      pickupTimeMs: 3 * MIN,
      phaseOffsetMs: 20 * MIN,
    },
    temperature: { excursionPeriodMs: 9 * MIN, excursionDirection: 1, excursionOffsetMs: 2 * MIN },
    lostContactMsBeforeStart: 10 * MIN,
    sampleOffsetMs: 11_000,
  },
]
