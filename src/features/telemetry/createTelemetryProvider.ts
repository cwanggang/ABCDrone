import { STATIC_DRONES } from '@/config/drones'
import { env } from '@/config/env'
import { supabase } from '@/lib/supabase'
import { MockTelemetryProvider } from './mock/MockTelemetryProvider'
import { ThingSpeakTelemetryProvider } from './thingspeak/ThingSpeakTelemetryProvider'
import type { TelemetryProvider } from './TelemetryProvider'

/** Picks the implementation based on VITE_TELEMETRY_SOURCE. */
export function createTelemetryProvider(): TelemetryProvider {
  switch (env.telemetrySource) {
    case 'mock':
      return new MockTelemetryProvider()
    case 'thingspeak':
      return new ThingSpeakTelemetryProvider({
        supabase,
        fallbackDrones: STATIC_DRONES,
        readKeys: env.thingspeakReadKeys,
      })
  }
}
